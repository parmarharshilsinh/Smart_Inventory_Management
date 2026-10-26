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
import useInventory from '../../hooks/useInventory';
import { validateProductForm } from '../../utils/validators';

export const EditProductScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { products, categories, suppliers, updateProduct } = useInventory();

  const product = products.find((p) => p.id === productId);

  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    description: product?.description || '',
    categoryId: product?.categoryId || categories[0]?.id || null,
    supplierId: product?.supplierId || suppliers[0]?.id || null,
    costPrice: product?.costPrice ? String(product.costPrice) : '',
    sellingPrice: product?.sellingPrice ? String(product.sellingPrice) : '',
    minReorderLevel: product?.minReorderLevel ? String(product.minReorderLevel) : '10',
    locationShelf: product?.locationShelf || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Product not found.</Text>
          <AppButton title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleUpdate = async () => {
    setApiError('');
    const { isValid, errors: validationErrors } = validateProductForm(
      form,
      products,
      product.id
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await updateProduct(product.id, form);
      Alert.alert(
        'Product Updated',
        'Product details have been saved successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setApiError(err.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ErrorMessage message={apiError} />

          {/* Read-Only Current Stock Notice */}
          <View style={styles.stockNoticeBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.stockNoticeTitle}>
                Current Stock: {product.quantity} units (Protected)
              </Text>
              <Text style={styles.stockNoticeDesc}>
                Stock quantities cannot be manually edited here. Use dedicated Stock-In or
                Stock-Out forms to ensure tamper-proof audit trails.
              </Text>
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <AppInput
              label="Product Name *"
              value={form.name}
              onChangeText={(val) => updateField('name', val)}
              error={errors.name}
              leftIcon={<Ionicons name="cube-outline" size={20} color={colors.textSecondary} />}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <AppInput
                  label="SKU Code *"
                  value={form.sku}
                  onChangeText={(val) => updateField('sku', val)}
                  error={errors.sku}
                  autoCapitalize="characters"
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppInput
                  label="Barcode"
                  value={form.barcode}
                  onChangeText={(val) => updateField('barcode', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <AppInput
              label="Description"
              value={form.description}
              onChangeText={(val) => updateField('description', val)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Category *</Text>
            <View style={styles.chipsWrap}>
              {categories.map((cat) => {
                const isSelected = form.categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
                    onPress={() => updateField('categoryId', cat.id)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Ionicons
                      name="folder-outline"
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Supplier */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Supplier Directory</Text>
            <View style={styles.chipsWrap}>
              {suppliers.map((sup) => {
                const isSelected = form.supplierId === sup.id;
                return (
                  <TouchableOpacity
                    key={sup.id}
                    activeOpacity={0.7}
                    onPress={() => updateField('supplierId', isSelected ? null : sup.id)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipSelected : styles.chipUnselected,
                    ]}
                  >
                    <Ionicons
                      name="business-outline"
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                      ]}
                    >
                      {sup.companyName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Pricing & Reorder */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pricing & Reorder Point</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <AppInput
                  label="Cost Price (₹) *"
                  value={form.costPrice}
                  onChangeText={(val) => updateField('costPrice', val)}
                  error={errors.costPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppInput
                  label="Selling Price (₹) *"
                  value={form.sellingPrice}
                  onChangeText={(val) => updateField('sellingPrice', val)}
                  error={errors.sellingPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <AppInput
                  label="Min Reorder Level"
                  value={form.minReorderLevel}
                  onChangeText={(val) => updateField('minReorderLevel', val)}
                  error={errors.minReorderLevel}
                  keyboardType="number-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppInput
                  label="Shelf Location"
                  value={form.locationShelf}
                  onChangeText={(val) => updateField('locationShelf', val)}
                  leftIcon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
                />
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <AppButton
              title="Save Changes"
              variant="primary"
              onPress={handleUpdate}
              loading={loading}
              style={{ flex: 2 }}
            />
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
  scrollContent: {
    padding: spacing.lg,
  },
  stockNoticeBox: {
    flexDirection: 'row',
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  stockNoticeTitle: {
    ...typography.captionBold,
    color: colors.info,
  },
  stockNoticeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.captionBold,
    marginLeft: 4,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
});

export default EditProductScreen;
