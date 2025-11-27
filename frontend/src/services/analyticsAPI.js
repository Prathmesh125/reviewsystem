import api from './api';

const analyticsAPI = {
  // Get business analytics data
  getBusinessAnalytics: async (businessId, range = '7days') => {
    try {
      const response = await api.get(`/analytics/business/${businessId}?range=${range}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Export analytics data as CSV
  exportBusinessAnalytics: async (businessId, range = '7days') => {
    try {
      const response = await api.get(`/analytics/business/${businessId}/export?range=${range}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default analyticsAPI;