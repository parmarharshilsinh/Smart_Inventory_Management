import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import AppButton from './AppButton';

export const EmptyState = ({
  icon = 'cube-outline',
  title = 'No items found',
  description = 'There are no records to display matching your criteria.',
  actionTitle,
  onActionPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionTitle && onActionPress ? (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          variant="primary"
          size="small"
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    marginTop: spacing.xs,
  },
});

export default EmptyState;
