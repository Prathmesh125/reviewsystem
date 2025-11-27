const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all form templates for a business
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { businessId } = req.query;
    
    // Use businessId from query params or fallback to user's business
    const targetBusinessId = businessId || req.user.businessId;
    
    const templates = await prisma.formTemplate.findMany({
      where: { businessId: targetBusinessId },
      include: { 
        fields: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching form templates:', error);
    res.status(500).json({ error: 'Failed to fetch form templates' });
  }
});

// Get form template by ID
router.get('/:templateId', verifyFirebaseToken, async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await prisma.formTemplate.findFirst({
      where: {
        id: templateId,
        businessId: req.user.businessId
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        business: true
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Form template not found' });
    }

    res.json(template);

  } catch (error) {
    console.error('Error fetching form template:', error);
    res.status(500).json({ error: 'Failed to fetch form template' });
  }
});

// Get public form template (for customer-facing forms)
router.get('/public/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    // Get business with active form template
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        isPublished: true
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found or not accepting reviews' });
    }

    let template = null;

    // If business has an active form, get it
    if (business.activeFormId) {
      template = await prisma.formTemplate.findFirst({
        where: {
          id: business.activeFormId,
          businessId,
          isActive: true
        },
        include: {
          fields: {
            orderBy: { order: 'asc' }
          }
        }
      });
    }

    // If no active form ID set, try to find any existing active template
    if (!template) {
      template = await prisma.formTemplate.findFirst({
        where: {
          businessId,
          isActive: true
        },
        include: {
          fields: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { updatedAt: 'desc' } // Get the most recently updated template
      });
    }

    // If still no template found, create a default one
    if (!template) {
      template = await createDefaultFormTemplate(businessId);
    }

    // Parse template settings to get form-specific Google Review URL
    let templateSettings = {};
    try {
      templateSettings = template.settings ? 
        (typeof template.settings === 'string' ? JSON.parse(template.settings) : template.settings) 
        : {};
    } catch (e) {
      console.warn('Could not parse template settings:', e);
      templateSettings = {};
    }

    // Priority: Template Google Review URL > Business Google Review URL
    const finalGoogleReviewUrl = templateSettings.googleReviewUrl || business.googleReviewUrl;
    const finalCustomMessage = templateSettings.customThankYouMessage || business.customMessage;

    console.log('=== GOOGLE REVIEW URL DEBUG ===');
    console.log('Business ID:', business.id);
    console.log('Template ID:', template.id);
    console.log('Template settings:', templateSettings);
    console.log('Business googleReviewUrl:', business.googleReviewUrl);
    console.log('Template googleReviewUrl:', templateSettings.googleReviewUrl);
    console.log('Final googleReviewUrl:', finalGoogleReviewUrl);
    console.log('=== END DEBUG ===');

    res.json({
      business: {
        id: business.id,
        name: business.name,
        type: business.type,
        description: business.description,
        brandColor: business.brandColor,
        logo: business.logo,
        customMessage: finalCustomMessage,
        googleReviewUrl: finalGoogleReviewUrl,
        enableSmartFilter: business.enableSmartFilter || false
      },
      template
    });

  } catch (error) {
    console.error('Error fetching public form template:', error);
    res.status(500).json({ error: 'Failed to fetch form template' });
  }
});

// Create a new form template
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { name, description, settings, fields, businessId } = req.body;
    
    if (!name || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ error: 'Name and fields are required' });
    }

    // Use businessId from request or fallback to user's business
    const targetBusinessId = businessId || req.user.businessId;
    
    console.log('Creating form template:', { name, description, targetBusinessId, fieldsCount: fields.length });
    console.log('=== BACKEND TEMPLATE SAVE DEBUG ===');
    console.log('Received settings:', settings);
    console.log('Settings type:', typeof settings);
    console.log('Parsed settings:', settings ? JSON.parse(settings) : 'null');
    console.log('=== END BACKEND DEBUG ===');

    const template = await prisma.formTemplate.create({
      data: {
        name,
        description: description || '',
        settings: settings || '{}',
        businessId: targetBusinessId,
        fields: {
          create: fields.map((field, index) => ({
            fieldType: field.fieldType || field.type,
            label: field.label,
            placeholder: field.placeholder || '',
            isRequired: field.isRequired || field.required || false,
            order: field.order !== undefined ? field.order : index,
            options: field.options ? (typeof field.options === 'string' ? field.options : JSON.stringify(field.options)) : null,
            validation: field.validation ? (typeof field.validation === 'string' ? field.validation : JSON.stringify(field.validation)) : '{}',
            styling: field.styling ? (typeof field.styling === 'string' ? field.styling : JSON.stringify(field.styling)) : '{}'
          }))
        }
      },
      include: { 
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log('Form template created successfully:', template.id);

    // Auto-publish the business when a form template is created
    await prisma.business.update({
      where: { id: targetBusinessId },
      data: { 
        isPublished: true,
        activeFormId: template.id 
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating form template:', error);
    res.status(500).json({ error: 'Failed to create form template' });
  }
});

// Update a form template
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, settings, fields, isActive, businessId } = req.body;

    console.log('Updating form template:', { id, name, businessId });

    if (!id) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // Use businessId from request or fallback to user's business
    const targetBusinessId = businessId || req.user.businessId;

    // First check if template exists and belongs to this business
    const existingTemplate = await prisma.formTemplate.findFirst({
      where: { 
        id: id,
        businessId: targetBusinessId
      }
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Form template not found' });
    }

    console.log('Updating form template:', { id, name, fieldsCount: fields?.length });
    console.log('=== BACKEND TEMPLATE UPDATE DEBUG ===');
    console.log('Received settings:', settings);
    console.log('Settings type:', typeof settings);
    if (settings) {
      try {
        console.log('Parsed settings:', JSON.parse(settings));
      } catch (e) {
        console.log('Could not parse settings:', e);
      }
    }
    console.log('=== END BACKEND UPDATE DEBUG ===');

    // If activating this template, deactivate others
    if (isActive) {
      await prisma.formTemplate.updateMany({
        where: { businessId: targetBusinessId },
        data: { isActive: false }
      });
    }

    // Delete existing fields if new fields are provided
    if (fields && Array.isArray(fields)) {
      await prisma.formField.deleteMany({
        where: { templateId: id }
      });
    }

    // Update template
    const template = await prisma.formTemplate.update({
      where: { id: id },
      data: {
        name: name || existingTemplate.name,
        description: description !== undefined ? description : existingTemplate.description,
        settings: settings || existingTemplate.settings,
        isActive: isActive !== undefined ? isActive : existingTemplate.isActive,
        ...(fields && Array.isArray(fields) && {
          fields: {
            create: fields.map((field, index) => ({
              fieldType: field.fieldType || field.type,
              label: field.label,
              placeholder: field.placeholder || '',
              isRequired: field.isRequired || field.required || false,
              order: field.order !== undefined ? field.order : index,
              options: field.options ? (typeof field.options === 'string' ? field.options : JSON.stringify(field.options)) : null,
              validation: field.validation ? (typeof field.validation === 'string' ? field.validation : JSON.stringify(field.validation)) : '{}',
              styling: field.styling ? (typeof field.styling === 'string' ? field.styling : JSON.stringify(field.styling)) : '{}'
            }))
          }
        })
      },
      include: { 
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log('Form template updated successfully:', template.id);

    // Auto-publish the business when a form template is updated
    await prisma.business.update({
      where: { id: targetBusinessId },
      data: { 
        isPublished: true,
        activeFormId: template.id 
      }
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating form template:', error);
    res.status(500).json({ error: 'Failed to update form template' });
  }
});

// Set active form template for business
router.put('/:templateId/activate', verifyFirebaseToken, async (req, res) => {
  try {
    const { templateId } = req.params;

    // Verify template belongs to user's business
    const template = await prisma.formTemplate.findFirst({
      where: {
        id: templateId,
        businessId: req.user.businessId
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Form template not found' });
    }

    // Update business to use this template
    await prisma.business.update({
      where: { id: template.businessId },
      data: { activeFormId: templateId }
    });

    res.json({ message: 'Form template activated successfully' });

  } catch (error) {
    console.error('Error activating form template:', error);
    res.status(500).json({ error: 'Failed to activate form template' });
  }
});

// Delete a form template
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    console.log('Deleting form template:', { id, userId: req.user.uid });

    // First find the template to check ownership
    const existingTemplate = await prisma.formTemplate.findFirst({
      where: { id: id },
      include: { business: true }
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Form template not found' });
    }

    // Check if user has access to this business
    // For now, we'll allow deletion if template exists (you can add more access control later)
    
    // Delete the template (fields will be deleted due to cascade)
    await prisma.formTemplate.delete({
      where: { id: id }
    });

    console.log('Form template deleted successfully:', id);
    res.json({ message: 'Form template deleted successfully' });
  } catch (error) {
    console.error('Error deleting form template:', error);
    res.status(500).json({ error: 'Failed to delete form template' });
  }
});

// Helper function to create default form template
async function createDefaultFormTemplate(businessId) {
  // Get the business to inherit its settings
  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });

  const defaultFields = [
    {
      fieldType: 'text',
      label: 'Your Name',
      placeholder: 'Enter your full name',
      isRequired: true,
      order: 0
    },
    {
      fieldType: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      isRequired: true,
      order: 1
    },
    {
      fieldType: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      isRequired: false,
      order: 2
    },
    {
      fieldType: 'rating',
      label: 'Rate Your Experience',
      placeholder: '',
      isRequired: true,
      order: 3
    },
    {
      fieldType: 'textarea',
      label: 'Tell us about your experience',
      placeholder: 'Share your feedback...',
      isRequired: true,
      order: 4
    }
  ];

  // Include business Google Review URL in template settings
  const defaultSettings = {
    theme: 'modern',
    showProgressBar: true,
    multiStep: true,
    googleReviewUrl: business?.googleReviewUrl || '',
    customThankYouMessage: business?.customMessage || ''
  };

  const template = await prisma.formTemplate.create({
    data: {
      businessId,
      name: 'Default Review Form',
      description: 'Default form template for collecting customer reviews',
      settings: JSON.stringify(defaultSettings),
      fields: {
        create: defaultFields
      }
    },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  });

  // Set as active form for the business
  await prisma.business.update({
    where: { id: businessId },
    data: { activeFormId: template.id }
  });

  return template;
}

module.exports = router;