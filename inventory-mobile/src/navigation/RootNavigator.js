import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import useAuth from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { InventoryProvider } from '../context/InventoryContext';
import LoadingView from '../components/LoadingView';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingView fullScreen message="Initializing Smart Inventory..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      {isAuthenticated ? (
        <InventoryProvider>
          <MainNavigator />
        </InventoryProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
