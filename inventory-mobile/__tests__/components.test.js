import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Ionicons: (props) => React.createElement(View, { testID: `icon-${props.name}`, ...props }),
    MaterialIcons: (props) => React.createElement(View, { testID: `icon-${props.name}`, ...props }),
  };
});

import AppButton from '../src/components/AppButton';
import AppInput from '../src/components/AppInput';
import EmptyState from '../src/components/EmptyState';
import ErrorMessage from '../src/components/ErrorMessage';
import ProductCard from '../src/components/ProductCard';

describe('Core UI Components', () => {
  describe('AppButton Component', () => {
    it('renders title text and responds to press', async () => {
      const onPressMock = jest.fn();
      await render(<AppButton title="Submit Order" onPress={onPressMock} />);

      const btnText = screen.getByText('Submit Order');
      expect(btnText).toBeTruthy();

      fireEvent.press(btnText);
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('does not trigger press when disabled or loading', async () => {
      const onPressMock = jest.fn();
      const { rerender } = await render(
        <AppButton title="Disabled" onPress={onPressMock} disabled />
      );

      fireEvent.press(screen.getByText('Disabled'));
      expect(onPressMock).not.toHaveBeenCalled();

      await rerender(<AppButton title="Loading" onPress={onPressMock} loading />);
      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('AppInput Component', () => {
    it('renders label, placeholder, and handles text entry', async () => {
      const onChangeMock = jest.fn();
      await render(
        <AppInput
          label="SKU Code"
          placeholder="Enter SKU"
          value=""
          onChangeText={onChangeMock}
        />
      );

      expect(screen.getByText('SKU Code')).toBeTruthy();
      const input = screen.getByPlaceholderText('Enter SKU');
      fireEvent.changeText(input, 'SKU-TEST-99');
      expect(onChangeMock).toHaveBeenCalledWith('SKU-TEST-99');
    });

    it('renders error message when error prop is passed', async () => {
      await render(
        <AppInput
          label="Quantity"
          placeholder="0"
          value=""
          error="Quantity is required."
        />
      );

      expect(screen.getByText('Quantity is required.')).toBeTruthy();
    });
  });

  describe('EmptyState & ErrorMessage', () => {
    it('renders EmptyState with custom title, message and action button', async () => {
      const onAction = jest.fn();
      await render(
        <EmptyState
          title="No Products Found"
          description="Try broadening your search"
          actionTitle="Clear Search"
          onActionPress={onAction}
        />
      );

      expect(screen.getByText('No Products Found')).toBeTruthy();
      expect(screen.getByText('Try broadening your search')).toBeTruthy();

      fireEvent.press(screen.getByText('Clear Search'));
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('renders ErrorMessage with retry action', async () => {
      const onRetry = jest.fn();
      await render(<ErrorMessage message="Network connection failed" onRetry={onRetry} />);

      expect(screen.getByText('Network connection failed')).toBeTruthy();
      fireEvent.press(screen.getByText('Try Again'));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProductCard Component', () => {
    const mockProd = {
      id: 99,
      name: 'Wireless Ergonomic Keyboard',
      sku: 'SKU-KB-001',
      sellingPrice: 79.99,
      quantity: 14,
      minReorderLevel: 10,
      categoryName: 'Electronics',
      locationShelf: 'Aisle 2, Bin 4',
    };

    it('renders product details and badges accurately', async () => {
      const onStockIn = jest.fn();
      const onStockOut = jest.fn();
      const onPress = jest.fn();

      await render(
        <ProductCard
          product={mockProd}
          onPress={onPress}
          onStockInPress={onStockIn}
          onStockOutPress={onStockOut}
        />
      );

      expect(screen.getByText('Wireless Ergonomic Keyboard')).toBeTruthy();
      expect(screen.getByText('SKU: SKU-KB-001')).toBeTruthy();
      expect(screen.getByText('14 in stock')).toBeTruthy();
      expect(screen.getByText('Electronics')).toBeTruthy();
      expect(screen.getByText('₹79.99')).toBeTruthy();

      fireEvent.press(screen.getByText('In'));
      expect(onStockIn).toHaveBeenCalledTimes(1);

      fireEvent.press(screen.getByText('Out'));
      expect(onStockOut).toHaveBeenCalledTimes(1);
    });
  });
});
