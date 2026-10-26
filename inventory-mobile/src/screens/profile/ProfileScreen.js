import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import AppButton from '../../components/AppButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import useAuth from '../../hooks/useAuth';

export const ProfileScreen = ({ navigation }) => {
  const { user, isAdmin, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.fullName}>{user?.fullName || 'User'}</Text>
              <Text style={styles.emailText}>{user?.email}</Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor: isAdmin
                        ? colors.primaryLight
                        : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      {
                        color: isAdmin ? colors.primary : colors.textSecondary,
                      },
                    ]}
                  >
                    {isAdmin ? 'SYSTEM ADMINISTRATOR' : 'STAFF MEMBER'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Directory Navigation Links */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Master Directories</Text>

          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('CategoriesTab')}
          >
            <View style={styles.navLeft}>
              <Ionicons name="folder-outline" size={20} color={colors.primary} />
              <Text style={styles.navText}>Categories Directory</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SuppliersTab')}
          >
            <View style={styles.navLeft}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
              <Text style={styles.navText}>Suppliers Directory</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={styles.navRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('UserManagement')}
            >
              <View style={styles.navLeft}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={styles.navText}>Staff & User Accounts (Admin)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>


        {/* Logout Button */}
        <AppButton
          title="Sign Out"
          variant="danger"
          onPress={() => setConfirmLogout(true)}
          icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Logout Confirmation */}
      <ConfirmDialog
        visible={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to end your current session?"
        confirmText="Sign Out"
        confirmVariant="danger"
        onConfirm={async () => {
          setConfirmLogout(false);
          await logout();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: '#FFFFFF',
  },
  fullName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  emailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  badgeRow: {
    marginTop: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  roleBadgeText: {
    ...typography.captionBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  logoutBtn: {
    marginVertical: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default ProfileScreen;
