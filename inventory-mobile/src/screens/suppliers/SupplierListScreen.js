import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import useInventory from '../../hooks/useInventory';
import useAuth from '../../hooks/useAuth';

export const SupplierListScreen = () => {
  const { suppliers, addSupplier, isLoading, loadAllData } = useInventory();
  const { isAdmin } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddSupplier = async () => {
    if (!companyName.trim()) {
      setError('Company name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addSupplier({
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setAddress('');
      setModalVisible(false);
      Alert.alert('Success', 'Supplier added successfully.');
    } catch (err) {
      setError(err.message || 'Failed to add supplier.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Suppliers ({suppliers.length})</Text>
          {isAdmin && (
            <AppButton
              title="Add Supplier"
              variant="primary"
              size="small"
              onPress={() => setModalVisible(true)}
              icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
            />
          )}
        </View>

        <FlatList
          data={suppliers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadAllData}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="business" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.companyName}>{item.companyName}</Text>
                  {item.contactPerson ? (
                    <Text style={styles.contactPerson}>
                      Contact: {item.contactPerson}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.detailsDivider} />

              {item.email ? (
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{item.email}</Text>
                </View>
              ) : null}

              {item.phone ? (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoText}>{item.phone}</Text>
                </View>
              ) : null}

              {item.address ? (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              ) : null}
            </View>
          )}
        />

        {/* Add Supplier Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add New Supplier</Text>

              <AppInput
                label="Company Name *"
                placeholder="e.g. Apex Electronics Ltd"
                value={companyName}
                onChangeText={setCompanyName}
                error={error}
              />

              <AppInput
                label="Contact Person"
                placeholder="e.g. Sarah Jenkins"
                value={contactPerson}
                onChangeText={setContactPerson}
              />

              <AppInput
                label="Email Address"
                placeholder="orders@supplier.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <AppInput
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <AppInput
                label="Address / Headquarters"
                placeholder="Street address, City, Country"
                value={address}
                onChangeText={setAddress}
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
                  loading={saving}
                  onPress={handleAddSupplier}
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
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contactPerson: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 6,
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
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});

export default SupplierListScreen;
