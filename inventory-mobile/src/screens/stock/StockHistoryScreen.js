import React, { useState, useMemo } from 'react';
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
import { colors, typography, borderRadius, spacing } from '../../theme';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import useInventory from '../../hooks/useInventory';
import { formatDateTime } from '../../utils/formatters';

export const StockHistoryScreen = ({ navigation }) => {
  const { transactions, isLoading, loadAllData } = useInventory();

  const [filterType, setFilterType] = useState('ALL'); // ALL, STOCK_IN, STOCK_OUT
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    return transactions.filter((t) => {
      const matchType =
        filterType === 'ALL' || t.type === filterType;

      const query = searchTerm.trim().toLowerCase();
      const matchSearch =
        !query ||
        t.productName?.toLowerCase().includes(query) ||
        t.sku?.toLowerCase().includes(query) ||
        t.referenceInvoice?.toLowerCase().includes(query) ||
        t.performedBy?.toLowerCase().includes(query);

      return matchType && matchSearch;
    });
  }, [transactions, filterType, searchTerm]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchSection}>
          <AppInput
            placeholder="Search by product, SKU, invoice #, or staff..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            leftIcon={<Ionicons name="search-outline" size={18} color={colors.textSecondary} />}
            rightIcon={
              searchTerm ? (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null
            }
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterType('ALL')}
            style={[styles.tab, filterType === 'ALL' && styles.activeTab]}
          >
            <Text style={[styles.tabText, filterType === 'ALL' && styles.activeTabText]}>
              All ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterType('STOCK_IN')}
            style={[styles.tab, filterType === 'STOCK_IN' && styles.activeTab]}
          >
            <Ionicons
              name="arrow-down-circle"
              size={14}
              color={filterType === 'STOCK_IN' ? '#FFFFFF' : colors.success}
            />
            <Text
              style={[
                styles.tabText,
                filterType === 'STOCK_IN' && styles.activeTabText,
              ]}
            >
              Stock In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setFilterType('STOCK_OUT')}
            style={[styles.tab, filterType === 'STOCK_OUT' && styles.activeTab]}
          >
            <Ionicons
              name="arrow-up-circle"
              size={14}
              color={filterType === 'STOCK_OUT' ? '#FFFFFF' : colors.primary}
            />
            <Text
              style={[
                styles.tabText,
                filterType === 'STOCK_OUT' && styles.activeTabText,
              ]}
            >
              Stock Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of movements */}
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isStockIn = item.type === 'STOCK_IN';
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleWrap}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.skuText}>SKU: {item.sku}</Text>
                  </View>

                  <View
                    style={[
                      styles.deltaBadge,
                      {
                        backgroundColor: isStockIn
                          ? colors.successLight
                          : colors.primaryLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isStockIn ? 'arrow-down' : 'arrow-up'}
                      size={14}
                      color={isStockIn ? colors.success : colors.primary}
                    />
                    <Text
                      style={[
                        styles.deltaText,
                        { color: isStockIn ? colors.success : colors.primary },
                      ]}
                    >
                      {isStockIn ? `+${item.quantity}` : `-${item.quantity}`}
                    </Text>
                  </View>
                </View>

                {/* Audit details */}
                <View style={styles.balanceRow}>
                  <Text style={styles.balanceMeta}>
                    Previous: <Text style={styles.boldMeta}>{item.previousQuantity}</Text>
                  </Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
                  <Text style={styles.balanceMeta}>
                    New Balance: <Text style={styles.boldMeta}>{item.newQuantity}</Text>
                  </Text>
                </View>

                {item.referenceInvoice ? (
                  <View style={styles.infoLine}>
                    <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
                    <Text style={styles.infoLineText}>
                      Ref: {item.referenceInvoice}
                    </Text>
                  </View>
                ) : null}

                {item.notes ? (
                  <Text style={styles.notesText}>"{item.notes}"</Text>
                ) : null}

                <View style={styles.footerRow}>
                  <Text style={styles.staffMeta}>
                    By: {item.performedBy || 'System'}
                  </Text>
                  <Text style={styles.timeMeta}>
                    {formatDateTime(item.timestamp)}
                  </Text>
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
              icon="time-outline"
              title="No transactions found"
              description="No stock movements match your filter criteria."
              actionTitle={searchTerm || filterType !== 'ALL' ? 'Reset Filters' : undefined}
              onActionPress={() => {
                setSearchTerm('');
                setFilterType('ALL');
              }}
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
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginLeft: 3,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flex: 1,
    marginRight: spacing.sm,
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
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
  },
  deltaText: {
    ...typography.subtitle,
    fontWeight: '800',
    marginLeft: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  balanceMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  boldMeta: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  infoLineText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  notesText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs + 2,
    marginTop: spacing.sm,
  },
  staffMeta: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  timeMeta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

export default StockHistoryScreen;
