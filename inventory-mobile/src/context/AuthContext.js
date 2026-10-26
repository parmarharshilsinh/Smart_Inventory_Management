import React, { createContext, useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import config from '../constants/config';
import authApi from '../api/authApi';
import { mockUsers } from '../constants/mockData';
import { initBaseUrl } from '../api/client';

export const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isMockMode: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  toggleMockMode: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false); // Live Spring Boot API mode by default

  // Restore authentication state on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await initBaseUrl();
        const savedMockMode = await storage.getItem(config.mockModeStorageKey);
        if (savedMockMode !== null) {
          setIsMockMode(savedMockMode === 'true');
        }

        const savedToken = await storage.getItem(config.tokenStorageKey);
        const savedUser = await storage.getObject(config.userStorageKey);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (e) {
        console.warn('Failed to restore auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = useCallback(
    async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();

      if (!isMockMode) {
        // Live Spring Boot API mode
        const data = await authApi.login(cleanEmail, password);
        const userObj = {
          id: data.userId || data.id,
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          role: Array.isArray(data.roles) ? data.roles[0] : data.role || 'ROLE_STAFF',
        };
        const authToken = data.token;

        await storage.setItem(config.tokenStorageKey, authToken);
        await storage.setItem(config.userStorageKey, userObj);

        setToken(authToken);
        setUser(userObj);
        return userObj;
      }

      // ISOLATED MOCK MODE (For standalone UI demo & testing before backend is live)
      await new Promise((r) => setTimeout(r, 400));
      const foundUser = mockUsers.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.isActive
      );

      if (!foundUser) {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        throw error;
      }

      const mockToken = `mock-jwt-token-for-${foundUser.username}`;
      await storage.setItem(config.tokenStorageKey, mockToken);
      await storage.setItem(config.userStorageKey, foundUser);

      setToken(mockToken);
      setUser(foundUser);
      return foundUser;
    },
    [isMockMode]
  );

  const register = useCallback(
    async (userData) => {
      if (!isMockMode) {
        return await authApi.register(userData);
      }
      // Mock registration
      await new Promise((r) => setTimeout(r, 400));
      const newUser = {
        id: Date.now(),
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role || 'ROLE_STAFF',
        isActive: true,
      };
      mockUsers.push(newUser);
      return newUser;
    },
    [isMockMode]
  );

  const logout = useCallback(async () => {
    try {
      await storage.removeItem(config.tokenStorageKey);
      await storage.removeItem(config.userStorageKey);
    } catch (e) {
      console.warn('Error during logout cleanup:', e);
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const toggleMockMode = useCallback(async (enableMock) => {
    setIsMockMode(enableMock);
    await storage.setItem(config.mockModeStorageKey, String(enableMock));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!isMockMode && token) {
      try {
        const freshUser = await authApi.getCurrentUser();
        setUser(freshUser);
        await storage.setItem(config.userStorageKey, freshUser);
      } catch (err) {
        console.warn('Could not refresh profile:', err);
      }
    }
  }, [isMockMode, token]);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isMockMode,
        login,
        register,
        logout,
        toggleMockMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
