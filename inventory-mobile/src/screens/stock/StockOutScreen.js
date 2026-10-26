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
import { validateStockOut } from '../../utils/validators';

export const StockOutScreen = ({ route, navigation }) => {
  const initialProductId = route.params?.productId;
  const { products, recordStockOut } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState(
    initialProductId || (products[0] ? products[0].id : null)
  );
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Customer Order');
  const [referenceInvoice, setReferenceInvoice] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const currentQty = selectedProduct ? selectedProduct.quantity || 0 : 0;
  const dispatchedQty = parseInt(quantity, 10);
  const remainingQty = !isNaN(dispatchedQty) ? currentQty - dispatchedQty : currentQty;

  const reasonsList = [
    'Customer Order',
    'Department Requisition',
    'Damaged / Expired Goods',
    'Physical Audit Correction',
    'Sample / Demonstration',
  ];

  const handleSubmit = async () => {
    setApiError('');
    const { isValid, errors: valErrors } = validateStockOut({
      productId: selectedProductId,
      quantity,
      availableStock: currentQty,
      reason,
    });

    if (!isValid) {
      setErrors(valErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await recordStockOut({
        productId: selectedProductId,
        quantity: parseInt(quantity, 10),
        referenceInvoice: referenceInvoice.trim(),
        notes: `${reason}: ${notes.trim()}`.trim(),
      });

      Alert.alert(
        'Stock Dispatched Successfully',
        `Deducted ${quantity} units from "${selectedProduct.name}".\nRemaining Stock: ${res.newQuantity} units.`,
        [
          {
            text: 'View Movement History',
            onPress: () => navigation.navigate('StockHistory'),
          },
          { text: 'Done', onPress: () => navigation.goBack() },
        ]
      );
    } catch (err) {
      setApiError(err.message || 'Failed to dispatch stock.');
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
              <Ionicons name="arrow-up-circle" size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.bannerTitle}>Goods Issue (Stock Out)</Text>
              <Text style={styles.bannerSubtitle}>
                Dispatch items for sales orders, usage, or damage write-offs
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
                const isZero = p.quantity <= 0;
                return (
                  <TouchableOpacity
                    key={p.id}
                    disabled={isZero}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedProductId(p.id);
                      if (errors.productId) setErrors((e) => ({ ...e, productId: null }));
                    }}
                    style={[
                      styles.productChip,
                      isSelected ? styles.productChipSelected : styles.productChipUnselected,
                      isZero && styles.productChipDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipTitle,
                        isSelected && { color: colors.primary },
                        isZero && { color: colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    <Text style={styles.chipSku}>SKU: {p.sku}</Text>
                    <Text
                      style={[
                        styles.chipStock,
                        { color: isZero ? colors.danger : colors.textPrimary },
                      ]}
                    >
                      {isZero ? 'OUT OF STOCK' : `Avail: ${p.quantity}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.productId ? (
              <Text style={styles.errorText}>{errors.productId}</Text>
            ) : null}
          </View>

          {/* Dispatch Form Details */}
          {selectedProduct && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dispatch Details</Text>

              {/* Real-time remaining stock calculation */}
              <View style={styles.balancePreview}>
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>Available</Text>
                  <Text style={styles.balanceVal}>{currentQty}</Text>
                </View>
                <Ionicons name="remove" size={20} color={colors.textSecondary} />
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>Deduct</Text>
                  <Text style={[styles.balanceVal, { color: colors.primary }]}>
                    {isNaN(dispatchedQty) || dispatchedQty <= 0 ? 0 : dispatchedQty}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                <View style={styles.balanceCol}>
                  <Text style={styles.balanceLabel}>Remaining</Text>
                  <Text
                    style={[
                      styles.balanceVal,
                      { color: remainingQty < 0 ? colors.danger : colors.textPrimary },
                    ]}
                  >
                    {remainingQty}
                  </Text>
                </View>
              </View>

              <AppInput
                testID="stock-out-qty"
                label="Dispatch Quantity (Cannot exceed available) *"
                placeholder={`1 to ${currentQty}`}
                value={quantity}
                onChangeText={(val) => {
                  setQuantity(val);
                  if (errors.quantity) setErrors((e) => ({ ...e, quantity: null }));
                }}
                error={errors.quantity}
                keyboardType="number-pad"
                leftIcon={<Ionicons name="calculator-outline" size={20} color={colors.textSecondary} />}
              />

              {/* Reason Selector */}
              <Text style={styles.fieldLabel}>Dispatch Reason *</Text>
              <View style={styles.reasonWrap}>
                {reasonsList.map((r) => {
                  const isChosen = reason === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      activeOpacity={0.7}
                      onPress={() => setReason(r)}
                      style={[
                        styles.reasonChip,
                        isChosen ? styles.reasonChipSelected : styles.reasonChipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.reasonChipText,
                          isChosen && styles.reasonChipTextSelected,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppInput
                label="Dispatch Reference / Order #"
                placeholder="e.g. DISP-2026-441"
                value={referenceInvoice}
                onChangeText={setReferenceInvoice}
                leftIcon={<Ionicons name="receipt-outline" size={20} color={colors.textSecondary} />}
              />

              <AppInput
                label="Additional Remarks"
                placeholder="Notes on department, customer, or damage"
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
              testID="stock-out-submit"
              title="Confirm Stock Out"
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={!selectedProduct || currentQty <= 0}
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
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
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
    color: colors.primaryDark,
    fontWeight: '700',
  },
  bannerSubtitle: {
    ...typography.caption,
    color: colors.primary,
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
  productChipDisabled: {
    opacity: 0.5,
    backgroundColor: colors.border,
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
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  reasonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  reasonChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  reasonChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  reasonChipUnselected: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  reasonChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reasonChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
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

export default StockOutScreen;
