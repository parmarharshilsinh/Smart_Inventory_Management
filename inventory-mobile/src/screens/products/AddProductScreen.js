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

export const AddProductScreen = ({ navigation }) => {
  const { products, categories, suppliers, addProduct } = useInventory();

  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    categoryId: categories[0]?.id || null,
    supplierId: suppliers[0]?.id || null,
    costPrice: '',
    sellingPrice: '',
    quantity: '0',
    minReorderLevel: '10',
    locationShelf: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleSubmit = async () => {
    setApiError('');
    const { isValid, errors: validationErrors } = validateProductForm(
      form,
      products
    );

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        initialQuantity: Number(form.quantity) || 0,
        quantity: Number(form.quantity) || 0,
      };
      const created = await addProduct(payload);
      Alert.alert(
        'Product Created',
        `"${created.name}" has been successfully added to the catalog.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setApiError(err.message || 'Failed to add product.');
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

          {/* Section: Basic Details */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <AppInput
              label="Product Name *"
              placeholder="e.g. Ergonomic Office Chair"
              value={form.name}
              onChangeText={(val) => updateField('name', val)}
              error={errors.name}
              leftIcon={<Ionicons name="cube-outline" size={20} color={colors.textSecondary} />}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <AppInput
                  label="SKU Code *"
                  placeholder="SKU-XXX-000"
                  value={form.sku}
                  onChangeText={(val) => updateField('sku', val)}
                  error={errors.sku}
                  autoCapitalize="characters"
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppInput
                  label="Barcode / EAN"
                  placeholder="e.g. 890123456"
                  value={form.barcode}
                  onChangeText={(val) => updateField('barcode', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <AppInput
              label="Description"
              placeholder="Detailed product specifications..."
              value={form.description}
              onChangeText={(val) => updateField('description', val)}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Section: Category Selection */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Category *</Text>
            {errors.categoryId ? (
              <Text style={styles.errorInline}>{errors.categoryId}</Text>
            ) : null}

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

          {/* Section: Supplier Selection */}
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

          {/* Section: Pricing & Stock */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pricing & Initial Stock</Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <AppInput
                  label="Cost Price (₹) *"
                  placeholder="0.00"
                  value={form.costPrice}
                  onChangeText={(val) => updateField('costPrice', val)}
                  error={errors.costPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppInput
                  label="Selling Price (₹) *"
                  placeholder="0.00"
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
                  label="Initial Quantity"
                  placeholder="0"
                  value={form.quantity}
                  onChangeText={(val) => updateField('quantity', val)}
                  error={errors.quantity}
                  keyboardType="number-pad"
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppInput
                  label="Min Reorder Level"
                  placeholder="10"
                  value={form.minReorderLevel}
                  onChangeText={(val) => updateField('minReorderLevel', val)}
                  error={errors.minReorderLevel}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <AppInput
              label="Shelf / Storage Location"
              placeholder="e.g. Aisle 3, Bin B-04"
              value={form.locationShelf}
              onChangeText={(val) => updateField('locationShelf', val)}
              leftIcon={<Ionicons name="location-outline" size={20} color={colors.textSecondary} />}
            />
          </View>

          {/* Submit Actions */}
          <View style={styles.btnRow}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <AppButton
              title="Save Product"
              variant="primary"
              onPress={handleSubmit}
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
  errorInline: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
});

export default AddProductScreen;
