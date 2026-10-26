import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import useAuth from '../../hooks/useAuth';
import useInventory from '../../hooks/useInventory';
import { formatCurrency, formatNumber, formatDateTime } from '../../utils/formatters';

export const DashboardScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const {
    products,
    metrics,
    lowStockItems,
    transactions,
    isLoading,
    loadAllData,
  } = useInventory();

  // Summary figures
  const totalValuation = metrics?.totalInventoryValuation ??
    products.reduce((acc, p) => acc + (p.costPrice || 0) * (p.quantity || 0), 0);

  const totalUnits = metrics?.totalStockUnits ??
    products.reduce((acc, p) => acc + (p.quantity || 0), 0);

  const recentTransactions = transactions.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadAllData}
            colors={[colors.primary]}
          />
        }
      >
        {/* User Greeting & Status Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.fullName || 'Inventory Manager'}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={14}
              color={isAdmin ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.roleText,
                { color: isAdmin ? colors.primary : colors.textSecondary },
              ]}
            >
              {isAdmin ? 'ADMIN' : 'STAFF'}
            </Text>
          </View>
        </View>

        {/* KPI Metric Cards Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Valuation */}
          <View style={[styles.metricCard, styles.primaryMetric]}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.metricLabel}>Total Valuation</Text>
            <Text style={styles.metricValuation}>
              {formatCurrency(totalValuation)}
            </Text>
            <Text style={styles.metricSub}>Based on unit cost price</Text>
          </View>

          {/* Low Stock Alert Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LowStockAlerts')}
            style={[
              styles.metricCard,
              lowStockItems.length > 0 ? styles.warningMetric : styles.cardBorder,
            ]}
          >
            <View style={styles.metricIconWrap}>
              <Ionicons
                name="warning-outline"
                size={20}
                color={lowStockItems.length > 0 ? colors.warning : colors.success}
              />
            </View>
            <Text style={styles.metricLabel}>Low Stock Alerts</Text>
            <Text
              style={[
                styles.metricNumber,
                { color: lowStockItems.length > 0 ? colors.warning : colors.success },
              ]}
            >
              {lowStockItems.length}
            </Text>
            <Text style={styles.metricSub}>Items below reorder point</Text>
          </TouchableOpacity>

          {/* Total Products */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductsTab')}
            style={[styles.metricCard, styles.cardBorder]}
          >
            <View style={styles.metricIconWrap}>
              <Ionicons name="cube-outline" size={20} color={colors.info} />
            </View>
            <Text style={styles.metricLabel}>Total Products</Text>
            <Text style={styles.metricNumber}>{products.length}</Text>
            <Text style={styles.metricSub}>Distinct catalog SKUs</Text>
          </TouchableOpacity>

          {/* Total Stock Units */}
          <View style={[styles.metricCard, styles.cardBorder]}>
            <View style={styles.metricIconWrap}>
              <Ionicons name="layers-outline" size={20} color={colors.success} />
            </View>
            <Text style={styles.metricLabel}>In-Stock Units</Text>
            <Text style={styles.metricNumber}>{formatNumber(totalUnits)}</Text>
            <Text style={styles.metricSub}>Physical items in storage</Text>
          </View>
        </View>

        {/* Quick Actions Panel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Operations</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StockIn')}
            style={[styles.actionBtn, styles.stockInAction]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.successLight }]}>
              <Ionicons name="arrow-down-circle" size={24} color={colors.success} />
            </View>
            <Text style={styles.actionBtnText}>Stock In</Text>
            <Text style={styles.actionBtnDesc}>Receive Goods</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StockOut')}
            style={[styles.actionBtn, styles.stockOutAction]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="arrow-up-circle" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionBtnText}>Stock Out</Text>
            <Text style={styles.actionBtnDesc}>Dispatch / Issue</Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AddProduct')}
              style={[styles.actionBtn, styles.cardBorder]}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="add-circle" size={24} color="#9333EA" />
              </View>
              <Text style={styles.actionBtnText}>New SKU</Text>
              <Text style={styles.actionBtnDesc}>Add Product</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StockHistory')}
            style={[styles.actionBtn, styles.cardBorder]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="time-outline" size={24} color={colors.info} />
            </View>
            <Text style={styles.actionBtnText}>Audit Log</Text>
            <Text style={styles.actionBtnDesc}>Movements</Text>
          </TouchableOpacity>
        </View>

        {/* Urgent Low Stock Alerts Preview */}
        {lowStockItems.length > 0 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertBannerHeader}>
              <View style={styles.alertTitleRow}>
                <Ionicons name="warning" size={18} color={colors.warning} />
                <Text style={styles.alertBannerTitle}>
                  Low Stock Attention ({lowStockItems.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('LowStockAlerts')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {lowStockItems.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.alertItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.alertItemSub}>
                    SKU: {item.sku} • Min: {item.minReorderLevel}
                  </Text>
                </View>
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{item.quantity} left</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions Stream */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Stock Movements</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('StockHistory')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>Full History</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyRecentText}>No stock transactions recorded yet.</Text>
          </View>
        ) : (
          recentTransactions.map((trx) => (
            <View key={trx.id} style={styles.trxItem}>
              <View
                style={[
                  styles.trxIconWrap,
                  {
                    backgroundColor:
                      trx.type === 'STOCK_IN' ? colors.successLight : colors.primaryLight,
                  },
                ]}
              >
                <Ionicons
                  name={trx.type === 'STOCK_IN' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={trx.type === 'STOCK_IN' ? colors.success : colors.primary}
                />
              </View>

              <View style={styles.trxDetails}>
                <Text style={styles.trxProduct} numberOfLines={1}>
                  {trx.productName}
                </Text>
                <Text style={styles.trxMeta}>
                  {formatDateTime(trx.timestamp)} • by {trx.performedBy}
                </Text>
              </View>

              <View style={styles.trxQtyWrap}>
                <Text
                  style={[
                    styles.trxQty,
                    {
                      color: trx.type === 'STOCK_IN' ? colors.success : colors.primary,
                    },
                  ]}
                >
                  {trx.type === 'STOCK_IN' ? `+${trx.quantity}` : `-${trx.quantity}`}
                </Text>
                <Text style={styles.trxBal}>Bal: {trx.newQuantity}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleText: {
    ...typography.captionBold,
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  metricCard: {
    width: '47.5%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  primaryMetric: {
    borderColor: colors.primaryLight,
    borderWidth: 1.5,
  },
  warningMetric: {
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    backgroundColor: '#FFFDF5',
  },
  cardBorder: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricValuation: {
    ...typography.h3,
    color: colors.primary,
    marginVertical: 2,
    fontWeight: '800',
  },
  metricNumber: {
    ...typography.statNumber,
    color: colors.textPrimary,
    marginVertical: 2,
  },
  metricSub: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  viewAllText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionBtnText: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actionBtnDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  alertBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  alertBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertBannerTitle: {
    ...typography.subtitle,
    color: '#B45309',
    fontWeight: '700',
    marginLeft: 6,
  },
  alertItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  alertItemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  alertItemSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  alertBadge: {
    backgroundColor: colors.warning,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  alertBadgeText: {
    ...typography.captionBold,
    color: '#FFFFFF',
  },
  trxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trxIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  trxDetails: {
    flex: 1,
  },
  trxProduct: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  trxMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trxQtyWrap: {
    alignItems: 'flex-end',
  },
  trxQty: {
    ...typography.subtitle,
    fontWeight: '800',
  },
  trxBal: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyRecent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyRecentText: {
    ...typography.body,
    color: colors.textMuted,
  },
});

export default DashboardScreen;
