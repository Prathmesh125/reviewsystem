import api from './api';

const advancedAnalyticsAPI = {
  // Goal Management
  createGoal: async (goalData) => {
    try {
      const response = await api.post('/advanced-analytics/goals', goalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getBusinessGoals: async (businessId, status = 'ACTIVE') => {
    try {
      const response = await api.get(`/advanced-analytics/goals/${businessId}?status=${status}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateGoal: async (goalId, updateData) => {
    try {
      const response = await api.put(`/advanced-analytics/goals/${goalId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteGoal: async (goalId) => {
    try {
      const response = await api.delete(`/advanced-analytics/goals/${goalId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Insights Management
  generateInsights: async (businessId) => {
    try {
      const response = await api.post(`/advanced-analytics/insights/${businessId}/generate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getBusinessInsights: async (businessId, limit = 10) => {
    try {
      const response = await api.get(`/advanced-analytics/insights/${businessId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Industry Benchmarks
  getIndustryBenchmarks: async (businessId, industry = 'GENERAL') => {
    try {
      const response = await api.get(`/advanced-analytics/benchmarks/${businessId}?industry=${industry}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Dashboard Widgets
  getAvailableWidgets: async () => {
    try {
      const response = await api.get('/advanced-analytics/widgets');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default advancedAnalyticsAPI;