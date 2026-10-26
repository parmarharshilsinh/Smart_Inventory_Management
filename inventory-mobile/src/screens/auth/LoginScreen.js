import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import ErrorMessage from '../../components/ErrorMessage';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validators';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleLogin = async () => {
    setApiError('');
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
      // Navigation is automatically handled by AuthContext state in RootNavigator
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@inventory.local');
      setPassword('Admin@123');
    } else {
      setEmail('staff@inventory.local');
      setPassword('Staff@123');
    }
    setErrors({});
    setApiError('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Brand */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Ionicons name="cube" size={40} color={colors.primary} />
            </View>
            <Text style={styles.appName}>Smart Inventory</Text>
            <Text style={styles.tagline}>Mobile Stock Management System</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your credentials to access the inventory system
            </Text>

            <ErrorMessage message={apiError} />

            <AppInput
              testID="email-input"
              label="Email Address"
              placeholder="user@inventory.local"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            />

            <AppInput
              testID="password-input"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              error={errors.password}
              secureTextEntry
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              }
            />

            <AppButton
              testID="login-button"
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="large"
              style={styles.loginBtn}
            />

            {/* Quick Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Quick Presentation Login:</Text>
              <View style={styles.demoBtnRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => fillQuickDemo('admin')}
                  style={[styles.demoChip, styles.adminChip]}
                >
                  <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                  <Text style={styles.adminChipText}>Admin User</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => fillQuickDemo('staff')}
                  style={[styles.demoChip, styles.staffChip]}
                >
                  <Ionicons name="person" size={14} color={colors.textSecondary} />
                  <Text style={styles.staffChipText}>Staff User</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Need a staff account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  loginBtn: {
    marginTop: spacing.xs,
  },
  demoSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  demoBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
  },
  adminChip: {
    backgroundColor: colors.primaryLight,
  },
  adminChipText: {
    ...typography.captionBold,
    color: colors.primary,
    marginLeft: 4,
  },
  staffChip: {
    backgroundColor: colors.border,
  },
  staffChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default LoginScreen;
