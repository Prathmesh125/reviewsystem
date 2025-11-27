import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { toast } from 'react-hot-toast';
import businessAPI from '../../services/businessAPI';
import QRCode from 'react-qr-code';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Copy, 
  Settings, 
  Save,
  GripVertical,
  Star,
  Type,
  Mail,
  Phone,
  MessageSquare,
  CheckSquare,
  List,
  X,
  Share2,
  ExternalLink,
  QrCode,
  Download
} from 'lucide-react';

const FormBuilder = ({ businessId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  
  // Form builder state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  
    // Form customization settings
  const [formSettings, setFormSettings] = useState({
    theme: 'modern',
    primaryColor: '#3B82F6',
    secondaryColor: '#F3F4F6',
    fontFamily: 'Inter',
    borderRadius: 'rounded-lg',
    spacing: 'normal',
    showProgress: true,
    showStepNumbers: true,
    animationType: 'slide',
    googleReviewUrl: '', // Google Review URL for redirection after form submission
    customThankYouMessage: '' // Custom thank you message
  });

  // Available field types with enhanced configuration
  const fieldTypes = [
    { 
      type: 'text', 
      icon: Type, 
      label: 'Text Input', 
      description: 'Single line text',
      validationRules: ['required', 'minLength', 'maxLength', 'pattern']
    },
    { 
      type: 'email', 
      icon: Mail, 
      label: 'Email', 
      description: 'Email address',
      validationRules: ['required', 'email']
    },
    { 
      type: 'phone', 
      icon: Phone, 
      label: 'Phone', 
      description: 'Phone number',
      validationRules: ['required', 'phone']
    },
    { 
      type: 'textarea', 
      icon: MessageSquare, 
      label: 'Text Area', 
      description: 'Multi-line text',
      validationRules: ['required', 'minLength', 'maxLength']
    },
    { 
      type: 'rating', 
      icon: Star, 
      label: 'Star Rating', 
      description: '5-star rating',
      validationRules: ['required']
    },
    { 
      type: 'dropdown', 
      icon: List, 
      label: 'Dropdown', 
      description: 'Select from options',
      validationRules: ['required'],
      requiresOptions: true
    },
    { 
      type: 'checkbox', 
      icon: CheckSquare, 
      label: 'Checkbox', 
      description: 'Multiple choices',
      validationRules: ['required', 'minSelected', 'maxSelected'],
      requiresOptions: true
    }
  ];

  // Load form templates and business data
  useEffect(() => {
    if (businessId) {
      // Reset all state when business changes to prevent cross-contamination
      setActiveTemplate(null);
      setIsCreatingNew(false);
      setFormName('');
      setFormDescription('');
      setTemplates([]);
      setFields([]);
      setSelectedField(null);
      setShowFieldEditor(false);
      
      setFormSettings({
        theme: 'modern',
        primaryColor: '#3B82F6',
        secondaryColor: '#F3F4F6',
        fontFamily: 'Inter',
        borderRadius: 'rounded-lg',
        spacing: 'normal',
        showProgress: true,
        showStepNumbers: true,
        animationType: 'slide',
        googleReviewUrl: '', // Reset to empty
        customThankYouMessage: ''
      });
      
      // Load business data first, then templates
      loadBusinessData().then(() => {
        loadTemplates();
      });
    }
  }, [businessId]);
  
  const loadBusinessData = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3001/api/business/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const business = await response.json();
        // Update form settings with existing Google Review URL
        setFormSettings(prev => ({
          ...prev,
          googleReviewUrl: business.googleReviewUrl || ''
        }));
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3001/api/form-templates?businessId=${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        
        // Load first template if exists and user is not creating a new template
        if (data.length > 0 && !activeTemplate && !isCreatingNew) {
          loadTemplate(data[0]);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load form templates');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = (template) => {
    setActiveTemplate(template);
    setIsCreatingNew(false);
    setFormName(template.name);
    setFormDescription(template.description || '');
    
    // Parse template settings
    try {
      const settings = typeof template.settings === 'string' 
        ? JSON.parse(template.settings) 
        : template.settings;
      
      console.log('=== TEMPLATE LOADING DEBUG ===');
      console.log('Template ID:', template.id);
      console.log('Raw template settings:', template.settings);
      console.log('Parsed settings:', settings);
      console.log('Google Review URL from template:', settings?.googleReviewUrl);
      console.log('=== END TEMPLATE LOADING DEBUG ===');
      
      // Properly merge settings - preserve current Google Review URL if template doesn't have one
      setFormSettings(prev => {
        const newSettings = {
          ...prev,
          ...settings
        };
        
        // If template doesn't have googleReviewUrl, keep the current one (from business)
        if (!settings?.googleReviewUrl && prev.googleReviewUrl) {
          newSettings.googleReviewUrl = prev.googleReviewUrl;
        }
        
        console.log('=== FORM SETTINGS MERGE DEBUG ===');
        console.log('Previous googleReviewUrl:', prev.googleReviewUrl);
        console.log('Template googleReviewUrl:', settings?.googleReviewUrl);
        console.log('Final googleReviewUrl:', newSettings.googleReviewUrl);
        console.log('=== END MERGE DEBUG ===');
        
        return newSettings;
      });
    } catch (e) {
      console.warn('Could not parse template settings:', e);
    }
    
    // Load fields with proper structure
    const loadedFields = template.fields.map((field, index) => ({
      id: field.id || `field-${Date.now()}-${index}`,
      fieldType: field.fieldType,
      label: field.label,
      placeholder: field.placeholder || '',
      isRequired: field.isRequired,
      order: field.order,
      validation: typeof field.validation === 'string' 
        ? JSON.parse(field.validation || '{}') 
        : field.validation || {},
      styling: typeof field.styling === 'string' 
        ? JSON.parse(field.styling || '{}') 
        : field.styling || {},
      conditional: typeof field.conditional === 'string' 
        ? JSON.parse(field.conditional || '{}') 
        : field.conditional || {},
      options: field.options ? (
        typeof field.options === 'string' 
          ? JSON.parse(field.options) 
          : field.options
      ) : null
    }));
    
    setFields(loadedFields);
    setSelectedField(null);
    setShowFieldEditor(false);
  };

  const createNewTemplate = async () => {
    setActiveTemplate(null);
    setIsCreatingNew(true);
    setFormName('New Review Form');
    setFormDescription('');
    
    // Load business data to get current Google Review URL
    let businessGoogleReviewUrl = '';
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3001/api/business/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const business = await response.json();
        businessGoogleReviewUrl = business.googleReviewUrl || '';
      }
    } catch (error) {
      console.error('Error loading business data for new template:', error);
    }
    
    setFormSettings({
      theme: 'modern',
      primaryColor: '#3B82F6',
      secondaryColor: '#F3F4F6',
      fontFamily: 'Inter',
      borderRadius: 'rounded-lg',
      spacing: 'normal',
      showProgress: true,
      showStepNumbers: true,
      animationType: 'slide',
      submitButtonText: 'Submit Review',
      brandingEnabled: true,
      googleReviewUrl: businessGoogleReviewUrl, // Inherit from business
      customThankYouMessage: ''
    });
    setFields([
      {
        id: `field-${Date.now()}-1`,
        fieldType: 'text',
        label: 'Your Name',
        placeholder: 'Enter your full name',
        isRequired: true,
        order: 0,
        validation: { rules: { required: true }, errorMessages: {} },
        styling: { width: 'full', size: 'md', variant: 'default' },
        conditional: { enabled: false, conditions: [] }
      },
      {
        id: `field-${Date.now()}-2`,
        fieldType: 'email',
        label: 'Email Address',
        placeholder: 'Enter your email',
        isRequired: true,
        order: 1,
        validation: { rules: { required: true, email: true }, errorMessages: {} },
        styling: { width: 'full', size: 'md', variant: 'default' },
        conditional: { enabled: false, conditions: [] }
      },
      {
        id: `field-${Date.now()}-3`,
        fieldType: 'rating',
        label: 'Rate Your Experience',
        placeholder: '',
        isRequired: true,
        order: 2,
        validation: { rules: { required: true }, errorMessages: {} },
        styling: { width: 'full', size: 'lg', variant: 'default' },
        conditional: { enabled: false, conditions: [] }
      },
      {
        id: `field-${Date.now()}-4`,
        fieldType: 'textarea',
        label: 'Tell us about your experience',
        placeholder: 'Share your feedback...',
        isRequired: true,
        order: 3,
        validation: { rules: { required: true, minLength: 10 }, errorMessages: {} },
        styling: { width: 'full', size: 'md', variant: 'default' },
        conditional: { enabled: false, conditions: [] }
      }
    ]);
    setSelectedField(null);
    setShowFieldEditor(false);
  };

  const addField = (fieldType) => {
    const fieldConfig = fieldTypes.find(ft => ft.type === fieldType);
    const newField = {
      id: `field-${Date.now()}-${Math.random()}`,
      fieldType,
      label: `New ${fieldConfig.label}`,
      placeholder: `Enter ${fieldType}...`,
      isRequired: false,
      order: fields.length,
      validation: {
        rules: {},
        errorMessages: {}
      },
      styling: {
        width: 'full',
        size: 'md',
        variant: 'default'
      },
      conditional: {
        enabled: false,
        conditions: []
      },
      options: fieldConfig.requiresOptions ? [
        { id: 1, label: 'Option 1', value: 'option1' },
        { id: 2, label: 'Option 2', value: 'option2' }
      ] : null
    };
    
    setFields([...fields, newField]);
    setSelectedField(newField);
    setShowFieldEditor(true);
  };

  const updateField = (fieldId, updates) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(prev => ({ ...prev, ...updates }));
    }
  };

  const removeField = (fieldId) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField && selectedField.id === fieldId) {
      setSelectedField(null);
      setShowFieldEditor(false);
    }
  };

  const duplicateField = (fieldId) => {
    const fieldToDuplicate = fields.find(field => field.id === fieldId);
    if (fieldToDuplicate) {
      const newField = {
        ...fieldToDuplicate,
        id: `field-${Date.now()}-${Math.random()}`,
        label: `${fieldToDuplicate.label} (Copy)`,
        order: fields.length
      };
      setFields([...fields, newField]);
    }
  };

  const saveTemplate = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a form name');
      return;
    }

    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    if (!businessId) {
      toast.error('Business ID is required');
      return;
    }

    try {
      setSaving(true);
      const token = await user.getIdToken();
      
      const templateData = {
        name: formName,
        description: formDescription,
        settings: JSON.stringify(formSettings),
        businessId: businessId,
        fields: fields.map(field => ({
          fieldType: field.fieldType,
          label: field.label,
          placeholder: field.placeholder || '',
          isRequired: field.isRequired,
          order: field.order,
          options: field.options ? JSON.stringify(field.options) : null,
          validation: JSON.stringify(field.validation || {}),
          styling: JSON.stringify(field.styling || {})
        }))
      };

      console.log('=== TEMPLATE SAVE DEBUG ===');
      console.log('Form Settings:', formSettings);
      console.log('Google Review URL in formSettings:', formSettings.googleReviewUrl);
      console.log('Stringified settings:', JSON.stringify(formSettings));
      console.log('Template Data:', templateData);
      console.log('=== END TEMPLATE SAVE DEBUG ===');

      const url = activeTemplate 
        ? `http://localhost:3001/api/form-templates/${activeTemplate.id}`
        : 'http://localhost:3001/api/form-templates';
      
      const method = activeTemplate ? 'PUT' : 'POST';

      console.log('Saving form template:', { method, url, templateData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const saved = await response.json();
        
        // Note: We're not updating the business table anymore since the backend
        // correctly prioritizes template settings over business settings
        
        toast.success(activeTemplate ? 'Form updated successfully!' : 'Form created successfully!');
        
        // Set as active and clear creating new flag
        setActiveTemplate(saved);
        setIsCreatingNew(false);
        
        // Reload templates list but don't auto-load any template
        try {
          const token = await user.getIdToken();
          const response = await fetch(`http://localhost:3001/api/form-templates?businessId=${businessId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setTemplates(data);
            
            // Parse and update the current form settings with the saved template
            try {
              const settings = typeof saved.settings === 'string' 
                ? JSON.parse(saved.settings) 
                : saved.settings;
              
              setFormSettings(prev => ({
                ...prev,
                ...settings
              }));
              
              console.log('=== POST-SAVE SETTINGS UPDATE ===');
              console.log('Saved template settings:', settings);
              console.log('Updated form settings googleReviewUrl:', settings?.googleReviewUrl);
              console.log('=== END POST-SAVE UPDATE ===');
            } catch (e) {
              console.warn('Could not parse saved template settings:', e);
            }
          }
        } catch (templatesError) {
          console.warn('Failed to reload templates list:', templatesError);
        }
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.error || 'Failed to save form');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(`Failed to save form template: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (templateId, templateName) => {
    // Show different confirmation based on template count
    const isLastTemplate = templates.length === 1;
    const confirmMessage = isLastTemplate
      ? `Are you sure you want to delete "${templateName}"? This is your last template. You can always create a new one.`
      : `Are you sure you want to delete "${templateName}"? This action cannot be undone.`;
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeletingTemplate(templateId);
      const token = await user.getIdToken();
      
      const response = await fetch(`http://localhost:3001/api/form-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Form template deleted successfully!');
        
        // If we're deleting the currently active template, switch to new template mode
        if (activeTemplate?.id === templateId) {
          createNewTemplate();
        }
        
        // Reload templates
        await loadTemplates();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete form template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(`Failed to delete template: ${error.message}`);
    } finally {
      setDeletingTemplate(null);
    }
  };

  // Sharing functionality
  const getFormShareUrl = () => {
    if (!activeTemplate?.id) return '';
    return `${window.location.origin}/review/${businessId}`;
  };

  const copyFormLink = async () => {
    if (!activeTemplate) {
      toast.error('Please save the form first');
      return;
    }

    const shareUrl = getFormShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Form link copied to clipboard!');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Form link copied to clipboard!');
    }
  };

  const openFormInNewTab = () => {
    if (!activeTemplate) {
      toast.error('Please save the form first');
      return;
    }

    const shareUrl = getFormShareUrl();
    window.open(shareUrl, '_blank');
  };

  const generateQRCode = () => {
    if (!activeTemplate) {
      toast.error('Please save the form first');
      return;
    }
    
    setShowQRCodeModal(true);
  };

  // Field Editor Panel Component
  const FieldEditor = ({ field, onUpdate, onClose }) => {
    const [fieldData, setFieldData] = useState(field);

    const updateFieldData = (key, value) => {
      const updated = { ...fieldData, [key]: value };
      setFieldData(updated);
      onUpdate(field.id, { [key]: value });
    };

    const addOption = () => {
      const options = [...(fieldData.options || [])];
      options.push({
        id: Date.now(),
        label: `Option ${options.length + 1}`,
        value: `option${options.length + 1}`
      });
      updateFieldData('options', options);
    };

    const updateOption = (optionId, key, value) => {
      const options = fieldData.options.map(opt => 
        opt.id === optionId ? { ...opt, [key]: value } : opt
      );
      updateFieldData('options', options);
    };

    const removeOption = (optionId) => {
      const options = fieldData.options.filter(opt => opt.id !== optionId);
      updateFieldData('options', options);
    };

    return (
            <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit Field</h3>
            <button
              onClick={() => setShowFieldEditor(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Label
              </label>
              <input
                type="text"
                value={fieldData.label}
                onChange={(e) => updateFieldData('label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder Text
              </label>
              <input
                type="text"
                value={fieldData.placeholder || ''}
                onChange={(e) => updateFieldData('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={fieldData.isRequired}
                onChange={(e) => updateFieldData('isRequired', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="required" className="ml-2 text-sm text-gray-700">
                Required field
              </label>
            </div>
          </div>

          {(fieldData.fieldType === 'dropdown' || fieldData.fieldType === 'checkbox') && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Options</h4>
                <button
                  onClick={addOption}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add Option
                </button>
              </div>
              <div className="space-y-2">
                {fieldData.options?.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOption(option.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Form Preview Component
  const FormPreview = ({ fields, formSettings }) => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-8 max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{formName}</h2>
          {formDescription && (
            <p className="text-gray-600 text-sm sm:text-base">{formDescription}</p>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          {fields.map((field, index) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.fieldType === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              )}
              
              {field.fieldType === 'email' && (
                <input
                  type="email"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              )}
              
              {field.fieldType === 'phone' && (
                <input
                  type="tel"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                />
              )}
              
              {field.fieldType === 'textarea' && (
                <textarea
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                />
              )}
              
              {field.fieldType === 'rating' && (
                <div className="flex justify-center py-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} className="p-1">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 hover:text-yellow-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
              
              {field.fieldType === 'dropdown' && (
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base">
                  <option value="">{field.placeholder || 'Select option'}</option>
                  {field.options?.map((option, idx) => (
                    <option key={idx} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              
              {field.fieldType === 'checkbox' && (
                <div className="space-y-2">
                  {field.options?.map((option, idx) => (
                    <label key={idx} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                      />
                      <span className="text-gray-700 text-sm sm:text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <button
            type="button"
            className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            {formSettings.submitButtonText || 'Submit Review'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      <div className="flex-1 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Form Builder</h2>
            <p className="text-gray-600 text-sm sm:text-base">Create custom review forms for your business</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                previewMode
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Eye className="w-4 h-4 mr-1 sm:mr-2 inline" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>

            <button
              onClick={saveTemplate}
              disabled={saving}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm"
            >
              <Save className="w-4 h-4 mr-1 sm:mr-2 inline" />
              {saving ? 'Saving...' : 'Save'}
            </button>

            {/* Share dropdown */}
            {activeTemplate && (
              <div className="relative">
                <button
                  onClick={copyFormLink}
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
                  title="Copy form link"
                >
                  <Share2 className="w-4 h-4 mr-1 sm:mr-2 inline" />
                  <span className="hidden sm:inline">Share Form</span>
                  <span className="sm:hidden">Share</span>
                </button>
              </div>
            )}

            {/* Additional share actions */}
            {activeTemplate && (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={openFormInNewTab}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Open form in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={generateQRCode}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Generate QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {previewMode ? (
          <FormPreview fields={fields} formSettings={formSettings} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Field Types</h3>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => {
                    const Icon = fieldType.icon;
                    return (
                      <button
                        key={fieldType.type}
                        onClick={() => addField(fieldType.type)}
                        className="w-full p-2 sm:p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 group-hover:text-blue-900 text-sm sm:text-base truncate">
                              {fieldType.label}
                            </div>
                            <div className="text-xs text-gray-500 hidden sm:block">
                              {fieldType.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Form Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Form Name
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        🔗 Google Review URL (Important!)
                      </label>
                      <input
                        type="url"
                        value={formSettings.googleReviewUrl}
                        onChange={(e) => setFormSettings(prev => ({ ...prev, googleReviewUrl: e.target.value }))}
                        placeholder="https://g.page/r/YourBusinessCode/review"
                        className="w-full px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      />
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        ⚡ After review submission, customers will be redirected here in 3 seconds
                      </p>
                      <p className="text-xs text-blue-500 mt-1">
                        💡 Find your Google Review URL: Google My Business → Reviews → "Get more reviews" → Copy link
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Thank You Message
                      </label>
                      <textarea
                        value={formSettings.customThankYouMessage}
                        onChange={(e) => setFormSettings(prev => ({ ...prev, customThankYouMessage: e.target.value }))}
                        rows={2}
                        placeholder="Thank you for your feedback! We appreciate your review."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Custom message shown after form submission
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 order-1 lg:order-2">
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 min-h-96">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Form Fields</h3>
                  <span className="text-sm text-gray-500">{fields.length} fields</span>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 text-gray-500">
                    <Type className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Add field types from the sidebar to start building your form</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className={`border border-gray-200 rounded-lg p-4 ${
                          selectedField?.id === field.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                        } cursor-pointer transition-colors`}
                        onClick={() => {
                          setSelectedField(field);
                          setShowFieldEditor(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{field.label}</span>
                            {field.isRequired && (
                              <span className="text-red-500 text-sm">*</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateField(field.id);
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Duplicate field"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeField(field.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-600"
                              title="Delete field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          {fieldTypes.find(ft => ft.type === field.fieldType)?.label}
                        </div>
                        
                        <div className="pointer-events-none">
                          {field.fieldType === 'text' && (
                            <input
                              type="text"
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                          )}
                          
                          {field.fieldType === 'email' && (
                            <input
                              type="email"
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                          )}
                          
                          {field.fieldType === 'phone' && (
                            <input
                              type="tel"
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                          )}
                          
                          {field.fieldType === 'textarea' && (
                            <textarea
                              placeholder={field.placeholder}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                          )}
                          
                          {field.fieldType === 'rating' && (
                            <div className="flex justify-center py-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          )}
                          
                          {field.fieldType === 'dropdown' && (
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled>
                              <option>{field.placeholder || 'Select option'}</option>
                              {field.options?.map((option, idx) => (
                                <option key={idx}>{option.label || option}</option>
                              ))}
                            </select>
                          )}
                          
                          {field.fieldType === 'checkbox' && (
                            <div className="space-y-2">
                              {field.options?.map((option, idx) => (
                                <label key={idx} className="flex items-center space-x-2">
                                  <input type="checkbox" disabled className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                  <span className="text-gray-700">{option.label || option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Templates</h3>
                <div className="space-y-2 mb-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        activeTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => loadTemplate(template)}
                        >
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-500">
                            {template.fields?.length || 0} fields
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTemplate(template.id, template.name);
                          }}
                          disabled={deletingTemplate === template.id}
                          className={`ml-2 p-1 rounded transition-colors ${
                            deletingTemplate === template.id
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title="Delete template"
                        >
                          {deletingTemplate === template.id ? (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={createNewTemplate}
                  className={`w-full p-3 border-2 border-dashed rounded-lg transition-colors ${
                    isCreatingNew 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  New Template
                </button>

                {/* Share Form Section */}
                {activeTemplate && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Share This Form</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Form URL
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={getFormShareUrl()}
                            readOnly
                            className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded text-gray-600"
                          />
                          <button
                            onClick={copyFormLink}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Copy link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={openFormInNewTab}
                          className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 mr-1 inline" />
                          Preview
                        </button>
                        <button
                          onClick={generateQRCode}
                          className="px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          <QrCode className="w-3 h-3 mr-1 inline" />
                          QR Code
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCodeModal && activeTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">QR Code for Form</h3>
              <button
                onClick={() => setShowQRCodeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code to access the review form
                </p>
                <div className="flex justify-center p-4 bg-white border border-gray-200 rounded-lg" id="qr-code-modal">
                  <QRCode
                    value={getFormShareUrl()}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form URL:
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={getFormShareUrl()}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyFormLink}
                    className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Simple download implementation
                    const svg = document.querySelector('#qr-code-modal svg');
                    if (svg) {
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();
                      
                      canvas.width = 200;
                      canvas.height = 200;
                      
                      img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                        const link = document.createElement('a');
                        link.download = `qr-code-${activeTemplate.name || 'form'}.png`;
                        link.href = canvas.toDataURL();
                        link.click();
                      };
                      
                      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                    } else {
                      toast.info('Right-click on the QR code and select "Save image as..."');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setShowQRCodeModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFieldEditor && selectedField && (
        <FieldEditor
          field={selectedField}
          onUpdate={updateField}
          onClose={() => {
            setShowFieldEditor(false);
            setSelectedField(null);
          }}
        />
      )}
    </div>
  );
};

export default FormBuilder;