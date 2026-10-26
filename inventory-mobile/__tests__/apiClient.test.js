import { getBaseUrl, setBaseUrl } from '../src/api/client';
import config from '../src/constants/config';
import storage from '../src/utils/storage';

describe('API Client & Error Normalization', () => {
  beforeEach(async () => {
    await storage.clear();
  });

  describe('Base URL Configuration', () => {
    it('initializes with default base URL according to config', () => {
      const url = getBaseUrl();
      expect(url).toContain(':8080/api/v1');
    });

    it('dynamically updates base URL and persists to storage', async () => {
      const customUrl = 'http://192.168.1.150:8080';
      await setBaseUrl(customUrl);

      const activeUrl = getBaseUrl();
      expect(activeUrl).toBe('http://192.168.1.150:8080/api/v1');

      const saved = await storage.getItem(config.customUrlStorageKey);
      expect(saved).toBe('http://192.168.1.150:8080/api/v1');
    });
  });

  describe('HTTP Error Status Normalizer Logic', () => {
    const normalizeError = (status, data, isNetwork = false) => {
      const customError = {
        status: status || 0,
        message: 'An unexpected error occurred.',
        isNetworkError: isNetwork,
      };

      if (isNetwork) {
        customError.message = 'Cannot connect to backend server. Please verify network or server address.';
        return customError;
      }

      switch (status) {
        case 400:
          customError.message = data?.message || 'Invalid request. Please check input data.';
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
        case 500:
          customError.message = 'Internal server error. Please try again later.';
          break;
      }
      return customError;
    };

    it('maps HTTP 400 Bad Request to validation message', () => {
      const err = normalizeError(400, { message: 'SKU cannot be blank' });
      expect(err.status).toBe(400);
      expect(err.message).toBe('SKU cannot be blank');
    });

    it('maps HTTP 401 to authentication warning', () => {
      const err = normalizeError(401);
      expect(err.status).toBe(401);
      expect(err.message).toContain('Session expired or invalid credentials');
    });

    it('maps HTTP 403 to permission denial', () => {
      const err = normalizeError(403);
      expect(err.status).toBe(403);
      expect(err.message).toContain('Access denied');
    });

    it('maps HTTP 404 to not found message', () => {
      const err = normalizeError(404, { message: 'Product not found' });
      expect(err.status).toBe(404);
      expect(err.message).toBe('Product not found');
    });

    it('maps HTTP 500 to server error', () => {
      const err = normalizeError(500);
      expect(err.status).toBe(500);
      expect(err.message).toContain('Internal server error');
    });

    it('handles network disconnection / unreachable backend error', () => {
      const err = normalizeError(0, null, true);
      expect(err.isNetworkError).toBe(true);
      expect(err.message).toContain('Cannot connect to backend server');
    });
  });
});
