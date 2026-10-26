import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import AppButton from '../../components/AppButton';
import ConfirmDialog from '../../components/ConfirmDialog';
import useInventory from '../../hooks/useInventory';
import useAuth from '../../hooks/useAuth';
import {
  formatCurrency,
  formatNumber,
  formatDateTime,
  getStockStatus,
} from '../../utils/formatters';

export const ProductDetailScreen = ({ route, navigation }) => {
  const { productId } = route.params;
  const { products, deleteProduct, transactions } = useInventory();
  const { isAdmin } = useAuth();

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.notFoundTitle}>Product Not Found</Text>
          <Text style={styles.notFoundDesc}>
            This product record may have been deleted or does not exist.
          </Text>
          <AppButton
            title="Back to Catalog"
            onPress={() => navigation.goBack()}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const stock = getStockStatus(product.quantity, product.minReorderLevel);
  const profitMargin =
    product.sellingPrice && product.costPrice
      ? ((product.sellingPrice - product.costPrice) / product.costPrice) * 100
      : 0;

  const productHistory = transactions.filter((t) => t.productId === product.id);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteProduct(product.id);
      setConfirmDeleteVisible(false);
      Alert.alert('Deleted', 'Product has been removed from catalog.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Information Card */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.skuText}>SKU: {product.sku}</Text>
              {product.barcode ? (
                <View style={styles.barcodeRow}>
                  <Ionicons name="barcode-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.barcodeText}>{product.barcode}</Text>
                </View>
              ) : null}
            </View>

            <View style={[styles.stockBadge, { backgroundColor: stock.bg }]}>
              <View style={[styles.badgeDot, { backgroundColor: stock.color }]} />
              <Text style={[styles.badgeText, { color: stock.color }]}>
                {stock.label}
              </Text>
            </View>
          </View>

          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>On Hand</Text>
              <Text style={[styles.metricValue, { color: stock.color }]}>
                {formatNumber(product.quantity)}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Min Threshold</Text>
              <Text style={styles.metricValue}>
                {formatNumber(product.minReorderLevel || 10)}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Location</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
                {product.locationShelf || 'Main Floor'}
              </Text>
            </View>
          </View>
        </View>

        {/* Pricing & Valuation Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Financials & Margin</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cost Price (Purchase)</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(product.costPrice)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Selling Price (Retail)</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(product.sellingPrice)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Est. Profit Margin</Text>
            <Text
              style={[
                styles.detailValue,
                { color: profitMargin >= 0 ? colors.success : colors.danger },
              ]}
            >
              {profitMargin.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Asset Valuation</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>
              {formatCurrency((product.costPrice || 0) * (product.quantity || 0))}
            </Text>
          </View>
        </View>

        {/* Category & Supplier Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Classification & Origin</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>
              {product.categoryName || 'General Goods'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Supplier</Text>
            <Text style={styles.detailValue}>
              {product.supplierName || 'Internal Warehouse'}
            </Text>
          </View>
        </View>

        {/* Dedicated Stock Movement Action Buttons */}
        <View style={styles.stockActionSection}>
          <Text style={styles.sectionTitle}>Inventory Operations</Text>
          <View style={styles.stockActionRow}>
            <AppButton
              title="Stock In"
              variant="success"
              onPress={() => navigation.navigate('StockIn', { productId: product.id })}
              icon={
                <Ionicons name="arrow-down-circle-outline" size={18} color="#FFFFFF" />
              }
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <AppButton
              title="Stock Out"
              variant="primary"
              onPress={() => navigation.navigate('StockOut', { productId: product.id })}
              icon={<Ionicons name="arrow-up-circle-outline" size={18} color="#FFFFFF" />}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Admin Management Section */}
        {isAdmin && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Product Management (Admin)</Text>
            <View style={styles.adminActionRow}>
              <AppButton
                title="Edit Product"
                variant="outline"
                onPress={() => navigation.navigate('EditProduct', { productId: product.id })}
                icon={<Ionicons name="create-outline" size={18} color={colors.primary} />}
                style={{ flex: 1, marginRight: spacing.sm }}
              />

              <AppButton
                title="Delete"
                variant="danger"
                onPress={() => setConfirmDeleteVisible(true)}
                icon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Product Stock Movement History */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Item Movement Log</Text>
          {productHistory.length === 0 ? (
            <Text style={styles.emptyHistory}>No transaction history for this item.</Text>
          ) : (
            productHistory.map((trx) => (
              <View key={trx.id} style={styles.historyRow}>
                <View
                  style={[
                    styles.historyDot,
                    {
                      backgroundColor:
                        trx.type === 'STOCK_IN' ? colors.success : colors.primary,
                    },
                  ]}
                />
                <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
                  <Text style={styles.historyType}>
                    {trx.type === 'STOCK_IN' ? 'Stock Received' : 'Stock Dispatched'}
                  </Text>
                  <Text style={styles.historyMeta}>
                    {formatDateTime(trx.timestamp)} • {trx.notes || 'No remarks'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.historyDelta,
                    {
                      color: trx.type === 'STOCK_IN' ? colors.success : colors.primary,
                    },
                  ]}
                >
                  {trx.type === 'STOCK_IN' ? `+${trx.quantity}` : `-${trx.quantity}`}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  productName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  skuText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  barcodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  barcodeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  badgeText: {
    ...typography.captionBold,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metricValue: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  stockActionSection: {
    marginBottom: spacing.md,
  },
  stockActionRow: {
    flexDirection: 'row',
  },
  adminSection: {
    marginBottom: spacing.md,
  },
  adminActionRow: {
    flexDirection: 'row',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyType: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyDelta: {
    ...typography.subtitle,
    fontWeight: '700',
  },
  emptyHistory: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  notFoundDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default ProductDetailScreen;
