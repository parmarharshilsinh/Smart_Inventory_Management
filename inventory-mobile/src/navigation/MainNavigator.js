import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import useInventory from '../hooks/useInventory';

// Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import EditProductScreen from '../screens/products/EditProductScreen';
import CategoryListScreen from '../screens/categories/CategoryListScreen';
import SupplierListScreen from '../screens/suppliers/SupplierListScreen';
import StockInScreen from '../screens/stock/StockInScreen';
import StockOutScreen from '../screens/stock/StockOutScreen';
import StockHistoryScreen from '../screens/stock/StockHistoryScreen';
import LowStockAlertsScreen from '../screens/alerts/LowStockAlertsScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UserManagementScreen from '../screens/profile/UserManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const BottomTabNavigator = () => {
  const { lowStockItems } = useInventory();
  const alertCount = lowStockItems.length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: colors.textPrimary,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProductsTab"
        component={ProductListScreen}
        options={{
          title: 'Catalog',
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="StockTab"
        component={StockHistoryScreen}
        options={{
          title: 'Stock Audit',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AlertsTab"
        component={LowStockAlertsScreen}
        options={{
          title: 'Stock Alerts',
          tabBarLabel: 'Alerts',
          tabBarBadge: alertCount > 0 ? alertCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.warning,
            fontSize: 10,
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: colors.textPrimary,
        },
        headerTintColor: colors.primary,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Sub-screens */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Overview' }}
      />

      <Stack.Screen
        name="AddProduct"
        component={AddProductScreen}
        options={{ title: 'Add New Product' }}
      />

      <Stack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: 'Edit Product' }}
      />

      <Stack.Screen
        name="StockIn"
        component={StockInScreen}
        options={{ title: 'Receive Stock (In)' }}
      />

      <Stack.Screen
        name="StockOut"
        component={StockOutScreen}
        options={{ title: 'Dispatch Stock (Out)' }}
      />

      <Stack.Screen
        name="StockHistory"
        component={StockHistoryScreen}
        options={{ title: 'Movement History' }}
      />

      <Stack.Screen
        name="LowStockAlerts"
        component={LowStockAlertsScreen}
        options={{ title: 'Low Stock Alerts' }}
      />

      <Stack.Screen
        name="CategoriesTab"
        component={CategoryListScreen}
        options={{ title: 'Category Master' }}
      />

      <Stack.Screen
        name="SuppliersTab"
        component={SupplierListScreen}
        options={{ title: 'Supplier Directory' }}
      />

      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ title: 'Staff Accounts' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
