import api from './api';

const superAdminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/super-admin/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all users with pagination
  getUsers: async (page = 1, limit = 20, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      const response = await api.get(`/super-admin/users?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all businesses with pagination
  getBusinesses: async (page = 1, limit = 20, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      const response = await api.get(`/super-admin/businesses?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all reviews with pagination
  getReviews: async (page = 1, limit = 20, status = 'all') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status
      });
      const response = await api.get(`/super-admin/reviews?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle user status (activate/suspend)
  toggleUserStatus: async (userId, isActive) => {
    try {
      const response = await api.put(`/super-admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/super-admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete business
  deleteBusiness: async (businessId) => {
    try {
      const response = await api.delete(`/super-admin/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Moderate review
  moderateReview: async (reviewId, status, moderatorNotes = '') => {
    try {
      const response = await api.put(`/super-admin/reviews/${reviewId}/moderate`, {
        status,
        moderatorNotes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get platform analytics
  getPlatformAnalytics: async (range = '30days') => {
    try {
      const response = await api.get(`/super-admin/analytics?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get system health
  getSystemHealth: async () => {
    try {
      const response = await api.get('/super-admin/system-health');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update business status
  updateBusinessStatus: async (businessId, isApproved, notes = '') => {
    try {
      const response = await api.put(`/super-admin/businesses/${businessId}/status`, {
        isApproved,
        notes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reset user password
  resetUserPassword: async (userId) => {
    try {
      const response = await api.post(`/super-admin/users/${userId}/reset-password`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get audit logs
  getAuditLogs: async (page = 1, limit = 20, action = '', userId = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(action && { action }),
        ...(userId && { userId })
      });
      const response = await api.get(`/super-admin/audit-logs?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Hierarchical Navigation APIs
  
  // Get businesses for a specific user
  getUserBusinesses: async (userId) => {
    try {
      const response = await api.get(`/super-admin/users/${userId}/businesses`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get customers for a specific business
  getBusinessCustomers: async (businessId) => {
    try {
      const response = await api.get(`/super-admin/businesses/${businessId}/customers`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get reviews for a specific business
  getBusinessReviews: async (businessId) => {
    try {
      const response = await api.get(`/super-admin/businesses/${businessId}/reviews`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get detailed business analytics
  getBusinessAnalytics: async (businessId, range = '30days') => {
    try {
      const response = await api.get(`/super-admin/businesses/${businessId}/analytics?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export business data (CSV/Excel)
  exportBusinessData: async (businessId, format = 'csv') => {
    try {
      const response = await api.get(`/super-admin/businesses/${businessId}/export?format=${format}`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user activity logs
  getUserActivityLogs: async (userId, page = 1, limit = 20) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await api.get(`/super-admin/users/${userId}/activity?${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Advanced Monitoring APIs

  // Real-time monitoring
  getRealTimeStats: async () => {
    try {
      const response = await api.get('/super-admin/real-time/stats');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getRecentActivities: async (limit = 50) => {
    try {
      const response = await api.get(`/super-admin/real-time/activities?limit=${limit}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Revenue analytics
  getRevenueAnalytics: async (range = '30days') => {
    try {
      const response = await api.get(`/super-admin/analytics/revenue?range=${range}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSubscriptionMetrics: async () => {
    try {
      const response = await api.get('/super-admin/analytics/subscriptions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Security analytics
  getSecurityAnalytics: async () => {
    try {
      const response = await api.get('/super-admin/security/analytics');
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getLoginAnalytics: async (range = '7days') => {
    try {
      const response = await api.get(`/super-admin/security/logins?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Content moderation
  getModerationQueue: async (status = 'pending') => {
    try {
      const response = await api.get(`/super-admin/moderation/queue?status=${status}`);
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  bulkModerateReviews: async (action, reviewIds) => {
    try {
      const response = await api.post('/super-admin/moderation/bulk', {
        action,
        reviewIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getModerationStats: async () => {
    try {
      const response = await api.get('/super-admin/moderation/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Performance monitoring
  getPerformanceMetrics: async () => {
    try {
      const response = await api.get('/super-admin/performance/metrics');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User session monitoring
  getActiveSessions: async () => {
    try {
      const response = await api.get('/super-admin/sessions/active');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default superAdminAPI;