const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Public API functions (no authentication required)
export const getPublicFormTemplate = async (businessId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/form-templates/public/${businessId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Business not found or not accepting reviews');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to load review form');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching form template:', error);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/customers/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create customer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const submitReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit review');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

// Helper function to validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate phone
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Helper function to parse form field options
export const parseFieldOptions = (options) => {
  try {
    return typeof options === 'string' ? JSON.parse(options) : options;
  } catch {
    return [];
  }
};

// Helper function to parse validation rules
export const parseValidationRules = (validation) => {
  try {
    return typeof validation === 'string' ? JSON.parse(validation) : validation;
  } catch {
    return {};
  }
};