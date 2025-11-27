const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyFirebaseToken, checkUserRole } = require('../middleware/firebaseAuth');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to find or create user in local database
const findOrCreateUser = async (firebaseUser) => {
  let user = await prisma.user.findUnique({
    where: { email: firebaseUser.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: firebaseUser.email,
        firstName: firebaseUser.name?.split(' ')[0] || firebaseUser.email.split('@')[0],
        lastName: firebaseUser.name?.split(' ').slice(1).join(' ') || '',
        password: 'firebase_auth', // Placeholder since we use Firebase
        role: firebaseUser.userData?.role || 'BUSINESS_OWNER',
        isActive: true
      }
    });
  }

  return user;
};

// Test route without authentication
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Business routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Validation rules
const businessValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Business name is required and must be less than 100 characters'),
  body('type').trim().isLength({ min: 1, max: 50 }).withMessage('Business type is required'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('phone').optional().trim().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Phone must be a valid phone number'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
  body('brandColor').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Brand color must be a valid hex color'),
  body('customMessage').optional().trim().isLength({ max: 300 }).withMessage('Custom message must be less than 300 characters'),
  body('logo').optional().isString().withMessage('Logo must be a valid string'),
  body('enableSmartFilter').optional().custom((value) => {
    if (value !== undefined && value !== null) {
      // Accept true, false, 'true', 'false', 1, 0
      if (value === true || value === false || value === 'true' || value === 'false' || value === 1 || value === 0) {
        return true;
      }
      throw new Error('Smart filter must be a boolean value');
    }
    return true;
  }).withMessage('Smart filter must be a boolean value'),
  // More lenient validation for Google Review URL
  body('googleReviewUrl').optional().custom((value) => {
    if (value && value.trim()) {
      // Just check if it starts with http/https and contains google or g.page
      if (typeof value !== 'string' || (!value.startsWith('http://') && !value.startsWith('https://'))) {
        throw new Error('Google Review URL must start with http:// or https://');
      }
      
      // Simple check for Google-related domains
      const lowerValue = value.toLowerCase();
      if (!lowerValue.includes('google') && !lowerValue.includes('g.page')) {
        throw new Error('URL must be from a Google domain (google.com, g.page, share.google, etc.)');
      }
    }
    return true;
  }).withMessage('Google Review URL must be a valid Google URL')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('=== BUSINESS VALIDATION ERRORS ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    console.log('Specific field values:');
    console.log('- googleReviewUrl:', req.body.googleReviewUrl);
    console.log('- enableSmartFilter:', req.body.enableSmartFilter, typeof req.body.enableSmartFilter);
    console.log('=== END VALIDATION ERRORS ===');
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Get all businesses for the authenticated user
router.get('/', verifyFirebaseToken, checkUserRole(), async (req, res) => {
  try {
    const userRole = req.user.userData?.role;
    let businesses;

    if (userRole === 'SUPER_ADMIN') {
      // Super admin can see all businesses
      businesses = await prisma.business.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              customers: true,
              reviews: true,
              qrCodes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Business owners can only see their own businesses
      // Find or create user in local database based on Firebase UID
      const user = await findOrCreateUser(req.user);

      businesses = await prisma.business.findMany({
        where: {
          userId: user.id
        },
        include: {
          _count: {
            select: {
              customers: true,
              reviews: true,
              qrCodes: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    res.json({
      success: true,
      data: businesses
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching businesses',
      error: error.message
    });
  }
});

// Get a specific business by ID
router.get('/:id', verifyFirebaseToken, checkUserRole(), param('id').isString(), async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.userData?.role;

    let business;

    if (userRole === 'SUPER_ADMIN') {
      business = await prisma.business.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              customers: true,
              reviews: true,
              qrCodes: true
            }
          }
        }
      });
    } else {
      // Verify ownership for business owners
      const user = await findOrCreateUser(req.user);

      business = await prisma.business.findFirst({
        where: {
          id,
          userId: user.id
        },
        include: {
          _count: {
            select: {
              customers: true,
              reviews: true,
              qrCodes: true
            }
          }
        }
      });
    }

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business'
    });
  }
});

// Create a new business
router.post('/', verifyFirebaseToken, checkUserRole(), businessValidation, handleValidationErrors, async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      website,
      phone,
      address,
      brandColor,
      customMessage,
      googleReviewUrl,
      logo,
      enableSmartFilter = false
    } = req.body;

    // Find or create user in local database
    const user = await findOrCreateUser(req.user);

    const business = await prisma.business.create({
      data: {
        userId: user.id,
        name,
        type,
        description,
        website,
        phone,
        address,
        brandColor: brandColor || '#3B82F6',
        customMessage,
        googleReviewUrl,
        logo,
        enableSmartFilter,
        isPublished: true // Auto-publish new businesses
      },
      include: {
        _count: {
          select: {
            customers: true,
            reviews: true,
            qrCodes: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: business
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating business'
    });
  }
});

// Update a business
router.put('/:id', verifyFirebaseToken, checkUserRole(), param('id').isString(), businessValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      description,
      website,
      phone,
      address,
      brandColor,
      customMessage,
      googleReviewUrl,
      logo,
      isPublished,
      enableSmartFilter
    } = req.body;

    const userRole = req.user.userData?.role;

    // Check ownership for business owners
    if (userRole !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { email: req.user.email }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const existingBusiness = await prisma.business.findFirst({
        where: {
          id,
          userId: user.id
        }
      });

      if (!existingBusiness) {
        return res.status(404).json({
          success: false,
          message: 'Business not found or access denied'
        });
      }
    }

    // Convert enableSmartFilter to proper boolean
    const smartFilterValue = enableSmartFilter === true || enableSmartFilter === 'true' || enableSmartFilter === 1;
    
    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        name,
        type,
        description,
        website,
        phone,
        address,
        brandColor,
        customMessage,
        googleReviewUrl,
        logo,
        enableSmartFilter: smartFilterValue,
        isPublished
      },
      include: {
        _count: {
          select: {
            customers: true,
            reviews: true,
            qrCodes: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Business updated successfully',
      data: updatedBusiness
    });
  } catch (error) {
    console.error('Error updating business:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating business'
    });
  }
});

// Delete a business
router.delete('/:id', verifyFirebaseToken, checkUserRole(), param('id').isString(), async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.userData?.role;

    // Check ownership for business owners
    if (userRole !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { email: req.user.email }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const existingBusiness = await prisma.business.findFirst({
        where: {
          id,
          userId: user.id
        }
      });

      if (!existingBusiness) {
        return res.status(404).json({
          success: false,
          message: 'Business not found or access denied'
        });
      }
    }

    await prisma.business.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting business'
    });
  }
});

// Toggle business publication status
router.patch('/:id/publish', verifyFirebaseToken, checkUserRole(), param('id').isString(), async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.userData?.role;

    // Check ownership for business owners
    if (userRole !== 'SUPER_ADMIN') {
      const user = await prisma.user.findUnique({
        where: { email: req.user.email }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const existingBusiness = await prisma.business.findFirst({
        where: {
          id,
          userId: user.id
        }
      });

      if (!existingBusiness) {
        return res.status(404).json({
          success: false,
          message: 'Business not found or access denied'
        });
      }
    }

    const business = await prisma.business.findUnique({
      where: { id },
      select: { isPublished: true }
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const updatedBusiness = await prisma.business.update({
      where: { id },
      data: {
        isPublished: !business.isPublished
      }
    });

    res.json({
      success: true,
      message: `Business ${updatedBusiness.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { isPublished: updatedBusiness.isPublished }
    });
  } catch (error) {
    console.error('Error toggling business publication:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling business publication'
    });
  }
});

module.exports = router;