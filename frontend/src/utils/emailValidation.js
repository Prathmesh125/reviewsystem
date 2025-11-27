// Email validation utilities

// Basic email regex pattern
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Common disposable email domains to block
const DISPOSABLE_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.org',
  'mailinator.com',
  'yopmail.com',
  'temp-mail.org',
  'throwaway.email',
  'maildrop.cc',
  'sharklasers.com',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org'
];

// Common domains for additional validation
const COMMON_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'live.com',
  'msn.com',
  'protonmail.com',
  'duck.com'
];

export const validateEmail = (email) => {
  const errors = [];
  const suggestions = [];
  
  // Allow empty input during typing
  if (!email || email.trim() === '') {
    return { isValid: true, errors: [], suggestions: [] };
  }
  
  // Allow partial input while user is typing
  if (!email.includes('@')) {
    return { isValid: true, errors: [], suggestions: [] };
  }
  
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: true, errors: [], suggestions: [] };
  }
  
  const [localPart, domainPart] = parts;
  
  // Allow partial domain input
  if (!domainPart || !domainPart.includes('.')) {
    return { isValid: true, errors: [], suggestions: [] };
  }
  
  // Only validate complete-looking emails
  try {
    // Basic format validation
    if (!EMAIL_REGEX.test(email)) {
      errors.push('Please enter a valid email address');
      return { isValid: false, errors, suggestions };
    }
    
    const domain = domainPart.toLowerCase();
    
    // Check for disposable email domains
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      errors.push('Disposable email addresses are not allowed. Please use a permanent email address.');
      return { isValid: false, errors, suggestions };
    }
    
    // Additional validation checks
    if (email.length > 254) {
      errors.push('Email address is too long');
    }
    
    if (localPart.length > 64) {
      errors.push('Email address format is invalid');
    }
    
    // Check for consecutive dots
    if (email.includes('..')) {
      errors.push('Email address format is invalid');
    }
    
    // Check for invalid characters
    if (email.includes(' ')) {
      errors.push('Email address cannot contain spaces');
    }
    
    // Add suggestions for common typos
    const emailSuggestions = getSuggestions(email, domain);
    suggestions.push(...emailSuggestions);
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  } catch (error) {
    // If any error occurs during validation, return as valid to avoid crashes
    console.error('Email validation error:', error);
    return { isValid: true, errors: [], suggestions: [] };
  }
};

const getSuggestions = (email, domain) => {
  const suggestions = [];
  
  try {
    // Common typo corrections
    const typoMap = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gmail.co': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'outloo.com': 'outlook.com'
    };
    
    if (typoMap[domain]) {
      suggestions.push(`Did you mean ${email.replace(domain, typoMap[domain])}?`);
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
  }
  
  return suggestions;
};

export const isValidEmailDomain = (email) => {
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    return !DISPOSABLE_DOMAINS.includes(domain);
  } catch (error) {
    return true; // Return true on error to avoid blocking
  }
};

export const isCommonEmailProvider = (email) => {
  try {
    const domain = email.split('@')[1]?.toLowerCase();
    return COMMON_DOMAINS.includes(domain);
  } catch (error) {
    return false;
  }
};