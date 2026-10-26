import axios from 'axios';
import config from '../constants/config';
import storage from '../utils/storage';

// Current active base URL in memory
let currentBaseUrl = config.defaultBaseUrl;

// Create Axios client instance
const apiClient = axios.create({
  baseURL: currentBaseUrl,
  timeout: config.timeoutMs,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Configure and update base URL dynamically
 */
export const setBaseUrl = async (url) => {
  if (!url) return;
  const cleanUrl = url.trim().replace(/\/+$/, '');
  currentBaseUrl = cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
  apiClient.defaults.baseURL = currentBaseUrl;
  await storage.setItem(config.customUrlStorageKey, currentBaseUrl);
};

/**
 * Initialize base URL from saved storage if available
 */
export const initBaseUrl = async () => {
  const savedUrl = await storage.getItem(config.customUrlStorageKey);
  if (savedUrl) {
    currentBaseUrl = savedUrl;
    apiClient.defaults.baseURL = savedUrl;
  }
  return currentBaseUrl;
};

export const getBaseUrl = () => currentBaseUrl;

// Request Interceptor: Attach JWT Token from SecureStore
apiClient.interceptors.request.use(
  async (reqConfig) => {
    try {
      const token = await storage.getItem(config.tokenStorageKey);
      if (token && !reqConfig.headers.Authorization) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore read error fallback
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize Error Responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const customError = {
      status: error.response?.status || 0,
      message: 'An unexpected error occurred.',
      details: null,
      isNetworkError: false,
    };

    if (error.response) {
      // Server responded with an HTTP status code outside of 2xx
      const data = error.response.data;
      const status = error.response.status;

      customError.status = status;
      customError.details = data;

      switch (status) {
        case 400:
          customError.message =
            data?.message || data?.error || 'Invalid request. Please check input data.';
          break;
        case 401:
          customError.message = 'Session expired or invalid credentials. Please log in again.';
          break;
        case 403:
          customError.message = 'Access denied. You do not have permission for this action.';
          break;
        case 404:
          customError.message = data?.message || 'Requested resource could not be found.';
          break;
        case 409:
          customError.message = data?.message || 'Conflict: Record already exists.';
          break;
        case 500:
          customError.message = 'Internal server error. Please try again later.';
          break;
        default:
          customError.message = data?.message || `Server error (${status}).`;
      }
    } else if (error.request) {
      // The request was made but no response was received (Network error / Backend down)
      customError.isNetworkError = true;
      customError.message =
        'Cannot connect to backend server. Please verify network or server address.';
    } else {
      customError.message = error.message;
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
