import apiClient from './client';

export const categoryApi = {
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryApi;
