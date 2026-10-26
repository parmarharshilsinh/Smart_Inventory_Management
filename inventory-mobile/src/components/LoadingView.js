import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export const LoadingView = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default LoadingView;
