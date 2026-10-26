import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../theme';
import ProductCard from '../../components/ProductCard';
import AppInput from '../../components/AppInput';
import EmptyState from '../../components/EmptyState';
import useInventory from '../../hooks/useInventory';
import useAuth from '../../hooks/useAuth';

export const ProductListScreen = ({ navigation }) => {
  const { products, categories, isLoading, loadAllData } = useInventory();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [stockStatus, setStockStatus] = useState('ALL'); // ALL, LOW_STOCK, IN_STOCK, OUT_OF_STOCK
  const [sortBy, setSortBy] = useState('name_asc'); // name_asc, name_desc, qty_desc, qty_asc, price_desc, price_asc
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const sortOptions = [
    { id: 'name_asc', label: 'Product Name (A - Z)', icon: 'text-outline' },
    { id: 'name_desc', label: 'Product Name (Z - A)', icon: 'text-outline' },
    { id: 'qty_desc', label: 'Stock Quantity (High to Low)', icon: 'layers-outline' },
    { id: 'qty_asc', label: 'Stock Quantity (Low to High)', icon: 'layers-outline' },
    { id: 'price_desc', label: 'Selling Price (High to Low)', icon: 'pricetag-outline' },
    { id: 'price_asc', label: 'Selling Price (Low to High)', icon: 'pricetag-outline' },
  ];

  const currentSortLabel = sortOptions.find((o) => o.id === sortBy)?.label || 'Name (A-Z)';

  // Filtered and sorted product list
  const filteredProducts = useMemo(() => {
    const list = products.filter((item) => {
      // Search by name, SKU, or barcode
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        (item.barcode && item.barcode.includes(term));

      // Category filter
      const matchesCat =
        !selectedCategory || item.categoryId === selectedCategory;

      // Stock status filter
      let matchesStock = true;
      if (onlyLowStock || stockStatus === 'LOW_STOCK') {
        matchesStock = (item.quantity || 0) <= (item.minReorderLevel || 10);
      } else if (stockStatus === 'IN_STOCK') {
        matchesStock = (item.quantity || 0) > (item.minReorderLevel || 10);
      } else if (stockStatus === 'OUT_OF_STOCK') {
        matchesStock = (item.quantity || 0) <= 0;
      }

      return matchesSearch && matchesCat && matchesStock;
    });

    // Apply sorting
    return list.slice().sort((a, b) => {
      switch (sortBy) {
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'qty_desc':
          return (b.quantity || 0) - (a.quantity || 0);
        case 'qty_asc':
          return (a.quantity || 0) - (b.quantity || 0);
        case 'price_desc':
          return (b.sellingPrice || 0) - (a.sellingPrice || 0);
        case 'price_asc':
          return (a.sellingPrice || 0) - (b.sellingPrice || 0);
        case 'name_asc':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });
  }, [products, search, selectedCategory, onlyLowStock, stockStatus, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <AppInput
            testID="search-input"
            placeholder="Search by name, SKU or barcode..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            leftIcon={<Ionicons name="search-outline" size={20} color={colors.textSecondary} />}
            rightIcon={
              search.length > 0 ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null
            }
          />
        </View>

        {/* Filter Chips Bar */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {/* Low stock quick filter */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const nextVal = !onlyLowStock;
                setOnlyLowStock(nextVal);
                setStockStatus(nextVal ? 'LOW_STOCK' : 'ALL');
              }}
              style={[
                styles.chip,
                onlyLowStock ? styles.activeWarningChip : styles.inactiveChip,
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={onlyLowStock ? '#FFFFFF' : colors.warning}
              />
              <Text
                style={[
                  styles.chipText,
                  onlyLowStock ? styles.activeChipText : styles.inactiveChipText,
                ]}
              >
                Low Stock
              </Text>
            </TouchableOpacity>

            {/* In Stock Filter */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (stockStatus === 'IN_STOCK') {
                  setStockStatus('ALL');
                } else {
                  setStockStatus('IN_STOCK');
                  setOnlyLowStock(false);
                }
              }}
              style={[
                styles.chip,
                stockStatus === 'IN_STOCK' ? styles.activeSuccessChip : styles.inactiveChip,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={stockStatus === 'IN_STOCK' ? '#FFFFFF' : colors.success}
              />
              <Text
                style={[
                  styles.chipText,
                  stockStatus === 'IN_STOCK' ? styles.activeChipText : styles.inactiveChipText,
                ]}
              >
                In Stock
              </Text>
            </TouchableOpacity>

            {/* All Categories Chip */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(null)}
              style={[
                styles.chip,
                selectedCategory === null && !onlyLowStock && stockStatus === 'ALL'
                  ? styles.activeChip
                  : styles.inactiveChip,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === null && !onlyLowStock && stockStatus === 'ALL'
                    ? styles.activeChipText
                    : styles.inactiveChipText,
                ]}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            {/* Dynamic Category Chips */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCategory(isSelected ? null : cat.id)}
                  style={[
                    styles.chip,
                    isSelected ? styles.activeChip : styles.inactiveChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.activeChipText : styles.inactiveChipText,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Results Counter and Header */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing {filteredProducts.length} of {products.length} products
          </Text>
          <View style={styles.actionButtonsRow}>
            {/* Sort Toggle Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSortModalVisible(!sortModalVisible)}
              style={styles.sortSmallBtn}
            >
              <Ionicons name="swap-vertical" size={14} color={colors.primary} />
              <Text style={styles.sortSmallText}>Sort</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('AddProduct')}
                style={styles.addSmallBtn}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text style={styles.addSmallText}>Add New</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Active Sort Indicator */}
        {sortModalVisible && (
          <View style={styles.sortSelectorBox}>
            <View style={styles.sortSelectorHeader}>
              <Text style={styles.sortSelectorTitle}>Sort Inventory By</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.sortOptionsGrid}>
              {sortOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSortBy(opt.id);
                    setSortModalVisible(false);
                  }}
                  style={[
                    styles.sortOptionItem,
                    sortBy === opt.id && styles.sortOptionItemActive,
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={15}
                    color={sortBy === opt.id ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortBy === opt.id && styles.sortOptionTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {sortBy === opt.id && (
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Product List */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard
              testID={`product-card-${item.id}`}
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetail', { productId: item.id })
              }
              onStockInPress={() =>
                navigation.navigate('StockIn', { productId: item.id })
              }
              onStockOutPress={() =>
                navigation.navigate('StockOut', { productId: item.id })
              }
            />
          )}
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
              icon="search-outline"
              title="No matching products"
              description="Try adjusting your search query, sort options, or category filters."
              actionTitle={search || selectedCategory || onlyLowStock || stockStatus !== 'ALL' ? 'Clear Filters' : undefined}
              onActionPress={() => {
                setSearch('');
                setSelectedCategory(null);
                setOnlyLowStock(false);
                setStockStatus('ALL');
                setSortBy('name_asc');
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
  searchInput: {
    marginBottom: spacing.xs,
  },
  filterBar: {
    marginBottom: spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeWarningChip: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  inactiveChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.captionBold,
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  inactiveChipText: {
    color: colors.textSecondary,
    marginLeft: 3,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
  },
  countText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  addSmallText: {
    ...typography.captionBold,
    color: colors.primary,
    marginLeft: 2,
  },
  activeSuccessChip: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sortSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryLight,
  },
  sortSmallText: {
    ...typography.captionBold,
    color: colors.primary,
    marginLeft: 3,
  },
  sortSelectorBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sortSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortSelectorTitle: {
    ...typography.subtitle,
    fontSize: 13,
    color: colors.textPrimary,
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sortOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 6,
  },
  sortOptionItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  sortOptionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    ...typography.captionBold,
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xs,
  },
});

export default ProductListScreen;
