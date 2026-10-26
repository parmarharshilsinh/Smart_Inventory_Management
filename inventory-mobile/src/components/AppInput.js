import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../theme';

export const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style,
  inputStyle,
  testID,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}

        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && { height: numberOfLines * 24 + 16, textAlignVertical: 'top' },
            inputStyle,
          ]}
          {...props}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIconWrapper}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  inputDisabled: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    opacity: 0.8,
  },
  inputMultiline: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: colors.textPrimary,
  },
  leftIconWrapper: {
    marginRight: spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default AppInput;
