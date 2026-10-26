import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import EmptyState from '../../components/EmptyState';
import useInventory from '../../hooks/useInventory';
import { getStockStatus } from '../../utils/formatters';

export const LowStockAlertsScreen = ({ navigation }) => {
  const { lowStockItems, isLoading, loadAllData } = useInventory();

  const outOfStockCount = lowStockItems.filter((i) => i.quantity <= 0).length;
  const lowWarningCount = lowStockItems.filter((i) => i.quantity > 0).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Total Alerts</Text>
              <Text style={styles.summaryVal}>{lowStockItems.length}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Out of Stock</Text>
              <Text style={[styles.summaryVal, { color: colors.danger }]}>
                {outOfStockCount}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Low Warning</Text>
              <Text style={[styles.summaryVal, { color: colors.warning }]}>
                {lowWarningCount}
              </Text>
            </View>
          </View>
        </View>

        {/* List of items needing reorder */}
        <FlatList
          data={lowStockItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const stock = getStockStatus(item.quantity, item.minReorderLevel);
            const deficit = (item.minReorderLevel || 10) - (item.quantity || 0);

            return (
              <View style={styles.alertCard}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.skuText}>SKU: {item.sku}</Text>
                    <Text style={styles.locationText}>
                      Location: {item.locationShelf || 'Not specified'}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: stock.bg }]}>
                    <Text style={[styles.statusText, { color: stock.color }]}>
                      {stock.label}
                    </Text>
                  </View>
                </View>

                {/* Stock Level Bar */}
                <View style={styles.progressRow}>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.max(5, (item.quantity / (item.minReorderLevel * 2 || 20)) * 100)
                          )}%`,
                          backgroundColor: stock.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressNumbers}>
                    {item.quantity} / {item.minReorderLevel} min
                  </Text>
                </View>

                <View style={styles.cardBottom}>
                  <Text style={styles.deficitText}>
                    Deficit: Recommended order of at least{' '}
                    <Text style={{ fontWeight: '700' }}>{Math.max(1, deficit + 10)}</Text> units
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate('StockIn', { productId: item.id })
                    }
                    style={styles.restockBtn}
                  >
                    <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.restockBtnText}>Restock</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadAllData}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="checkmark-circle-outline"
              title="Healthy Inventory"
              description="All products are currently stocked above their minimum reorder thresholds."
            />
          }
        />
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
  },
  summaryCard: {
    margin: spacing.lg,
    marginBottom: spacing.xs,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryCol: {
    alignItems: 'center',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryVal: {
    ...typography.h3,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
  },
  alertCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  productName: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  skuText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.captionBold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressNumbers: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deficitText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  restockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.sm,
  },
  restockBtnText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    marginLeft: 4,
  },
});

export default LowStockAlertsScreen;
