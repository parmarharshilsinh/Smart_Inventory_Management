import apiClient from './client';

export const productApi = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode) => {
    const response = await apiClient.get(`/products/barcode/${encodeURIComponent(barcode)}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

export default productApi;
