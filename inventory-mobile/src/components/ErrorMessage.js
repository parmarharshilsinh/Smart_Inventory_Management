import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../theme';
import AppButton from './AppButton';

export const ErrorMessage = ({
  message = 'An error occurred while loading data.',
  onRetry,
  style,
}) => {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.contentRow}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
        <Text style={styles.messageText}>{message}</Text>
      </View>
      {onRetry ? (
        <AppButton
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          size="small"
          style={styles.retryBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    ...typography.body,
    color: colors.danger,
    marginLeft: spacing.sm,
    flex: 1,
  },
  retryBtn: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    borderColor: colors.danger,
  },
});

export default ErrorMessage;
