import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

export const CategoryListScreen = () => {
  const { categories, products, addCategory, isLoading, loadAllData } = useInventory();
  const { isAdmin } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddCategory = async () => {
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addCategory({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setModalVisible(false);
      Alert.alert('Success', 'Category added successfully.');
    } catch (err) {
      setError(err.message || 'Failed to add category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Categories ({categories.length})</Text>
          {isAdmin && (
            <AppButton
              title="Add Category"
              variant="primary"
              size="small"
              onPress={() => setModalVisible(true)}
              icon={<Ionicons name="add" size={16} color="#FFFFFF" />}
            />
          )}
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadAllData}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const count = products.filter((p) => p.categoryId === item.id).length;
            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="folder" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.catName}>{item.name}</Text>
                    {item.description ? (
                      <Text style={styles.catDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count} items</Text>
                </View>
              </View>
            );
          }}
        />

        {/* Add Category Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add New Category</Text>

              <AppInput
                label="Category Name *"
                placeholder="e.g. Electrical Components"
                value={name}
                onChangeText={setName}
                error={error}
              />

              <AppInput
                label="Description"
                placeholder="Category notes and scope"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
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
                  onPress={handleAddCategory}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: {
    ...typography.subtitle,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    ...typography.captionBold,
    color: colors.textSecondary,
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

export default CategoryListScreen;
