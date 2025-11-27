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
  ChevronDown,
  ChevronUp,
  GripVertical,
  Star,
  Type,
  Mail,
  Phone,
  MessageSquare,
  CheckSquare,
  List
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
  const [draggedField, setDraggedField] = useState(null);
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
      const response = await fetch(`http://localhost:3001/api/form-templates/business/${businessId}`, {
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
    setFields(template.fields.map(field => ({
      ...field,
      id: field.id || `field-${Date.now()}-${Math.random()}`
    })));
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

  // Predefined form templates
  const loadTemplatePreset = (presetType) => {
    const presets = {
      restaurant: {
        name: 'Restaurant Review Form',
        description: 'Perfect for restaurants and food service businesses',
        fields: [
          { fieldType: 'text', label: 'Your Name', isRequired: true },
          { fieldType: 'email', label: 'Email Address', isRequired: true },
          { fieldType: 'rating', label: 'Overall Rating', isRequired: true },
          { fieldType: 'rating', label: 'Food Quality', isRequired: true },
          { fieldType: 'rating', label: 'Service', isRequired: true },
          { fieldType: 'dropdown', label: 'How did you dine?', options: [
            { id: 1, label: 'Dine-in', value: 'dine-in' },
            { id: 2, label: 'Takeout', value: 'takeout' },
            { id: 3, label: 'Delivery', value: 'delivery' }
          ], isRequired: true },
          { fieldType: 'textarea', label: 'Share your experience', isRequired: true }
        ]
      },
      retail: {
        name: 'Retail Store Review Form',
        description: 'Ideal for retail stores and shopping experiences',
        fields: [
          { fieldType: 'text', label: 'Your Name', isRequired: true },
          { fieldType: 'email', label: 'Email Address', isRequired: true },
          { fieldType: 'rating', label: 'Overall Experience', isRequired: true },
          { fieldType: 'rating', label: 'Product Quality', isRequired: true },
          { fieldType: 'rating', label: 'Customer Service', isRequired: true },
          { fieldType: 'checkbox', label: 'What did you purchase?', options: [
            { id: 1, label: 'Clothing', value: 'clothing' },
            { id: 2, label: 'Electronics', value: 'electronics' },
            { id: 3, label: 'Home Goods', value: 'home-goods' },
            { id: 4, label: 'Other', value: 'other' }
          ], isRequired: false },
          { fieldType: 'textarea', label: 'Tell us about your shopping experience', isRequired: true }
        ]
      },
      service: {
        name: 'Service Business Review Form',
        description: 'Great for service-based businesses',
        fields: [
          { fieldType: 'text', label: 'Your Name', isRequired: true },
          { fieldType: 'email', label: 'Email Address', isRequired: true },
          { fieldType: 'phone', label: 'Phone Number', isRequired: false },
          { fieldType: 'rating', label: 'Overall Satisfaction', isRequired: true },
          { fieldType: 'rating', label: 'Timeliness', isRequired: true },
          { fieldType: 'rating', label: 'Communication', isRequired: true },
          { fieldType: 'dropdown', label: 'Service Type', options: [
            { id: 1, label: 'Consultation', value: 'consultation' },
            { id: 2, label: 'Installation', value: 'installation' },
            { id: 3, label: 'Repair', value: 'repair' },
            { id: 4, label: 'Maintenance', value: 'maintenance' }
          ], isRequired: true },
          { fieldType: 'textarea', label: 'Additional Comments', isRequired: false }
        ]
      }
    };

    const preset = presets[presetType];
    if (preset) {
      setFormName(preset.name);
      setFormDescription(preset.description);
      setFields(preset.fields.map((field, index) => ({
        id: `field-${Date.now()}-${index}`,
        ...field,
        order: index,
        validation: { rules: { required: field.isRequired }, errorMessages: {} },
        styling: { width: 'full', size: 'md', variant: 'default' },
        conditional: { enabled: false, conditions: [] },
        placeholder: `Enter ${field.label.toLowerCase()}...`
      })));
      setSelectedField(null);
      setShowFieldEditor(false);
    }
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

  const moveField = (fromIndex, toIndex) => {
    const newFields = [...fields];
    const [movedField] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, movedField);
    
    // Update order
    newFields.forEach((field, index) => {
      field.order = index;
    });
    
    setFields(newFields);
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

    try {
      setSaving(true);
      const token = await user.getIdToken();
      
      const templateData = {
        businessId,
        name: formName,
        description: formDescription,
        settings: JSON.stringify(formSettings),
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
        throw new Error('Failed to save form');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save form template');
    } finally {
      setSaving(false);
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

          {/* Validation Rules */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Validation Rules</h4>
            <div className="space-y-3">
              {fieldData.fieldType === 'text' || fieldData.fieldType === 'textarea' ? (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minimum Length</label>
                    <input
                      type="number"
                      value={fieldData.validation?.rules?.minLength || ''}
                      onChange={(e) => updateValidation('minLength', parseInt(e.target.value) || '')}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Maximum Length</label>
                    <input
                      type="number"
                      value={fieldData.validation?.rules?.maxLength || ''}
                      onChange={(e) => updateValidation('maxLength', parseInt(e.target.value) || '')}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : null}
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

          {/* Field Styling */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Styling</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Field Width</label>
                <select
                  value={fieldData.styling?.width || 'full'}
                  onChange={(e) => updateFieldData('styling', { ...fieldData.styling, width: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="full">Full Width</option>
                  <option value="half">Half Width</option>
                  <option value="third">Third Width</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Field Size</label>
                <select
                  value={fieldData.styling?.size || 'md'}
                  onChange={(e) => updateFieldData('styling', { ...fieldData.styling, size: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
    try {
      const token = await user.getIdToken();
      const response = await fetch(`http://localhost:3001/api/form-templates/${templateId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Form activated successfully!');
        loadTemplates();
      } else {
        throw new Error('Failed to activate form');
      }
    } catch (error) {
      console.error('Error activating template:', error);
      toast.error('Failed to activate form template');
    }
  };

  const duplicateTemplate = (template) => {
    setActiveTemplate(null);
    setFormName(`${template.name} (Copy)`);
    setFormDescription(template.description);
    setFields(template.fields.map(field => ({
      ...field,
      id: `field-${Date.now()}-${Math.random()}`
    })));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-600 mt-2">Create and customize your review forms</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={createNewTemplate}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Form</span>
          </button>
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Templates Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Templates</h3>
            
            <div className="space-y-3">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {template.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateTemplate(template);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          activateTemplate(template.id);
                        }}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Activate"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {template.fields.length} fields
                  </p>
                  
                  {template.isActive && (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {!previewMode ? (
              <>
                {/* Form Settings */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Form Name *
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter form name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe this form..."
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Form Fields</h3>
                    <button
                      onClick={saveTemplate}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Form'}</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        index={index}
                        onUpdate={(updates) => updateField(field.id, updates)}
                        onRemove={() => removeField(field.id)}
                        onMove={moveField}
                      />
                    ))}
                    
                    {fields.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No fields added yet. Add some fields to get started!</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <FormPreview 
                formName={formName}
                formDescription={formDescription}
                fields={fields}
              />
            )}
          </div>
        </div>

        {/* Field Types Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Fields</h3>
            
            <div className="space-y-2">
              {fieldTypes.map(({ type, icon: Icon, label, description }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-900">
                        {label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {description}
                      </div>
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
            {/* Template Management */}
            <div className="flex items-center gap-2">
              <select
                value={activeTemplate?.id || ''}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    createNewTemplate();
                  } else if (e.target.value === '') {
                    // Do nothing for placeholder
                  } else {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) loadTemplate(template);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
                <option value="new">+ Create New</option>
              </select>
            </div>

            {/* Template Presets */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    loadTemplatePreset(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Load Preset</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail Store</option>
                <option value="service">Service Business</option>
              </select>
            </div>

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
                    <p>Drag field types from the sidebar to start building your form</p>
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

            {/* Right Sidebar - Templates & Settings */}
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              activateTemplate(template.id);
                            }}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Activate template"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this template?')) {
                                // Delete template logic
                              }
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

// Field Editor Component
const FieldEditor = ({ field, index, onUpdate, onRemove, onMove }) => {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState(
    field.options ? (Array.isArray(field.options) ? field.options : field.options.split(',')) : []
  );

  const fieldTypeLabels = {
    text: 'Text Input',
    email: 'Email',
    phone: 'Phone',
    textarea: 'Text Area',
    rating: 'Star Rating',
    dropdown: 'Dropdown',
    checkbox: 'Checkbox'
  };

  const updateOptions = (newOptions) => {
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    updateOptions(newOptions);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateOptions(newOptions);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    updateOptions(newOptions);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="cursor-move text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </button>
          
          <div>
            <h4 className="font-medium text-gray-900">{field.label}</h4>
            <p className="text-sm text-gray-600">{fieldTypeLabels[field.fieldType]}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label *
              </label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.isRequired}
              onChange={(e) => onUpdate({ isRequired: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`required-${field.id}`} className="ml-2 text-sm text-gray-700">
              Required field
            </label>
          </div>

          {/* Options for dropdown and checkbox */}
          {(field.fieldType === 'dropdown' || field.fieldType === 'checkbox') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={addOption}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Form Preview Component
const FormPreview = ({ formName, formDescription, fields }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{formName}</h2>
        {formDescription && (
          <p className="text-gray-600">{formDescription}</p>
        )}
      </div>

      <div className="space-y-6">
        {fields.map(field => (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.fieldType === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            )}
            
            {field.fieldType === 'email' && (
              <input
                type="email"
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            )}
            
            {field.fieldType === 'phone' && (
              <input
                type="tel"
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            )}
            
            {field.fieldType === 'textarea' && (
              <textarea
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled
              />
            )}
            
            {field.fieldType === 'rating' && (
              <div className="flex justify-center py-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-8 h-8 text-gray-300" />
                ))}
              </div>
            )}
            
            {field.fieldType === 'dropdown' && (
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                <option>{field.placeholder || 'Select option'}</option>
                {field.options && field.options.map((option, index) => (
                  <option key={index}>{option}</option>
                ))}
              </select>
            )}
            
            {field.fieldType === 'checkbox' && (
              <div className="space-y-2">
                {field.options && field.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input type="checkbox" disabled className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormBuilder;