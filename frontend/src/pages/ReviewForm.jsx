import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2, 
  Star,
  ExternalLink,
  Heart,
  Sparkles,
  Copy
} from 'lucide-react';

import DynamicFormField from '../components/common/DynamicFormField';
import { 
  getPublicFormTemplate, 
  createCustomer, 
  submitReview 
} from '../services/publicApi';

const ReviewForm = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [business, setBusiness] = useState(null);
  const [template, setTemplate] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [customer, setCustomer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  
  // Predefined keywords state
  const [recommendationKeywords, setRecommendationKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  
  // AI Enhancement state
  const [aiEnhancedText, setAiEnhancedText] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [enhancementDebounce, setEnhancementDebounce] = useState(null);
  const [autoGenerating, setAutoGenerating] = useState(false);

  // Generate keywords based on business type
  const generateKeywords = (businessType, businessName) => {
    const keywordSets = {
      'restaurant': ['delicious food', 'excellent service', 'cozy atmosphere', 'friendly staff', 'great value', 'highly recommend'],
      'hotel': ['comfortable stay', 'clean rooms', 'friendly staff', 'great location', 'excellent service', 'would stay again'],
      'retail': ['quality products', 'helpful staff', 'great selection', 'fair prices', 'excellent service', 'highly recommend'],
      'salon': ['professional service', 'skilled stylists', 'relaxing atmosphere', 'great results', 'friendly staff', 'will return'],
      'automotive': ['honest service', 'skilled technicians', 'fair pricing', 'quick turnaround', 'reliable work', 'trustworthy'],
      'healthcare': ['professional care', 'knowledgeable staff', 'clean facility', 'caring service', 'highly skilled', 'recommended'],
      'fitness': ['great equipment', 'motivating trainers', 'clean facility', 'friendly atmosphere', 'excellent results', 'worth it'],
      'education': ['knowledgeable instructors', 'engaging classes', 'supportive environment', 'great learning', 'highly recommend', 'valuable experience']
    };
    
    const defaultKeywords = ['excellent service', 'friendly staff', 'great experience', 'highly recommend', 'professional', 'satisfied customer'];
    const businessKeywords = keywordSets[businessType?.toLowerCase()] || defaultKeywords;
    
    // Shuffle and return 6 random keywords
    const shuffled = [...businessKeywords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };
  
  // Handle keyword selection
  const handleKeywordSelect = (keyword, fieldId) => {
    // Don't add duplicate keywords
    if (selectedKeywords.includes(keyword)) {
      return;
    }
    
    const currentValue = formData[fieldId] || '';
    let newValue;
    
    if (currentValue.trim() === '') {
      newValue = keyword;
    } else {
      // Add keyword with proper spacing and punctuation
      const separator = currentValue.trim().endsWith('.') || currentValue.trim().endsWith('!') || currentValue.trim().endsWith('?') ? ' ' : ', ';
      newValue = currentValue.trim() + separator + keyword;
    }
    
    // Update form data using the existing handleFeedbackChange function
    handleFeedbackChange(fieldId, newValue);
    
    // Add to selected keywords to prevent duplication
    setSelectedKeywords(prev => [...prev, keyword]);
  };

  // Load business and form template
  useEffect(() => {
    const loadFormTemplate = async () => {
      try {
        setLoading(true);
        const data = await getPublicFormTemplate(businessId);
        console.log('🔍 DEBUG: Business data received:', data.business);
        console.log('🖼️ DEBUG: Logo URL:', data.business?.logo);
        setBusiness(data.business);
        setTemplate(data.template);
        
        // Initialize recommendation keywords based on business type
        if (data.business && data.business.type) {
          const keywords = generateKeywords(data.business.type, data.business.name);
          setRecommendationKeywords(keywords);
        }
        
        // Initialize form data with field IDs
        const initialData = {};
        data.template.fields.forEach((field, index) => {
          const fieldId = field.id || `field-${index}`;
          initialData[fieldId] = '';
        });
        setFormData(initialData);
        
      } catch (error) {
        console.error('Error loading form:', error);
        toast.error(error.message || 'Failed to load review form');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      loadFormTemplate();
    }
  }, [businessId, navigate]);

  // Group fields by steps (for multi-step form)
  const getFieldSteps = () => {
    if (!template?.fields) return [];
    
    const steps = [
      {
        title: 'Welcome',
        description: `Share your experience with ${business?.name}`,
        fields: []
      }
    ];

    // Get contact and rating fields for step 1
    const contactFields = template.fields.filter(f => 
      ['text', 'email'].includes(f.fieldType)
    );
    
    const ratingFields = template.fields.filter(f => 
      f.fieldType === 'rating'
    );
    
    // Get feedback fields for step 2
    const feedbackFields = template.fields.filter(f => 
      ['textarea'].includes(f.fieldType)
    );

    // Step 1: Contact Info + Rating
    steps.push({
      title: 'Your Information & Rating',
      description: 'Tell us who you are and rate your experience',
      fields: [...contactFields, ...ratingFields]
    });

    // Step 2: Review Text
    steps.push({
      title: 'Share Your Review',
      description: 'Tell us more about your experience',
      fields: feedbackFields
    });

    // Thank you step
    steps.push({
      title: 'Thank You',
      description: 'Your review has been submitted successfully!',
      fields: []
    });

    return steps;
  };

  const steps = getFieldSteps();

  // Validate current step
  // Email validation helper
  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return { isValid: false, error: 'Email Address is required' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Check for allowed domains (Gmail and Yahoo)
    const allowedDomains = ['gmail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.in', 'googlemail.com'];
    const domain = email.toLowerCase().split('@')[1];
    
    if (!allowedDomains.includes(domain)) {
      return { isValid: false, error: 'Please use a Gmail or Yahoo email address' };
    }

    // Check for gibberish - basic validation for meaningful email
    const localPart = email.split('@')[0];
    
    // Check if local part is too short or has suspicious patterns
    if (localPart.length < 3) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Check for excessive repeated characters (like aaaaaa@gmail.com)
    const hasExcessiveRepeats = /(.)\1{4,}/.test(localPart);
    if (hasExcessiveRepeats) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Check for random character patterns (basic gibberish detection)
    const randomPattern = /^[a-z]{10,}$/i; // All letters, no numbers, very long
    const onlyNumbers = /^\d+$/; // Only numbers
    const excessiveDots = /\.{2,}/; // Multiple consecutive dots
    
    if ((randomPattern.test(localPart) && localPart.length > 15) || 
        onlyNumbers.test(localPart) || 
        excessiveDots.test(localPart)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true, error: null };
  };

  const validateCurrentStep = () => {
    if (currentStep === 0 || currentStep >= steps.length - 1) return true;
    
    const currentFields = steps[currentStep]?.fields || [];
    const stepErrors = {};
    let isValid = true;

    currentFields.forEach((field, index) => {
      const fieldId = field.id || `field-${index}`;
      const value = formData[fieldId];
      
      // Determine if field is required
      let isFieldRequired = false;
      
      if (field.fieldType === 'text' && field.label && field.label.toLowerCase().includes('name')) {
        // Name is always required
        isFieldRequired = true;
      } else if (field.fieldType === 'email') {
        // Email is always required
        isFieldRequired = true;
      } else if (field.fieldType === 'rating') {
        // Rating is always required
        isFieldRequired = true;
      } else if (field.fieldType === 'textarea') {
        // Textarea is not required when AI review is present
        isFieldRequired = !(showEnhanced && aiEnhancedText);
      } else {
        // For other fields, use the field's isRequired property
        isFieldRequired = field.isRequired || false;
      }
      
      if (isFieldRequired) {
        if (field.fieldType === 'rating' && (!value || value === 0)) {
          stepErrors[fieldId] = 'Please select a rating';
          isValid = false;
        } else if (field.fieldType === 'email') {
          const emailValidation = validateEmail(value);
          if (!emailValidation.isValid) {
            stepErrors[fieldId] = emailValidation.error;
            isValid = false;
          }
        } else if (field.fieldType === 'text' && field.label && field.label.toLowerCase().includes('name') && (!value || value === '')) {
          stepErrors[fieldId] = 'Your Name is required';
          isValid = false;
        } else if (field.fieldType === 'textarea' && (!value || value.trim() === '')) {
          stepErrors[fieldId] = 'Tell us about your experience is required';
          isValid = false;
        } else if (field.fieldType !== 'rating' && field.fieldType !== 'email' && field.fieldType !== 'textarea' && (!value || value === '')) {
          stepErrors[fieldId] = `${field.label} is required`;
          isValid = false;
        }
      }

      // Additional validation for email fields even when not required (if they have content)
      if (field.fieldType === 'email' && value && value.trim() !== '') {
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
          stepErrors[fieldId] = emailValidation.error;
          isValid = false;
        }
      }
    });

    setErrors(stepErrors);
    return isValid;
  };

  // Handle field changes
  const handleFieldChange = (fieldId, value) => {
    // Use the AI enhancement logic for feedback fields
    handleFeedbackChange(fieldId, value);
    
    // Reset selected keywords if user manually clears the field (for textarea fields)
    const fieldInfo = template?.fields?.find(f => (f.id || `field-${template.fields.indexOf(f)}`) === fieldId);
    if (fieldInfo?.fieldType === 'textarea' && (!value || value.trim() === '')) {
      setSelectedKeywords([]);
    }
    
    // Clear error for this field initially
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }

    // Real-time email validation
    const field = template?.fields.find(f => {
      const id = f.id || `field-${template.fields.indexOf(f)}`;
      return id === fieldId;
    });

    if (field && field.fieldType === 'email' && value && value.trim() !== '') {
      const emailValidation = validateEmail(value);
      if (!emailValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          [fieldId]: emailValidation.error
        }));
      }
    }
  };

  // Navigate steps
  const nextStep = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (currentStep < steps.length - 1) {
      // If moving from contact info step, create customer
      if (currentStep === 1) {
        await handleCreateCustomer();
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create customer
  const handleCreateCustomer = async () => {
    try {
      // Look for contact info across all form data
      const customerData = { businessId };
      
      // Find name, email, phone from all form data
      template.fields.forEach((field, index) => {
        const fieldId = field.id || `field-${index}`;
        const value = formData[fieldId];
        
        if (value) {
          if (field.fieldType === 'text' && field.label.toLowerCase().includes('name')) {
            customerData.name = value;
          } else if (field.fieldType === 'email') {
            customerData.email = value;
          } else if (field.fieldType === 'phone') {
            customerData.phone = value;
          }
        }
      });

      // Provide defaults if missing
      if (!customerData.name) customerData.name = 'Anonymous Customer';
      if (!customerData.email) customerData.email = 'no-email@example.com';
      if (!customerData.phone) customerData.phone = '000-000-0000';

      console.log('Creating customer with data:', customerData);
      const createdCustomer = await createCustomer(customerData);
      console.log('Customer created successfully:', createdCustomer);
      setCustomer(createdCustomer);
      
    } catch (error) {
      console.error('Error creating customer:', error);
      console.error('Customer data was:', { businessId });
      toast.error('Failed to save customer information');
    }
  };



  // BULLETPROOF AI Review Generator
  const handleAutoGenerate = () => {
    console.log('🚀 STARTING AI GENERATION');
    
    if (!setAutoGenerating) {
      console.error('setAutoGenerating not available');
      return;
    }
    
    setAutoGenerating(true);
    
    // Use setTimeout to avoid blocking the UI thread
    setTimeout(async () => {
      try {
        console.log('📡 Making API request...');
        
        const response = await fetch('http://localhost:3001/api/ai/enhance-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalText: `I had a great experience at ${business?.name || 'this business'}. The service was excellent and I was very satisfied.`,
            businessContext: {
              businessId: businessId || "test",
              businessName: business?.name || "this business",
              businessType: business?.type || "service provider"
            },
            style: "default"
          })
        });
        
        console.log('📥 Response received:', response.status);
        
        const data = await response.json();
        console.log('✅ AI Response:', data);
        
        if (data.success && data.enhancedText) {
          // Update AI display
          if (setAiEnhancedText) setAiEnhancedText(data.enhancedText);
          if (setShowEnhanced) setShowEnhanced(true);
          
          // Find textarea and update it
          const textarea = document.querySelector('textarea[placeholder*="feedback"], textarea[placeholder*="experience"]');
          if (textarea) {
            textarea.value = data.enhancedText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ Textarea updated successfully');
          }
          
          if (toast && toast.success) {
            toast.success('🎉 AI review generated successfully!');
          }
        } else {
          console.error('Invalid response:', data);
          if (toast && toast.error) {
            toast.error('Failed to generate review');
          }
        }
      } catch (error) {
        console.error('❌ Generation error:', error);
        if (toast && toast.error) {
          toast.error('Error generating review');
        }
      } finally {
        if (setAutoGenerating) {
          setAutoGenerating(false);
        }
      }
    }, 100);
  };

  // AI Enhancement function with unlimited variation capability
  const enhanceReviewText = async (feedbackText, style = 'default', variationParams = {}) => {
    if (!feedbackText || feedbackText.trim().length < 10) {
      setAiEnhancedText('');
      setShowEnhanced(false);
      return;
    }

    try {
      setEnhancing(true);
      
      // Generate unique parameters for maximum variation
      const timestamp = Date.now();
      const uniqueSeed = (timestamp % 100000).toString();
      const randomApproach = ['detailed', 'conversational', 'professional', 'enthusiastic', 'balanced'][Math.floor(Math.random() * 5)];
      const randomTone = ['friendly', 'formal', 'casual', 'descriptive', 'personal'][Math.floor(Math.random() * 5)];
      
      const response = await fetch('http://localhost:3001/api/ai/enhance-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalText: feedbackText,
          businessContext: {
            businessId: businessId,
            businessName: business?.name,
            businessType: business?.type,
            uniqueSeed: uniqueSeed,
            variationSeed: Math.random().toString(36).substring(7)
          },
          style: style,
          variationLevel: variationParams.variationLevel || 'high',
          uniqueApproach: variationParams.uniqueApproach || randomApproach,
          tone: randomTone,
          timestamp: timestamp,
          rewriteIteration: variationParams.rewriteIteration || Math.floor(Math.random() * 10000),
          creativityBoost: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiEnhancedText(data.enhancedText);
        setShowEnhanced(true);
      } else {
        const errorData = await response.json();
        console.error('AI enhancement failed:', errorData);
        
        // Handle validation errors specifically
        if (response.status === 400 && errorData.errors && errorData.errors.length > 0) {
          const errorMessage = errorData.errors[0];
          toast.error(errorMessage);
          
          // Show suggestions if available
          if (errorData.suggestions && errorData.suggestions.length > 0) {
            setTimeout(() => {
              const suggestion = errorData.suggestions[0];
              toast.info(`Tip: ${suggestion}`);
            }, 2000);
          }
        } else {
          throw new Error(errorData.message || 'Failed to enhance text');
        }
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      // Show user-friendly error message
      toast.error('AI enhancement is temporarily unavailable. Please try again later.');
    } finally {
      setEnhancing(false);
    }
  };

  // Debounced AI enhancement
  const handleFeedbackChange = (fieldId, value) => {
    // Update form data immediately
    setFormData(prev => ({ ...prev, [fieldId]: value }));

    // Clear existing timeout
    if (enhancementDebounce) {
      clearTimeout(enhancementDebounce);
    }

    // Set new timeout for AI enhancement (only for feedback fields)
    const feedbackField = template?.fields.find(f => f.fieldType === 'textarea');
    const feedbackFieldId = feedbackField?.id || `field-${template?.fields.findIndex(f => f.fieldType === 'textarea')}`;
    
    if (fieldId === feedbackFieldId && value && value.trim().length > 0) {
      const timeout = setTimeout(() => {
        enhanceReviewText(value);
      }, 1500); // Wait 1.5 seconds after user stops typing
      
      setEnhancementDebounce(timeout);
    }
  };

  // Copy enhanced text to clipboard
  const copyEnhancedText = async () => {
    try {
      await navigator.clipboard.writeText(aiEnhancedText);
      toast.success('Enhanced review copied! You can now paste it to Google Reviews.');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = aiEnhancedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Enhanced review copied! You can now paste it to Google Reviews.');
    }
  };

  // Manual AI Enhancement trigger
  const triggerManualEnhancement = (fieldId) => {
    const currentText = formData[fieldId];
    if (currentText && currentText.trim().length >= 10) {
      enhanceReviewText(currentText);
    } else {
      toast.error('Please write at least 10 characters before using AI enhancement.');
    }
  };

  // Helper function to get fields for a specific step
  const getFieldsForStep = (stepIndex) => {
    if (!steps || !steps[stepIndex]) return [];
    return steps[stepIndex].fields || [];
  };

  // Helper function to get the review field ID
  const getReviewFieldId = () => {
    if (!template || !template.fields) return null;
    
    // Find the textarea field (review field)
    const reviewField = template.fields.find(field => field.fieldType === 'textarea');
    if (!reviewField) return null;
    
    // Return the field ID
    const fieldIndex = template.fields.indexOf(reviewField);
    return reviewField.id || `field-${fieldIndex}`;
  };

  // Clear AI enhancement and show manual input
  const clearAIReview = () => {
    const reviewFieldId = getReviewFieldId();
    if (reviewFieldId) {
      setFormData(prev => ({ ...prev, [reviewFieldId]: '' })); // Clear the form data
    }
    setAiEnhancedText('');
    setShowEnhanced(false);
    toast.info('You can now write your own review manually.');
  };

  // Clear validation errors for textarea when AI review is present
  useEffect(() => {
    if (showEnhanced && aiEnhancedText) {
      const reviewFieldId = getReviewFieldId();
      if (reviewFieldId && errors[reviewFieldId]) {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[reviewFieldId];
          return newErrors;
        });
      }
    }
  }, [showEnhanced, aiEnhancedText, errors]);

  // Rewrite AI Enhancement (generate a new version with maximum uniqueness)
  const rewriteEnhancement = (fieldId) => {
    const currentText = formData[fieldId];
    
    // Check if we have AI enhanced text (from auto-generate) or user text
    const hasAiContent = aiEnhancedText && showEnhanced;
    const hasUserContent = currentText && currentText.trim().length >= 10;
    
    if (hasAiContent || hasUserContent) {
      // Clear current enhancement and generate a new one
      setAiEnhancedText('');
      setShowEnhanced(false);
      
      // Add a small delay to show that we're generating a new version
      toast.loading('Generating a completely fresh review...', { duration: 1500 });
      
      setTimeout(() => {
        try {
          if (hasAiContent && !hasUserContent) {
            // If we have AI content but no user text, generate a fresh auto-review with new seed
            console.log('🔄 Rewriting AI-generated content...');
            handleAutoGenerate();
          } else {
            // If we have user text, enhance it with maximum variation parameters
            console.log('🔄 Rewriting user content...');
            const uniqueVariationStyle = Math.random() > 0.5 ? 'creative_rewrite' : 'professional_rewrite';
            enhanceReviewText(currentText, uniqueVariationStyle, {
              variationLevel: 'maximum',
              uniqueApproach: true,
              timestamp: Date.now(),
              rewriteIteration: Math.floor(Math.random() * 1000)
            });
          }
        } catch (error) {
          console.error('Rewrite error:', error);
          toast.error('Failed to rewrite. Please try again.');
        }
      }, 500);
    } else {
      toast.error('Please write some text or generate a review first before rewriting.');
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    // Create customer if not already created
    if (!customer) {
      await handleCreateCustomer();
      if (!customer) {
        toast.error('Failed to save customer information');
        return;
      }
    }
    
    if (!validateCurrentStep()) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Extract rating and feedback
      const ratingField = template.fields.find(f => f.fieldType === 'rating');
      const feedbackField = template.fields.find(f => f.fieldType === 'textarea');
      
      const ratingIndex = template.fields.findIndex(f => f.fieldType === 'rating');
      const feedbackIndex = template.fields.findIndex(f => f.fieldType === 'textarea');
      
      const ratingFieldId = ratingField?.id || `field-${ratingIndex}`;
      const feedbackFieldId = feedbackField?.id || `field-${feedbackIndex}`;
      
      const rating = formData[ratingFieldId] || 0;
      // Use AI generated review if available, otherwise use manual input
      const feedback = (showEnhanced && aiEnhancedText) ? aiEnhancedText : (formData[feedbackFieldId] || '');
      
      if (!rating || rating === 0) {
        toast.error('Please provide a rating');
        return;
      }
      
      // Only require feedback if no AI review is generated
      if (!feedback || feedback.trim() === '') {
        if (!(showEnhanced && aiEnhancedText)) {
          toast.error('Please provide feedback or generate an AI review');
          return;
        }
      }

      // Automatically copy the review text to clipboard before submitting
      if (feedback && feedback.trim()) {
        try {
          await navigator.clipboard.writeText(feedback);
          toast.success('✨ Review copied to clipboard! You can now paste it to Google Reviews.');
        } catch (error) {
          // Fallback for older browsers
          try {
            const textArea = document.createElement('textarea');
            textArea.value = feedback;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('✨ Review copied to clipboard! You can now paste it to Google Reviews.');
          } catch (fallbackError) {
            console.warn('Could not copy to clipboard:', fallbackError);
            // Continue with submission even if copy fails
          }
        }
      }

      const reviewData = {
        customerId: customer.id,
        businessId: businessId,
        rating: parseInt(rating),
        feedback: feedback.trim(),
        formData: formData
      };

      const reviewResponse = await submitReview(reviewData);
      
      // Auto-enhance the review with AI (non-blocking)
      if (reviewResponse && reviewResponse.id) {
        try {
          const enhanceResponse = await fetch('http://localhost:3001/api/ai/enhance-review', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              reviewId: reviewResponse.id,
              businessContext: {
                businessId: businessId,
                businessName: business.name,
                businessType: business.type
              }
            })
          });
          
          if (enhanceResponse.ok) {
            console.log('Review automatically enhanced with AI');
          }
        } catch (aiError) {
          // AI enhancement is optional, don't fail the submission
          console.log('AI enhancement skipped:', aiError.message);
        }
      }
      
      setSubmitted(true);
      setCurrentStep(steps.length - 1); // Go to thank you step
      
      // Smart Rating Filter Logic
      const shouldRedirectToGoogle = () => {
        console.log('=== SMART FILTER DEBUG ===');
        console.log('Business data:', business);
        console.log('Google Review URL:', business.googleReviewUrl);
        console.log('Smart Filter Enabled:', business.enableSmartFilter);
        
        // If business has Google URL
        if (!business.googleReviewUrl || !business.googleReviewUrl.trim()) {
          console.log('❌ No Google Review URL - Not redirecting');
          return false;
        }
        
        // If smart filter is disabled, redirect all reviews
        if (!business.enableSmartFilter) {
          console.log('🔄 Smart filter disabled - Redirecting all reviews');
          return true;
        }
        
        // Extract rating from form data
        const ratingField = template?.fields.find(f => f.fieldType === 'rating');
        const ratingIndex = template?.fields.findIndex(f => f.fieldType === 'rating');
        const ratingFieldId = ratingField?.id || `field-${ratingIndex}`;
        const currentRating = parseInt(formData[ratingFieldId]) || 0;
        
        console.log('Smart Filter Check:', {
          enableSmartFilter: business.enableSmartFilter,
          ratingFieldId,
          currentRating,
          willRedirect: currentRating >= 4
        });
        
        // If smart filter is enabled, only redirect 4-5 star reviews
        const shouldRedirect = currentRating >= 4;
        console.log(shouldRedirect ? '⭐ High rating - Redirecting to Google' : '⚠️ Low rating - Keeping internal');
        console.log('=== END SMART FILTER DEBUG ===');
        
        return shouldRedirect;
      };
      
      if (shouldRedirectToGoogle()) {
        // Clean and validate the URL
        let reviewUrl = business.googleReviewUrl.trim();
        
        // Ensure URL has protocol
        if (!reviewUrl.startsWith('http://') && !reviewUrl.startsWith('https://')) {
          reviewUrl = 'https://' + reviewUrl;
        }
        
        // Set a 3-second countdown before redirect
        setCountdown(3);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              // Direct redirect to Google Review URL
              window.location.href = reviewUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // Extract rating for toast message
        const ratingField = template?.fields.find(f => f.fieldType === 'rating');
        const ratingIndex = template?.fields.findIndex(f => f.fieldType === 'rating');
        const ratingFieldId = ratingField?.id || `field-${ratingIndex}`;
        const currentRating = parseInt(formData[ratingFieldId]) || 0;
        
        // Show appropriate message based on smart filter status
        if (business.enableSmartFilter && currentRating < 4) {
          toast.success('Thank you for your feedback! We appreciate your input and will work to improve our service.');
        } else {
          toast.success('Thank you for your feedback! Your review has been submitted successfully.');
        }
      }
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Progress calculation
  const getProgress = () => {
    if (steps.length <= 1) return 0;
    return (currentStep / (steps.length - 1)) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading review form...</p>
        </div>
      </div>
    );
  }

  if (!business || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Review Form Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            This business is not currently accepting reviews.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const isWelcomeStep = currentStep === 0;
  const isThankYouStep = currentStep === steps.length - 1;
  const isLastFormStep = currentStep === steps.length - 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced Header with Glass Morphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-gray-200/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
              {business.logo && business.logo.trim() !== '' ? (
                <img 
                  src={business.logo} 
                  alt={`${business.name} logo`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover flex-shrink-0 border-2 border-white/50 shadow-lg"
                  onError={(e) => {
                    console.error('🖼️ Logo failed to load:', business.logo);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Logo loaded successfully:', business.logo);
                  }}
                />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/30">
                  <span className="text-white font-bold text-sm sm:text-lg">
                    {business.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent truncate">
                  {business.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 truncate font-medium">
                  {business.type} • Customer Review
                </p>
              </div>
            </div>
            
            {!isWelcomeStep && !isThankYouStep && (
              <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/50 shadow-lg">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 hidden sm:block">
                    Step {currentStep} of {steps.length - 2}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 sm:hidden">
                    {currentStep}/{steps.length - 2}
                  </p>
                  <div className="w-16 sm:w-20 md:w-24 h-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm"
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/30 to-purple-50/40 pointer-events-none"></div>
          <div className="relative">
          
          {/* Welcome Step */}
          {isWelcomeStep && (
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-2xl border-4 border-white/50 backdrop-blur-sm">
                  <Star className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
                  {currentStepData.title}
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
                  {currentStepData.description}
                </p>
                {business.customMessage && (
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200/50 shadow-lg mx-auto max-w-lg">
                    <p className="text-blue-800 text-sm sm:text-base leading-relaxed font-medium">
                      {business.customMessage}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={nextStep}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 sm:px-10 py-4 sm:py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-base sm:text-lg min-h-[56px] shadow-xl"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          )}

          {/* Form Steps */}
          {!isWelcomeStep && !isThankYouStep && (
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <span className="text-white font-bold text-lg sm:text-xl">{currentStep}</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {currentStepData.title}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-md mx-auto">
                  {currentStepData.description}
                </p>
              </div>

              <div className="space-y-5 sm:space-y-6 md:space-y-8">
                {currentStepData.fields.map((field, index) => {
                  const fieldId = field.id || `field-${index}`;
                  const isTextareaField = field.fieldType === 'textarea';
                console.log('🔍 Field check:', { 
                  fieldType: field.fieldType, 
                  isTextareaField, 
                  fieldLabel: field.label,
                  currentStep,
                  fieldId 
                });
                  
                  return (
                    <div key={fieldId}>
                      <DynamicFormField
                        field={{
                          ...field, 
                          id: fieldId,
                          // Ensure name, email, and rating are always marked as required
                          isRequired: (
                            (field.fieldType === 'text' && field.label && field.label.toLowerCase().includes('name')) ||
                            field.fieldType === 'email' ||
                            field.fieldType === 'rating' ||
                            (field.fieldType === 'textarea' && !(showEnhanced && aiEnhancedText)) ||
                            field.isRequired
                          ),
                          // Add helpful placeholder for email fields
                          placeholder: field.fieldType === 'email' ? 'Enter your Gmail or Yahoo email address' : field.placeholder
                        }}
                        value={formData[fieldId]}
                        onChange={handleFieldChange}
                        error={errors[fieldId]}
                        disabled={submitting}
                        // AI Enhancement props for textarea fields
                        showAIEnhancement={isTextareaField && showEnhanced && aiEnhancedText}
                        aiEnhancedText={isTextareaField ? aiEnhancedText : ''}
                        enhancing={isTextareaField && enhancing}
                        onCopyEnhanced={isTextareaField ? copyEnhancedText : null}
                        onTriggerEnhancement={isTextareaField ? () => triggerManualEnhancement(fieldId) : null}
                        onRewriteEnhancement={isTextareaField ? () => rewriteEnhancement(fieldId) : null}
                        onClearAI={isTextareaField ? clearAIReview : null}
                        // Show field as optional when AI review is generated
                        isOptionalDueToAI={showEnhanced && aiEnhancedText && field.fieldType !== 'rating'}
                        // Keyword props for textarea fields
                        recommendationKeywords={isTextareaField ? recommendationKeywords : []}
                        selectedKeywords={isTextareaField ? selectedKeywords : []}
                        onKeywordSelect={isTextareaField ? (keyword) => handleKeywordSelect(keyword, fieldId) : null}
                      />
                      
                      {/* Auto-generate option for textarea fields - hide when AI review is already shown */}
                      {console.log('🔍 Button visibility check:', { isTextareaField, showEnhanced, aiEnhancedText, fieldType: field.fieldType })}
                      {isTextareaField && !(showEnhanced && aiEnhancedText) && (
                        <div className="mt-6 p-6 sm:p-8 bg-gradient-to-br from-blue-50/80 via-white/60 to-purple-50/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                          <div className="text-center space-y-5 sm:space-y-6">
                            <div className="flex justify-center">
                              <div className="relative p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl shadow-lg">
                                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Need help writing your review?</h4>
                              <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
                                Let our AI create a personalized, professional review based on your rating and experience
                              </p>
                            </div>
                            
                            <button
                              onClick={() => {
                                console.log('🔥 GENERATE BUTTON CLICKED!');
                                handleAutoGenerate();
                              }}
                              disabled={autoGenerating || submitting}
                              className="group relative inline-flex items-center justify-center space-x-3 px-8 sm:px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-sm sm:text-base"
                            >
                              {autoGenerating ? (
                                <>
                                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                                  <span>Generating your review...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                                  <span>Generate Review with AI</span>
                                </>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                            
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                              ✨ Creates SEO-friendly, human-like reviews in seconds
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* AI Enhancement Loading - Only show when not enhanced yet */}
              {enhancing && !showEnhanced && (
                <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/50 rounded-2xl shadow-lg">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-3 border-purple-200 border-t-purple-600 shadow-sm"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-indigo-400/20 animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-semibold text-purple-900">AI is enhancing your review...</p>
                      <p className="text-xs sm:text-sm text-purple-700/70">Making it more professional and SEO-friendly</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/30">
                <button
                  onClick={prevStep}
                  disabled={submitting}
                  className="group flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl text-gray-700 hover:bg-white/80 transition-all duration-200 disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1 min-h-[48px] shadow-lg hover:shadow-xl"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back</span>
                </button>

                {isLastFormStep ? (
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="group relative flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 text-sm sm:text-base order-1 sm:order-2 min-h-[48px] w-full sm:w-auto shadow-xl hover:shadow-2xl"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <>
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                    <span>
                      {submitting ? 'Submitting...' : 'Submit & Copy Review'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={submitting}
                    className="group relative flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base order-1 sm:order-2 min-h-[48px] w-full sm:w-auto shadow-xl hover:shadow-2xl"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Thank You Step */}
          {isThankYouStep && submitted && (
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center shadow-2xl border-4 border-white/50">
                  <Check className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 bg-clip-text text-transparent">
                  Thank You!
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
                  Your review has been submitted successfully
                </p>
                {business.customMessage ? (
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-200/50 shadow-lg mb-6">
                    <p className="text-blue-800 text-sm sm:text-base leading-relaxed font-medium">
                      {business.customMessage}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-200/50 shadow-lg mb-6">
                    <p className="text-emerald-800 text-sm sm:text-base leading-relaxed font-medium">
                      We appreciate your feedback and will use it to improve our service.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                {business.googleReviewUrl && (() => {
                  // Get the rating from form data
                  const ratingField = template?.fields.find(f => f.fieldType === 'rating');
                  const ratingIndex = template?.fields.findIndex(f => f.fieldType === 'rating');
                  const ratingFieldId = ratingField?.id || `field-${ratingIndex}`;
                  const rating = formData[ratingFieldId] || 0;
                  
                  // Check if Google redirect should be shown
                  const shouldShowGoogleRedirect = !business.enableSmartFilter || rating >= 4;
                  
                  return shouldShowGoogleRedirect;
                })() && (
                  <div className="text-center space-y-4">
                    {countdown > 0 ? (
                      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-blue-200/50 shadow-lg">
                        <p className="text-blue-800 text-lg sm:text-xl font-bold mb-4">
                          Redirecting to Google Reviews in {countdown} seconds...
                        </p>
                        <div className="w-full bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full h-3 overflow-hidden shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${((3 - countdown + 1) / 3) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base text-gray-600 font-medium mb-4">
                        Help others discover {business.name} by leaving a Google review!
                      </p>
                    )}
                    <a
                      href={business.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center space-x-3 sm:space-x-4 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl font-semibold text-sm sm:text-base"
                    >
                      <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Leave a Google Review</span>
                      <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </a>
                    <p className="text-xs sm:text-sm text-gray-500 mt-3 font-medium max-w-md mx-auto">
                      Your review helps {business.name} grow and helps others make informed decisions
                    </p>
                  </div>
                )}

                {/* Low Rating Feedback Section (Smart Filter Active) */}
                {business.enableSmartFilter && business.googleReviewUrl && (() => {
                  const ratingField = template?.fields.find(f => f.fieldType === 'rating');
                  const ratingIndex = template?.fields.findIndex(f => f.fieldType === 'rating');
                  const ratingFieldId = ratingField?.id || `field-${ratingIndex}`;
                  const rating = formData[ratingFieldId] || 0;
                  
                  return rating > 0 && rating < 4;
                })() && (
                  <div className="text-center space-y-4 max-w-lg mx-auto mb-6">
                    <div className="bg-gradient-to-r from-orange-50/80 to-yellow-50/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-orange-200/50 shadow-lg">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-3xl flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-orange-800 mb-3">Thank You for Your Feedback!</h3>
                      <p className="text-orange-700 text-sm sm:text-base leading-relaxed mb-4 font-medium">
                        We truly value your input and are committed to improving our service. Your feedback helps us provide a better experience for all our customers.
                      </p>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-200/30">
                        <p className="text-orange-800 text-sm font-semibold flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>We'll use your review to improve our service</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-6 border-t border-white/30">
                  <button
                    onClick={() => navigate('/')}
                    className="group inline-flex items-center space-x-3 px-8 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl text-gray-700 hover:bg-white/80 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Heart className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;