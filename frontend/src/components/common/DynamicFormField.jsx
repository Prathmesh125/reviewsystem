import { useState } from 'react';
import StarRating from './StarRating';
import { parseFieldOptions, parseValidationRules, validateEmail, validatePhone } from '../../services/publicApi';
import toast from 'react-hot-toast';

const DynamicFormField = ({ 
  field, 
  value, 
  onChange, 
  error = null,
  disabled = false,
  // AI Enhancement props
  showAIEnhancement = false,
  aiEnhancedText = '',
  enhancing = false,
  onCopyEnhanced = null,
  onTriggerEnhancement = null,
  onRewriteEnhancement = null,
  onClearAI = null,
  isOptionalDueToAI = false,
  // Keyword props
  recommendationKeywords = [],
  selectedKeywords = [],
  onKeywordSelect = null
}) => {
  const [focused, setFocused] = useState(false);

  const options = parseFieldOptions(field.options);
  const validation = parseValidationRules(field.validation);
  const fieldId = field.id || `field-${field.order || 0}`;

  const handleChange = (newValue) => {
    if (onChange) {
      onChange(fieldId, newValue);
    }
  };

  const getFieldError = () => {
    // Skip validation if AI review is generated and this is not a rating field
    if (isOptionalDueToAI && field.fieldType !== 'rating') {
      return null;
    }
    
    if (!field.isRequired && (!value || value === '')) return null;
    
    switch (field.fieldType) {
      case 'email':
        return value && !validateEmail(value) ? 'Please enter a valid email address' : null;
      case 'phone':
        return value && !validatePhone(value) ? 'Please enter a valid phone number' : null;
      case 'rating':
        return field.isRequired && (!value || value === 0) ? 'Please select a rating' : null;
      case 'textarea':
        // Skip textarea validation if AI review exists
        if (showAIEnhancement && aiEnhancedText) return null;
        return field.isRequired && (!value || value === '') ? `${field.label} is required` : null;
      default:
        return field.isRequired && (!value || value === '') ? `${field.label} is required` : null;
    }
  };

  const fieldError = error || getFieldError();

  const baseInputClasses = `
    w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${fieldError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${focused ? 'shadow-lg' : 'shadow-sm'}
  `;

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
        return (
          <input
            type="text"
            id={fieldId}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
            maxLength={validation.maxLength || 100}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            id={fieldId}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            id={fieldId}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={field.placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <div className="space-y-4">
            {/* Show textarea only if no AI review is generated OR if user wants to write manually */}
            {!showAIEnhancement && (
              <>
                <div className="relative">
                  <textarea
                    id={fieldId}
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={field.placeholder}
                    disabled={disabled}
                    rows={4}
                    className={baseInputClasses}
                    maxLength={validation.maxLength || 500}
                  />
                  
                  {/* Manual AI Enhancement Button */}
                  {value && value.trim().length >= 10 && !enhancing && onTriggerEnhancement && (
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={onTriggerEnhancement}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Enhance your review with AI"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>✨ Enhance with AI</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Character count */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {value && value.trim().length >= 10 
                      ? "💡 Tip: AI will auto-enhance your review as you type, or click the button above!" 
                      : "Write at least 10 characters to enable AI enhancement"
                    }
                  </span>
                  <span>{(value || '').length}/{validation.maxLength || 500}</span>
                </div>

                {/* Recommendation Keywords */}
                {recommendationKeywords && recommendationKeywords.length > 0 && onKeywordSelect && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg">
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">💡 Quick Keywords</h4>
                      <p className="text-xs text-gray-600">Click to add to your review</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recommendationKeywords.map((keyword, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => onKeywordSelect(keyword)}
                          disabled={selectedKeywords.includes(keyword)}
                          className={`
                            px-3 py-2 text-xs rounded-xl border transition-all duration-200 font-medium
                            ${selectedKeywords.includes(keyword)
                              ? 'bg-green-100 text-green-700 border-green-300 cursor-not-allowed opacity-75'
                              : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md transform hover:scale-105'
                            }
                          `}
                          title={selectedKeywords.includes(keyword) ? 'Already added to your review' : `Click to add "${keyword}" to your review`}
                        >
                          {selectedKeywords.includes(keyword) && (
                            <span className="mr-1">✓</span>
                          )}
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Show small button to write manually when AI review is shown */}
            {showAIEnhancement && aiEnhancedText && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    // Clear AI review and show textarea - this will be handled by parent
                    if (onClearAI) {
                      onClearAI();
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Write My Own Review Instead</span>
                </button>
              </div>
            )}
            
            {/* AI Enhancement Loading */}
            {enhancing && field.fieldType === 'textarea' && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">✨ AI is enhancing your review...</p>
                    <p className="text-xs text-purple-700">Making it more professional and SEO-friendly</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Enhanced Review */}
            {showAIEnhancement && aiEnhancedText && field.fieldType === 'textarea' && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">✨ AI Generated Review</h4>
                      <p className="text-xs text-gray-600">Ready to submit - no manual typing needed!</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Copy Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiEnhancedText);
                        toast.success('Review copied to clipboard!');
                      }}
                      className="flex items-center space-x-1 px-3 py-2 sm:px-2 sm:py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-lg transition-all duration-200 shadow-sm hover:shadow-md min-h-[36px] sm:min-h-auto"
                      title="Copy review to clipboard"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </button>
                    
                    {/* Rewrite Button */}
                    {onRewriteEnhancement && (
                      <button
                        onClick={onRewriteEnhancement}
                        disabled={enhancing}
                        className="flex items-center space-x-1 px-3 py-2 sm:px-2 sm:py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] sm:min-h-auto"
                        title="Generate a completely different version"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Rewrite</span>
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{aiEnhancedText}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>SEO Optimized</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>Professional</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Authentic</span>
                    </div>
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    📝 Review is ready for submission!
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <select
            id={fieldId}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option.value || option)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    const optionValue = option.value || option;
                    
                    if (e.target.checked) {
                      handleChange([...currentValue, optionValue]);
                    } else {
                      handleChange(currentValue.filter(v => v !== optionValue));
                    }
                  }}
                  disabled={disabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {option.label || option}
                </span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="flex justify-center py-4">
            <StarRating
              rating={value || 0}
              onRatingChange={handleChange}
              size="large"
              required={field.isRequired}
              error={fieldError}
            />
          </div>
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Unsupported field type: {field.fieldType}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Field Label */}
      <label 
        htmlFor={fieldId} 
        className="block text-sm font-medium text-gray-700"
      >
        {field.label}
        {field.isRequired && !isOptionalDueToAI && (
          <span className="text-red-500 ml-1">*</span>
        )}
        {isOptionalDueToAI && field.isRequired && (
          <span className="text-green-600 ml-1 text-xs">(optional due to AI review)</span>
        )}
      </label>

      {/* Field Input */}
      {renderField()}

      {/* Character count for text fields */}
      {(['text', 'textarea'].includes(field.fieldType)) && validation.maxLength && value && (
        <div className="text-right">
          <span className={`text-xs ${
            value.length > validation.maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {value.length}/{validation.maxLength}
          </span>
        </div>
      )}

      {/* Error Message - Don't show for textarea when AI review is present */}
      {fieldError && !(field.fieldType === 'textarea' && showAIEnhancement && aiEnhancedText) && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>⚠️</span>
          <span>{fieldError}</span>
        </p>
      )}

      {/* Help text */}
      {field.helpText && (
        <p className="text-xs text-gray-500">
          {field.helpText}
        </p>
      )}
    </div>
  );
};

export default DynamicFormField;