import apiClient from './client';

export const reportApi = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/dashboard/metrics');
    return response.data;
  },

  getInventoryValuationReport: async () => {
    const response = await apiClient.get('/reports/valuation');
    return response.data;
  },

  getCategoryBreakdown: async () => {
    const response = await apiClient.get('/reports/category-breakdown');
    return response.data;
  },
};

export default reportApi;
