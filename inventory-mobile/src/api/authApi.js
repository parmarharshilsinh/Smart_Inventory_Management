import apiClient from './client';

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  toggleUserStatus: async (userId, isActive) => {
    const response = await apiClient.patch(`/users/${userId}/status`, { isActive });
    return response.data;
  },
};

export default authApi;
