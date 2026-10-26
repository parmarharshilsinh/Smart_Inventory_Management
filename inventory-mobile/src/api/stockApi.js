import apiClient from './client';

export const stockApi = {
  recordStockIn: async (transactionData) => {
    const response = await apiClient.post('/transactions/stock-in', transactionData);
    return response.data;
  },

  recordStockOut: async (transactionData) => {
    const response = await apiClient.post('/transactions/stock-out', transactionData);
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await apiClient.get('/transactions/history', { params });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  },

  getLowStockAlerts: async () => {
    const response = await apiClient.get('/dashboard/low-stock');
    return response.data;
  },
};

export default stockApi;
