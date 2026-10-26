import { Platform } from 'react-native';

// Default backend host according to platform
// Android Emulator uses 10.0.2.2 to reach host machine's localhost
// iOS simulator and web use localhost
const getDefaultHost = () => {
  if (Platform.OS === 'android') {
    return '10.218.248.111';
  }
  return 'localhost';
};

export const DEFAULT_PORT = '8080';
export const API_PREFIX = '/api/v1';

export const config = {
  appName: 'Smart Inventory',
  version: '1.0.0',
  defaultHost: getDefaultHost(),
  defaultPort: DEFAULT_PORT,
  defaultBaseUrl: `http://${getDefaultHost()}:${DEFAULT_PORT}${API_PREFIX}`,
  timeoutMs: 10000,
  tokenStorageKey: 'smart_inventory_auth_token',
  userStorageKey: 'smart_inventory_user_profile',
  customUrlStorageKey: 'smart_inventory_custom_api_url',
  mockModeStorageKey: 'smart_inventory_mock_mode',
};

export default config;
