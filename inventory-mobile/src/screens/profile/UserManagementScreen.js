import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import { mockUsers } from '../../constants/mockData';
import useAuth from '../../hooks/useAuth';
import authApi from '../../api/authApi';

export const UserManagementScreen = () => {
  const { register, isMockMode } = useAuth();
  const [userList, setUserList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_STAFF');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!isMockMode) {
        const users = await authApi.getUsers();
        setUserList(users || []);
      } else {
        setUserList([...mockUsers]);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
      setUserList([...mockUsers]);
    } finally {
      setIsLoading(false);
    }
  }, [isMockMode]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      if (!isMockMode) {
        const updated = await authApi.toggleUserStatus(userId, newStatus);
        setUserList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: updated.isActive } : u))
        );
      } else {
        setUserList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
        );
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update user status.');
    }
  };

  const handleAddUser = async () => {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const newUser = await register({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });
      await loadUsers();
      setModalVisible(false);
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
      Alert.alert('Success', `Staff member ${newUser.fullName || username} registered.`);
    } catch (err) {
      setError(err.message || 'Failed to add user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>System Users ({userList.length})</Text>
          <AppButton
            title="Add Staff"
            variant="primary"
            size="small"
            onPress={() => setModalVisible(true)}
            icon={<Ionicons name="person-add" size={16} color="#FFFFFF" />}
          />
        </View>

        <FlatList
          data={userList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadUsers}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const isAdmin = item.role === 'ROLE_ADMIN';
            return (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.fullName?.charAt(0) || 'U'}
                    </Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.name}>{item.fullName}</Text>
                    <Text style={styles.username}>@{item.username} • {item.email}</Text>
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
                            styles.roleText,
                            { color: isAdmin ? colors.primary : colors.textSecondary },
                          ]}
                        >
                          {isAdmin ? 'ADMIN' : 'STAFF'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: item.isActive
                              ? colors.successLight
                              : colors.dangerLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: item.isActive ? colors.success : colors.danger },
                          ]}
                        >
                          {item.isActive ? 'Active' : 'Suspended'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!isAdmin && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleStatus(item.id, item.isActive)}
                      style={[
                        styles.toggleBtn,
                        {
                          borderColor: item.isActive ? colors.danger : colors.success,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleBtnText,
                          {
                            color: item.isActive ? colors.danger : colors.success,
                          },
                        ]}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />

        {/* Modal: Add User */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Staff Member</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <AppInput
                label="Full Name *"
                placeholder="e.g. Rachel Adams"
                value={fullName}
                onChangeText={setFullName}
              />

              <AppInput
                label="Username *"
                placeholder="e.g. radams"
                value={username}
                onChangeText={setUsername}
              />

              <AppInput
                label="Email *"
                placeholder="rachel@inventory.local"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <AppInput
                label="Temporary Password *"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <View style={styles.modalBtnRow}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  size="small"
                  onPress={() => setModalVisible(false)}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <AppButton
                  title="Create"
                  variant="primary"
                  size="small"
                  loading={loading}
                  onPress={handleAddUser}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '800',
  },
  name: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  username: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.xs,
  },
  roleText: {
    ...typography.captionBold,
    fontSize: 10,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: borderRadius.xs,
  },
  statusText: {
    ...typography.captionBold,
    fontSize: 10,
  },
  toggleBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  toggleBtnText: {
    ...typography.captionBold,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});

export default UserManagementScreen;
