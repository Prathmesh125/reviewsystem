import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import businessAPI from '../../services/businessAPI';
import Button from '../ui/Button';
import Input from '../ui/Input';
import LoadingSpinner from '../ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Palette, 
  Globe, 
  Upload,
  Eye,
  Code,
  Share2,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [settings, setSettings] = useState({
    // General Settings
    reviewPageTitle: '',
    welcomeMessage: '',
    thankYouMessage: '',
    
    // Appearance Settings
    primaryColor: '#3B82F6',
    secondaryColor: '#F3F4F6',
    fontFamily: 'Inter',
    logoUrl: '',
    backgroundImage: '',
    
    // Integration Settings
    googleReviewUrl: '',
    enableSmartFilter: false,
    facebookUrl: '',
    instagramUrl: '',
    websiteUrl: '',
    
    // Advanced Settings
    customCSS: '',
    analyticsId: '',
    enableSEO: true,
    enableSharing: true,
    requireEmail: true,
    enableRatings: true,
    maxReviewLength: 500
  });

  useEffect(() => {
    if (id) {
      fetchBusinessSettings();
    }
  }, [id]);

  const fetchBusinessSettings = async () => {
    try {
      setLoading(true);
      const response = await businessAPI.getBusiness(id);
      
      if (response.success) {
        const businessData = response.data;
        setBusiness(businessData);
        
        // Map business data to settings
        setSettings({
          reviewPageTitle: businessData.name + ' Reviews',
          welcomeMessage: businessData.customMessage || 'We value your feedback!',
          thankYouMessage: 'Thank you for your review!',
          primaryColor: businessData.brandColor || '#3B82F6',
          secondaryColor: '#F3F4F6',
          fontFamily: 'Inter',
          logoUrl: businessData.logo || '',
          backgroundImage: '',
          googleReviewUrl: businessData.googleReviewUrl || '',
          enableSmartFilter: businessData.enableSmartFilter || false,
          facebookUrl: '',
          instagramUrl: '',
          websiteUrl: businessData.website || '',
          customCSS: '',
          analyticsId: '',
          enableSEO: true,
          enableSharing: true,
          requireEmail: true,
          enableRatings: true,
          maxReviewLength: 500
        });
        
        // Set logo preview if logo exists
        if (businessData.logo) {
          setLogoPreview(businessData.logo);
        }
      } else {
        toast.error('Failed to fetch business settings');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching business settings:', error);
      toast.error('Failed to fetch business settings');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
        setSettings(prev => ({ ...prev, logoUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
      
      // In a real app, you would upload to a server here
      // For now, we'll just use the base64 data URL
      toast.success('Logo uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Include all required fields to avoid validation errors
      const updateData = {
        name: business.name, // Include existing name
        type: business.type, // Include existing type
        description: business.description || '', // Include existing description
        customMessage: settings.welcomeMessage,
        brandColor: settings.primaryColor,
        googleReviewUrl: settings.googleReviewUrl,
        enableSmartFilter: settings.enableSmartFilter, // Include smart filter setting
        website: settings.websiteUrl,
        phone: business.phone || '',
        address: business.address || '',
        logo: settings.logoUrl, // Include logo URL
        isPublished: business.isPublished
      };

      const response = await businessAPI.updateBusiness(id, updateData);
      
      if (response.success) {
        toast.success('Settings saved successfully');
        // Update the local business state with the new data
        setBusiness(prev => ({
          ...prev,
          customMessage: settings.welcomeMessage,
          brandColor: settings.primaryColor,
          googleReviewUrl: settings.googleReviewUrl,
          enableSmartFilter: settings.enableSmartFilter,
          website: settings.websiteUrl,
          logo: settings.logoUrl
        }));
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integration', label: 'Integration', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg">Loading settings...</LoadingSpinner>
      </div>
    );
  }

  const reviewPageUrl = `${window.location.origin}/review/${id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header with Glass Morphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent truncate">
                  Business Settings
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{business?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Button 
                variant="outline" 
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                onClick={() => window.open(reviewPageUrl, '_blank')}
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button 
                onClick={handleSave}
                loading={saving}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center gap-1 sm:gap-2"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-purple-50/30 pointer-events-none"></div>
              <div className="relative">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50 hover:shadow-md'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Quick Actions */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/30">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(reviewPageUrl);
                        toast.success('Review page URL copied!');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Copy Review URL</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-white/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-purple-50/30 pointer-events-none"></div>
              <div className="relative">
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">General Settings</h3>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <Input
                        label="Review Page Title"
                        value={settings.reviewPageTitle}
                        onChange={(e) => handleSettingChange('reviewPageTitle', e.target.value)}
                        placeholder="Your Business Reviews"
                        helperText="This will appear as the page title"
                        className="bg-white/80 border-white/50"
                      />
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Welcome Message
                      </label>
                      <textarea
                        value={settings.welcomeMessage}
                        onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        placeholder="Welcome message for customers"
                      />
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Thank You Message
                      </label>
                      <textarea
                        value={settings.thankYouMessage}
                        onChange={(e) => handleSettingChange('thankYouMessage', e.target.value)}
                        rows={2}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        placeholder="Message shown after review submission"
                      />
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="flex items-center p-3 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.requireEmail}
                              onChange={(e) => handleSettingChange('requireEmail', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">Require email address</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center p-3 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.enableRatings}
                              onChange={(e) => handleSettingChange('enableRatings', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700">Enable star ratings</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Appearance Settings</h3>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                            className="w-12 h-10 sm:w-14 sm:h-12 border-2 border-white/50 rounded-xl cursor-pointer shadow-md"
                          />
                          <Input
                            value={settings.primaryColor}
                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                            placeholder="#3B82F6"
                            className="flex-1 bg-white/80 border-white/50"
                          />
                        </div>
                      </div>

                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Font Family
                        </label>
                        <select
                          value={settings.fontFamily}
                          onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/80 border border-white/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Open Sans">Open Sans</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Logo Upload
                      </label>
                      <div 
                        className="border-2 border-dashed border-blue-200/50 rounded-xl p-4 sm:p-6 text-center bg-gradient-to-br from-blue-50/30 to-purple-50/20 hover:from-blue-50/50 hover:to-purple-50/40 transition-all duration-200 cursor-pointer"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={openFileDialog}
                      >
                        {logoPreview || settings.logoUrl ? (
                          <div className="space-y-3">
                            <img 
                              src={logoPreview || settings.logoUrl} 
                              alt="Logo preview" 
                              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto rounded-lg border border-gray-200"
                            />
                            <p className="text-xs sm:text-sm text-gray-600">Click to change logo</p>
                          </div>
                        ) : (
                          <div>
                            {uploadingLogo ? (
                              <div className="space-y-2">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-xs sm:text-sm text-gray-600">Uploading...</p>
                              </div>
                            ) : (
                              <div>
                                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm text-gray-600 mb-3">Drag and drop your logo, or click to browse</p>
                                <Button 
                                  variant="outline" 
                                  className="text-xs sm:text-sm bg-white/80 hover:bg-white border-blue-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openFileDialog();
                                  }}
                                >
                                  Choose File
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </div>
                      {(logoPreview || settings.logoUrl) && (
                        <div className="mt-3 flex justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setLogoPreview(null);
                              setSettings(prev => ({ ...prev, logoUrl: '' }));
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove Logo
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

                {/* Integration Settings */}
                {activeTab === 'integration' && (
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Integration Settings</h3>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <Input
                        label="Google Review URL"
                        value={settings.googleReviewUrl}
                        onChange={(e) => handleSettingChange('googleReviewUrl', e.target.value)}
                        placeholder="https://g.page/yourbusiness/review"
                        helperText="Customers will be redirected here after leaving a review"
                        className="bg-white/80 border-white/50"
                      />
                    </div>

                    {settings.googleReviewUrl && (
                      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-200/50 shadow-lg">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Smart Review Filter</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  Only redirect customers with 4-5 star ratings to Google Reviews. 1-3 star reviews will be saved privately for your improvement.
                                </p>
                              </div>
                              <div className="flex-shrink-0 ml-4">
                                <button
                                  type="button"
                                  onClick={() => handleSettingChange('enableSmartFilter', !settings.enableSmartFilter)}
                                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    settings.enableSmartFilter ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gray-200'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      settings.enableSmartFilter ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center space-x-2 text-xs">
                              <span className={`px-2 py-1 rounded-full font-medium ${
                                settings.enableSmartFilter 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {settings.enableSmartFilter ? '✨ Smart Filter Enabled' : '🔄 All Reviews Redirect'}
                              </span>
                              {settings.enableSmartFilter && (
                                <span className="text-blue-600 font-medium">• Protects Your Reputation</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <Input
                        label="Website URL"
                        value={settings.websiteUrl}
                        onChange={(e) => handleSettingChange('websiteUrl', e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="bg-white/80 border-white/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                        <Input
                          label="Facebook URL"
                          value={settings.facebookUrl}
                          onChange={(e) => handleSettingChange('facebookUrl', e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                          className="bg-white/80 border-white/50"
                        />
                      </div>

                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                        <Input
                          label="Instagram URL"
                          value={settings.instagramUrl}
                          onChange={(e) => handleSettingChange('instagramUrl', e.target.value)}
                          placeholder="https://instagram.com/yourprofile"
                          className="bg-white/80 border-white/50"
                        />
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/40">
                      <Input
                        label="Google Analytics ID"
                        value={settings.analyticsId}
                        onChange={(e) => handleSettingChange('analyticsId', e.target.value)}
                        placeholder="GA-XXXXXXXXX-X"
                        helperText="Optional: Track review page visits"
                        className="bg-white/80 border-white/50"
                      />
                    </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;