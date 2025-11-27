import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import businessAPI from '../../services/businessAPI';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  Building2, 
  Globe, 
  Phone, 
  MapPin, 
  Palette, 
  MessageSquare, 
  Star,
  CheckCircle,
  Info,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    website: '',
    phone: '',
    address: '',
    brandColor: '#3B82F6',
    customMessage: '',
    googleReviewUrl: '',
    enableSmartFilter: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchBusiness();
    }
  }, [id, isEditing]);

  const fetchBusiness = async () => {
    try {
      setInitialLoading(true);
      const response = await businessAPI.getBusiness(id);
      
      if (response.success) {
        setFormData({
          name: response.data.name || '',
          type: response.data.type || '',
          description: response.data.description || '',
          website: response.data.website || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          brandColor: response.data.brandColor || '#3B82F6',
          customMessage: response.data.customMessage || '',
          googleReviewUrl: response.data.googleReviewUrl || '',
          enableSmartFilter: response.data.enableSmartFilter || false
        });
      } else {
        toast.error(response.message || 'Failed to fetch business');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error fetching business:', err);
      toast.error(err.message || 'Failed to fetch business');
      navigate('/dashboard');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields: business name, business type, and phone number
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Business name must be less than 100 characters';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Business type is required';
    } else if (formData.type.length > 50) {
      newErrors.type = 'Business type must be less than 50 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phonePattern.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Optional field validations
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.website) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.website)) {
        newErrors.website = 'Please enter a valid website URL';
      }
    }

    if (formData.address && formData.address.length > 200) {
      newErrors.address = 'Address must be less than 200 characters';
    }

    if (formData.brandColor) {
      const colorPattern = /^#[0-9A-F]{6}$/i;
      if (!colorPattern.test(formData.brandColor)) {
        newErrors.brandColor = 'Please enter a valid hex color (e.g., #3B82F6)';
      }
    }

    if (formData.customMessage && formData.customMessage.length > 300) {
      newErrors.customMessage = 'Custom message must be less than 300 characters';
    }

    if (formData.googleReviewUrl) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.googleReviewUrl)) {
        newErrors.googleReviewUrl = 'Please enter a valid Google Review URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        website: formData.website && !formData.website.startsWith('http') 
          ? `https://${formData.website}` 
          : formData.website
      };

      let response;
      if (isEditing) {
        response = await businessAPI.updateBusiness(id, submitData);
      } else {
        response = await businessAPI.createBusiness(submitData);
      }

      if (response.success) {
        toast.success(response.message || `Business ${isEditing ? 'updated' : 'created'} successfully`);
        navigate('/dashboard');
      } else {
        toast.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} business`);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      if (err.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        err.errors.forEach(error => {
          backendErrors[error.path] = error.msg;
        });
        setErrors(backendErrors);
      }
      toast.error(err.message || `Failed to ${isEditing ? 'update' : 'create'} business`);
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    'Restaurant', 'Retail Store', 'Service Business', 'Healthcare', 'Beauty & Wellness',
    'Automotive', 'Real Estate', 'Professional Services', 'Entertainment', 'Education',
    'Fitness & Sports', 'Home & Garden', 'Technology', 'Travel & Tourism', 'Other'
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg">Loading business...</LoadingSpinner>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-gray-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-lg rounded-xl transition-all duration-300 flex-shrink-0 backdrop-blur-sm border border-white/40"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {isEditing ? 'Edit Business' : 'Create New Business'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {isEditing 
                    ? 'Update your business information and customize your review experience' 
                    : 'Set up your business profile to start collecting reviews'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl border border-white/20 p-6 shadow-lg shadow-gray-900/5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
                <span className="text-gray-700 font-semibold">Business Setup</span>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-gray-500">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">Basic Info</span>
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-500 rounded-full border-dashed"></div>
                  <span className="font-medium">Customization</span>
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  <span className="font-medium">Review Settings</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Enhanced Form */}
          <div className="xl:col-span-2">
            {/* Required Fields Notice */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-200/50 p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg flex-shrink-0">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Required Fields</h4>
                  <p className="text-gray-700 text-sm">
                    Only <span className="font-semibold text-blue-700">Business Name</span>, <span className="font-semibold text-blue-700">Business Type</span>, and <span className="font-semibold text-blue-700">Phone Number</span> are required. 
                    All other fields are optional and can help enhance your customer experience.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Card */}
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl shadow-gray-900/10 border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-5 border-b border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                      <p className="text-gray-600">Essential details about your business</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="Business Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        error={errors.name}
                        required
                        placeholder="Enter your business name"
                        className="text-base sm:text-lg font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-white ${
                          errors.type ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        required
                      >
                        <option value="">Select business type</option>
                        {businessTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.type && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          {errors.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        error={errors.phone}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Business Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                          errors.description ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        placeholder="Describe what makes your business special..."
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          {errors.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-gray-500 text-xs">Help customers understand what you offer</p>
                        <p className={`text-xs ${formData.description.length > 450 ? 'text-red-500' : 'text-gray-500'}`}>
                          {formData.description.length}/500
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl shadow-gray-900/10 border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-5 border-b border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                      <p className="text-gray-600">How customers can reach you (optional)</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website URL
                    </label>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      error={errors.website}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Business Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                        errors.address ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="123 Main Street, City, State, ZIP Code"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customization Card */}
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl shadow-gray-900/10 border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-5 border-b border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Brand Customization</h3>
                      <p className="text-gray-600">Personalize your review page appearance (optional)</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Palette className="w-4 h-4 inline mr-1" />
                      Brand Color
                    </label>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative">
                        <input
                          type="color"
                          name="brandColor"
                          value={formData.brandColor}
                          onChange={handleInputChange}
                          className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors"
                        />
                        <div className="absolute inset-0 rounded-xl border-2 border-white pointer-events-none"></div>
                      </div>
                      <div className="flex-1">
                        <Input
                          name="brandColor"
                          value={formData.brandColor}
                          onChange={handleInputChange}
                          error={errors.brandColor}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">This color will be used for buttons, highlights, and branding elements</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Welcome Message
                    </label>
                    <textarea
                      name="customMessage"
                      value={formData.customMessage}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                        errors.customMessage ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="Thank you for visiting! We'd love to hear about your experience and how we can serve you better."
                    />
                    {errors.customMessage && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <Info className="w-4 h-4" />
                        {errors.customMessage}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-500 text-xs">Message shown to customers on your review page</p>
                      <p className={`text-xs ${formData.customMessage.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.customMessage.length}/300
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Reviews Integration Card */}
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl shadow-gray-900/10 border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 px-6 py-5 border-b border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Google Reviews Integration</h3>
                      <p className="text-gray-600">Connect your Google Business Profile (optional)</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 rounded-xl p-5 mb-6 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg flex-shrink-0">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-900 font-bold mb-3">How to find your Google Review URL:</p>
                        <ol className="text-gray-700 space-y-2 list-decimal list-inside">
                          <li className="flex items-start gap-2">
                            <span className="font-medium">1.</span>
                            <span>Go to your Google Business Profile</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-medium">2.</span>
                            <span>Click on "Get more reviews"</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-medium">3.</span>
                            <span>Copy the review link that appears</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-medium">4.</span>
                            <span>Paste it in the field below</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  
                  <Input
                    label="Google Review URL"
                    name="googleReviewUrl"
                    value={formData.googleReviewUrl}
                    onChange={handleInputChange}
                    error={errors.googleReviewUrl}
                    placeholder="https://g.page/yourbusiness/review"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Customers will be redirected here after submitting their review to leave a Google review
                  </p>

                  {/* Smart Filter Toggle */}
                  {formData.googleReviewUrl && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-gray-900">Smart Review Filter</h4>
                              <p className="text-sm text-gray-600">Only redirect 4-5 star reviews to Google</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, enableSmartFilter: !prev.enableSmartFilter }))}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              formData.enableSmartFilter ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                formData.enableSmartFilter ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          formData.enableSmartFilter 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {formData.enableSmartFilter ? '✨ Smart Filter Active' : '🔄 All Reviews Redirect'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl shadow-gray-900/10 border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 order-2 sm:order-1 backdrop-blur-sm bg-white/50 hover:bg-white/80 border-white/40"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 sm:flex-none backdrop-blur-sm bg-white/50 hover:bg-white/80 border-white/40"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={loading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      {isEditing ? 'Update Business' : 'Create Business'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Enhanced Preview */}
          <div className="xl:col-span-1">
            <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl shadow-gray-900/10 border border-white/20 overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 px-6 py-5 border-b border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-gray-600 to-slate-700 rounded-xl shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
                    <p className="text-gray-600">See how customers will view your page</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {/* Mobile Frame */}
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-3 mb-6 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-inner">
                    {/* Phone Header */}
                    <div className="bg-black h-8 rounded-t-2xl flex items-center justify-center relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                        </div>
                      </div>
                      <div className="bg-gray-800 w-20 h-5 rounded-full"></div>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-3 bg-white/20 rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* Business Card Preview */}
                    <div className="p-4 min-h-[300px]">
                      {/* Brand Header */}
                      <div 
                        className="w-full h-3 rounded-lg mb-4"
                        style={{ backgroundColor: formData.brandColor || '#3B82F6' }}
                      />
                      
                      <div className="text-center space-y-3">
                        {/* Business Info */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">
                            {formData.name || 'Your Business Name'}
                          </h4>
                          
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            <p className="text-sm text-gray-600">
                              {formData.type || 'Business Type'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {formData.description && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 line-clamp-3">
                              {formData.description}
                            </p>
                          </div>
                        )}
                        
                        {/* Contact Info */}
                        <div className="space-y-2 text-xs text-gray-500">
                          {formData.website && (
                            <div className="flex items-center justify-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span className="truncate">{formData.website}</span>
                            </div>
                          )}
                          {formData.phone && (
                            <div className="flex items-center justify-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{formData.phone}</span>
                            </div>
                          )}
                          {formData.address && (
                            <div className="flex items-center justify-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="text-center line-clamp-2">{formData.address}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Custom Message */}
                        {formData.customMessage && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                            <p className="text-xs text-blue-800 line-clamp-3">
                              "{formData.customMessage}"
                            </p>
                          </div>
                        )}
                        
                        {/* Rating Preview */}
                        <div className="py-3">
                          <p className="text-xs text-gray-600 mb-2">Rate your experience:</p>
                          <div className="flex justify-center gap-1">
                            {[1,2,3,4,5].map(i => (
                              <Star 
                                key={i} 
                                className="w-6 h-6 text-yellow-400 fill-current" 
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* CTA Button */}
                        <button
                          className="w-full px-4 py-3 text-white rounded-xl text-sm font-medium shadow-md transform transition-transform hover:scale-105"
                          style={{ backgroundColor: formData.brandColor || '#3B82F6' }}
                        >
                          Leave a Review
                        </button>
                        
                        {/* Google Reviews Link */}
                        {formData.googleReviewUrl && (
                          <div className="pt-2">
                            <p className="text-xs text-gray-500 mb-1">Or review us on:</p>
                            <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Google Reviews</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Preview Info */}
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-5 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-2">Preview Features</p>
                      <ul className="text-sm text-gray-700 space-y-1.5">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Responsive design for all devices
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Customizable branding and colors
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Google Reviews integration
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Professional review collection
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessForm;