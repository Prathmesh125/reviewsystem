import axios from 'axios'
import { auth } from '../config/firebase'

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout (increased from 10)
})

// Request interceptor to add Firebase auth token
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('Making API request to:', config.url);
      
      // Get current user from Firebase
      let user = auth.currentUser;
      
      // If no user, wait a bit for Firebase auth state to settle
      if (!user) {
        console.log('No Firebase user found, waiting for auth state...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        user = auth.currentUser;
      }
      
      if (user) {
        // Get the Firebase ID token
        const token = await user.getIdToken();
        console.log('Adding Firebase token to request');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('No Firebase user available after waiting');
      }
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      // Continue with request even if token fetch fails
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.error('Unauthorized access - redirecting to login')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error('Insufficient permissions')
    }
    
    if (error.response?.status === 429) {
      // Rate limited
      console.error('Too many requests, please slow down')
    }
    
    if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('Request timeout - server took too long to respond')
      error.message = 'Request timeout - please try again'
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.error('Network connection failed')
      error.message = 'Network connection failed. Please check your internet connection and try again.'
    }
    
    if (!error.response && !error.code) {
      // Generic network error
      console.error('Unknown network error')
      error.message = 'Unable to connect to server. Please check your internet connection and try again.'
    }
    
    return Promise.reject(error)
  }
)

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  refreshToken: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
}

// Business API calls
export const businessAPI = {
  create: (businessData) => api.post('/business', businessData),
  update: (id, businessData) => api.put(`/business/${id}`, businessData),
  get: (id) => api.get(`/business/${id}`),
  getPublic: (id) => api.get(`/business/${id}/public`),
  list: () => api.get('/business'),
  delete: (id) => api.delete(`/business/${id}`),
  publish: (id) => api.post(`/business/${id}/publish`),
  getAnalytics: (id) => api.get(`/business/${id}/analytics`),
}

// Customer API calls
export const customerAPI = {
  list: (businessId) => api.get(`/customers/${businessId}`),
  get: (id) => api.get(`/customers/detail/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`),
}

// Review API calls
export const reviewAPI = {
  generate: (reviewData) => api.post('/reviews/generate', reviewData),
  list: (businessId) => api.get(`/reviews/business/${businessId}`),
  get: (id) => api.get(`/reviews/${id}`),
  updateStatus: (id, status) => api.put(`/reviews/${id}/status`, { status }),
  trackSubmission: (id, data) => api.post(`/reviews/${id}/track-submission`, data),
}

// QR Code API calls
export const qrCodeAPI = {
  generate: (qrData) => api.post('/qr-codes/generate', qrData),
  list: (businessId) => api.get(`/qr-codes/business/${businessId}`),
  get: (id) => api.get(`/qr-codes/${id}`),
  update: (id, qrData) => api.put(`/qr-codes/${id}`, qrData),
  delete: (id) => api.delete(`/qr-codes/${id}`),
  trackScan: (id, scanData) => api.post(`/qr-codes/${id}/track-scan`, scanData),
  getAnalytics: (id) => api.get(`/qr-codes/${id}/analytics`),
}

// Dashboard API calls
export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getAnalytics: (businessId, dateRange) => 
    api.get(`/analytics/${businessId}`, { params: { dateRange } }),
}

// Super Admin API calls
export const superAdminAPI = {
  getDashboard: () => api.get('/super-admin/dashboard'),
  getUsers: (params) => api.get('/super-admin/users', { params }),
  getBusinesses: (params) => api.get('/super-admin/businesses', { params }),
  getCustomers: (params) => api.get('/super-admin/customers', { params }),
  getReviews: (params) => api.get('/super-admin/reviews', { params }),
  toggleUserStatus: (userId) => api.put(`/super-admin/user/${userId}/toggle-active`),
  deleteUser: (userId) => api.delete(`/super-admin/user/${userId}`),
  getAnalytics: (type, dateRange) => 
    api.get(`/super-admin/analytics/${type}`, { params: { dateRange } }),
  getSystemHealth: () => api.get('/super-admin/system-health'),
}

// File upload API calls
export const uploadAPI = {
  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append('logo', file)
    return api.post('/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  uploadQRCode: (file) => {
    const formData = new FormData()
    formData.append('qrCode', file)
    return api.post('/upload/qr-code', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// Health check
export const healthCheck = () => 
  axios.get(`${API_BASE_URL}/health`)

export default api