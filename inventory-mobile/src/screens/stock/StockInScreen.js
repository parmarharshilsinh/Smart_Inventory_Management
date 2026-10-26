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
import { validateStockIn } from '../../utils/validators';

export const StockInScreen = ({ route, navigation }) => {
  const initialProductId = route.params?.productId;
  const { products, recordStockIn } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId || (products[0] ? products[0].id : null)
  );
  const [quantity, setQuantity] = useState('');
  const [referenceInvoice, setReferenceInvoice] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentQty = selectedProduct ? selectedProduct.quantity || 0 : 0;
  const addedQty = parseInt(quantity, 10);
  const estimatedNewQty = !isNaN(addedQty) && addedQty > 0 ? currentQty + addedQty : currentQty;

  const handleSubmit = async () => {
    setApiError('');
    const { isValid, errors: valErrors } = validateStockIn({
      productId: selectedProductId,
      quantity,
      referenceInvoice,
    });

    if (!isValid) {
      setErrors(valErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await recordStockIn({
        productId: selectedProductId,
        quantity: parseInt(quantity, 10),
        unitCost: selectedProduct?.costPrice,
        referenceInvoice: referenceInvoice.trim(),
        notes: notes.trim(),
      });

      Alert.alert(
        'Stock Received Successfully',
        `Added ${quantity} units to "${selectedProduct.name}".\nNew Total Balance: ${res.newQuantity} units.`,
        [
          {
            text: 'View Movement History',
            onPress: () => navigation.navigate('StockHistory'),
          },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]
      );
    } catch (err) {
      setApiError(err.message || 'Failed to record stock in.');
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
          {/* Header Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIconWrap}>
              <Ionicons name="arrow-down-circle" size={28} color={colors.success} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.bannerTitle}>Goods Receipt (Stock In)</Text>
              <Text style={styles.bannerSubtitle}>
                Add received shipments or supplier deliveries to inventory
              </Text>
            </View>
          </View>

          <ErrorMessage message={apiError} />

          {/* Product Picker */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select Item</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerScroll}
            >
              {products.map((p) => {
                const isSelected = p.id === selectedProductId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedProductId(p.id);
                      if (errors.productId) setErrors((e) => ({ ...e, productId: null }));
                    }}
                    style={[
                      styles.productChip,
                      isSelected ? styles.productChipSelected : styles.productChipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipTitle,
                        isSelected && { color: colors.primary },
                      ]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    <Text style={styles.chipSku}>SKU: {p.sku}</Text>
                    <Text style={styles.chipStock}>Current: {p.quantity}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.productId ? (
              <Text style={styles.errorText}>{errors.productId}</Text>
            ) : null}
          </View>

          {/* Transaction Input Form */}
          {selectedProduct && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Receipt Details</Text>

              {/* Balance Simulation Box */}
              <View style={styles.balancePreview}>
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>Current Stock</Text>
                  <Text style={styles.balanceVal}>{currentQty}</Text>
                </View>
                <Ionicons name="add" size={20} color={colors.textSecondary} />
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>Incoming</Text>
                  <Text style={[styles.balanceVal, { color: colors.success }]}>
                    {isNaN(addedQty) || addedQty <= 0 ? 0 : addedQty}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>New Balance</Text>
                  <Text style={[styles.balanceVal, { color: colors.primary }]}>
                    {estimatedNewQty}
                  </Text>
                </View>
              </View>

              <AppInput
                testID="stock-in-qty"
                label="Received Quantity (Positive Integer) *"
                placeholder="e.g. 25"
                value={quantity}
                onChangeText={(val) => {
                  setQuantity(val);
                  if (errors.quantity) setErrors((e) => ({ ...e, quantity: null }));
                }}
                error={errors.quantity}
                keyboardType="number-pad"
                leftIcon={<Ionicons name="calculator-outline" size={20} color={colors.textSecondary} />}
              />

              <AppInput
                label="PO / Invoice Reference #"
                placeholder="e.g. PO-2026-904"
                value={referenceInvoice}
                onChangeText={setReferenceInvoice}
                leftIcon={<Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />}
              />

              <AppInput
                label="Remarks / Supplier Notes"
                placeholder="e.g. Received shipment in good condition via DHL"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <AppButton
              title="Cancel"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <AppButton
              testID="stock-in-submit"
              title="Confirm Stock In"
              variant="success"
              onPress={handleSubmit}
              loading={loading}
              disabled={!selectedProduct}
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    ...typography.subtitle,
    color: '#065F46',
    fontWeight: '700',
  },
  bannerSubtitle: {
    ...typography.caption,
    color: '#047857',
    marginTop: 2,
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
  pickerScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  productChip: {
    width: 140,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  productChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  productChipUnselected: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  chipSku: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  chipStock: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: 4,
  },
  balancePreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  balanceCol: {
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  balanceVal: {
    ...typography.subtitle,
    fontWeight: '800',
    marginTop: 2,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});

export default StockInScreen;
