import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import { toast } from 'react-hot-toast';
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
  X
} from 'lucide-react';

const FormBuilder = ({ businessId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  
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
    submitButtonText: 'Submit Review',
    brandingEnabled: true
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

  // Load form templates
  useEffect(() => {
    loadTemplates();
  }, [businessId]);

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
        
        // Load first template if exists
        if (data.length > 0 && !activeTemplate) {
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
    setFormName(template.name);
    setFormDescription(template.description || '');
    
    // Parse template settings
    try {
      const settings = typeof template.settings === 'string' 
        ? JSON.parse(template.settings) 
        : template.settings;
      setFormSettings({ ...formSettings, ...settings });
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

  const createNewTemplate = () => {
    setActiveTemplate(null);
    setFormName('New Review Form');
    setFormDescription('');
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
      brandingEnabled: true
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
          styling: JSON.stringify(field.styling || {}),
          conditional: JSON.stringify(field.conditional || {})
        }))
      };

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
        toast.success(activeTemplate ? 'Form updated successfully!' : 'Form created successfully!');
        
        // Reload templates
        await loadTemplates();
        
        // Set as active
        setActiveTemplate(saved);
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.error || 'Failed to save form');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save form template');
    } finally {
      setSaving(false);
    }
  };

  const activateTemplate = async (templateId) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3001/api/form-templates/${templateId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Template activated successfully!');
        loadTemplates();
      } else {
        throw new Error('Failed to activate template');
      }
    } catch (error) {
      console.error('Error activating template:', error);
      toast.error('Failed to activate template');
    }
  };

  // Field Editor Panel Component
  const FieldEditor = ({ field, onUpdate, onClose }) => {
    const [fieldData, setFieldData] = useState(field);

    const updateFieldData = (key, value) => {
      const updated = { ...fieldData, [key]: value };
      setFieldData(updated);
      onUpdate(field.id, { [key]: value });
    };

    const updateValidation = (rule, value) => {
      const validation = { ...fieldData.validation };
      if (value === '' || value === false) {
        delete validation.rules[rule];
      } else {
        validation.rules[rule] = value;
      }
      updateFieldData('validation', validation);
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
      <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Edit Field</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Basic Field Settings */}
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

          {/* Options for dropdown/checkbox */}
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
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{formName}</h2>
          {formDescription && (
            <p className="text-gray-600">{formDescription}</p>
          )}
        </div>

        <div className="space-y-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              
              {field.fieldType === 'email' && (
                <input
                  type="email"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              
              {field.fieldType === 'phone' && (
                <input
                  type="tel"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              
              {field.fieldType === 'textarea' && (
                <textarea
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
              
              {field.fieldType === 'rating' && (
                <div className="flex justify-center py-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} className="p-1">
                      <Star className="w-8 h-8 text-yellow-400 hover:text-yellow-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
              
              {field.fieldType === 'dropdown' && (
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
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
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
    <div className="h-full flex">
      {/* Main Form Builder */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Form Builder</h2>
            <p className="text-gray-600">Create custom review forms for your business</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                previewMode
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>

            <button
              onClick={saveTemplate}
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <FormPreview fields={fields} formSettings={formSettings} />
        ) : (
          /* Builder Mode */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Field Types */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Field Types</h3>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => {
                    const Icon = fieldType.icon;
                    return (
                      <button
                        key={fieldType.type}
                        onClick={() => addField(fieldType.type)}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-900">
                              {fieldType.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {fieldType.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Form Settings */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Form Settings</h3>
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Form Canvas */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-96">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Form Fields</h3>
                  <span className="text-sm text-gray-500">{fields.length} fields</span>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Type className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Add field types from the sidebar to start building your form</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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

                        {/* Field Preview */}
                        <div className="text-sm text-gray-600 mb-2">
                          {fieldTypes.find(ft => ft.type === field.fieldType)?.label}
                        </div>
                        
                        {/* Render field preview based on type */}
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

            {/* Right Sidebar - Templates */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Templates</h3>
                <div className="space-y-2 mb-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        activeTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => loadTemplate(template)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-500">
                            {template.fields?.length || 0} fields
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={createNewTemplate}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mx-auto mb-1" />
                  New Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Field Editor Panel */}
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