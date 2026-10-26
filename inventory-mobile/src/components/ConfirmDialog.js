import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../theme';
import AppButton from './AppButton';

export const ConfirmDialog = ({
  visible,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={loading ? undefined : onCancel}
    >
      <TouchableWithoutFeedback onPress={loading ? undefined : onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  disabled={loading}
                  onPress={onCancel}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>

                <AppButton
                  title={confirmText}
                  onPress={onConfirm}
                  variant={confirmVariant}
                  size="small"
                  loading={loading}
                  style={styles.confirmBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  cancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  confirmBtn: {
    minWidth: 100,
  },
});

export default ConfirmDialog;
