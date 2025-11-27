import api from './api';

const businessAPI = {
  // Get all businesses for the current user
  getBusinesses: async () => {
    try {
      const response = await api.get('/business');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a specific business by ID
  getBusiness: async (id) => {
    try {
      const response = await api.get(`/business/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create a new business
  createBusiness: async (businessData) => {
    try {
      const response = await api.post('/business', businessData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update a business
  updateBusiness: async (id, businessData) => {
    try {
      const response = await api.put(`/business/${id}`, businessData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a business
  deleteBusiness: async (id) => {
    try {
      const response = await api.delete(`/business/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle business publication status
  togglePublication: async (id) => {
    try {
      const response = await api.patch(`/business/${id}/publish`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default businessAPI;