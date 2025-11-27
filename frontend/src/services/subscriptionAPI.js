import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebase_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const subscriptionAPI = {
  // Get all subscription plans
  getPlans: async () => {
    const response = await api.get('/subscription/plans');
    return response.data;
  },

  // Get current user subscription
  getCurrentSubscription: async () => {
    const response = await api.get('/subscription/current');
    return response.data;
  },

  // Get subscription usage stats
  getUsageStats: async () => {
    const response = await api.get('/subscription/usage');
    return response.data;
  },

  // Create new subscription
  subscribe: async (planId) => {
    const response = await api.post('/subscription/subscribe', { planId });
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async () => {
    const response = await api.post('/subscription/cancel');
    return response.data;
  },

  // Upgrade subscription
  upgradeSubscription: async (planId) => {
    const response = await api.post('/subscription/upgrade', { planId });
    return response.data;
  },

  // Create Stripe checkout session (placeholder)
  createCheckoutSession: async (planId) => {
    const response = await api.post('/subscription/create-checkout-session', { planId });
    return response.data;
  },

  // Handle successful payment
  handleSuccessfulPayment: async (sessionId) => {
    const response = await api.post('/subscription/payment-success', { sessionId });
    return response.data;
  }
};

export default subscriptionAPI;