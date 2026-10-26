import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing, shadows } from '../theme';
import { formatCurrency, getStockStatus } from '../utils/formatters';

export const ProductCard = ({
  product,
  onPress,
  onStockInPress,
  onStockOutPress,
  testID,
}) => {
  const stock = getStockStatus(product.quantity, product.minReorderLevel);

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.sku}>SKU: {product.sku}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: stock.bg }]}>
          <View style={[styles.badgeDot, { backgroundColor: stock.color }]} />
          <Text style={[styles.badgeText, { color: stock.color }]}>
            {product.quantity <= 0 ? 'Out of Stock' : `${product.quantity} in stock`}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.categoryChip}>
          <Ionicons name="folder-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.categoryText}>
            {product.categoryName || 'General'}
          </Text>
        </View>

        {product.locationShelf ? (
          <View style={styles.shelfChip}>
            <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.shelfText} numberOfLines={1}>
              {product.locationShelf}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.priceLabel}>Selling Price</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(product.sellingPrice)}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {onStockInPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onStockInPress}
              style={[styles.miniBtn, styles.stockInBtn]}
            >
              <Ionicons name="arrow-down-circle" size={15} color={colors.success} />
              <Text style={styles.stockInText}>In</Text>
            </TouchableOpacity>
          )}

          {onStockOutPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onStockOutPress}
              style={[styles.miniBtn, styles.stockOutBtn]}
            >
              <Ionicons name="arrow-up-circle" size={15} color={colors.primary} />
              <Text style={styles.stockOutText}>Out</Text>
            </TouchableOpacity>
          )}

          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sku: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  shelfChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    maxWidth: 150,
  },
  shelfText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  priceValue: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  stockInBtn: {
    backgroundColor: colors.successLight,
  },
  stockInText: {
    ...typography.captionBold,
    color: colors.success,
    marginLeft: 3,
  },
  stockOutBtn: {
    backgroundColor: colors.primaryLight,
  },
  stockOutText: {
    ...typography.captionBold,
    color: colors.primary,
    marginLeft: 3,
  },
});

export default ProductCard;
