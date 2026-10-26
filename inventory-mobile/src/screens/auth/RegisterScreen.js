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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import ErrorMessage from '../../components/ErrorMessage';
import useAuth from '../../hooks/useAuth';
import {
  validateRequired,
  validateEmail,
  validatePassword,
} from '../../utils/validators';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleRegister = async () => {
    setApiError('');
    const nameErr = validateRequired(fullName, 'Full Name');
    const userErr = validateRequired(username, 'Username');
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    let matchErr = null;
    if (password !== confirmPassword) {
      matchErr = 'Passwords do not match.';
    }

    if (nameErr || userErr || emailErr || passErr || matchErr) {
      setErrors({
        fullName: nameErr,
        username: userErr,
        email: emailErr,
        password: passErr,
        confirmPassword: matchErr,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register({
        fullName,
        username,
        email,
        password,
        role: 'ROLE_STAFF',
      });
      Alert.alert(
        'Registration Successful',
        'Your staff account has been created. Please log in with your credentials.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Registration</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>
              Register for warehouse and store access
            </Text>

            <ErrorMessage message={apiError} />

            <AppInput
              label="Full Name"
              placeholder="e.g. John Doe"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors((p) => ({ ...p, fullName: null }));
              }}
              error={errors.fullName}
              autoCapitalize="words"
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textSecondary} />}
            />

            <AppInput
              label="Username"
              placeholder="e.g. jdoe"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors((p) => ({ ...p, username: null }));
              }}
              error={errors.username}
              autoCapitalize="none"
              leftIcon={<Ionicons name="at-outline" size={20} color={colors.textSecondary} />}
            />

            <AppInput
              label="Email Address"
              placeholder="john@inventory.local"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((p) => ({ ...p, email: null }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
            />

            <AppInput
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((p) => ({ ...p, password: null }));
              }}
              error={errors.password}
              secureTextEntry
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              }
            />

            <AppInput
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors((p) => ({ ...p, confirmPassword: null }));
              }}
              error={errors.confirmPassword}
              secureTextEntry
              leftIcon={
                <Ionicons name="checkmark-done-outline" size={20} color={colors.textSecondary} />
              }
            />

            <AppButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="large"
              style={styles.submitBtn}
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Sign In</Text>
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
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
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
  submitBtn: {
    marginTop: spacing.sm,
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
  loginLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default RegisterScreen;
