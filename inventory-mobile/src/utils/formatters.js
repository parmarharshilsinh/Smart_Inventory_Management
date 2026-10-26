/**
 * Formatting helpers for numbers, currency, dates, and stock status
 */

export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${currency}0.00`;
  }
  return `${currency}${Number(amount).toFixed(2)}`;
};

export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(Number(num))) {
    return '0';
  }
  return Number(num).toLocaleString();
};

export const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

export const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return `${d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })} at ${d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return isoString;
  }
};

export const getStockStatus = (quantity, minReorderLevel = 10) => {
  const qty = Number(quantity) || 0;
  const threshold = Number(minReorderLevel) || 10;

  if (qty <= 0) {
    return {
      status: 'OUT_OF_STOCK',
      label: 'Out of Stock',
      color: '#EF4444',
      bg: '#FEE2E2',
    };
  }
  if (qty <= threshold) {
    return {
      status: 'LOW_STOCK',
      label: 'Low Stock',
      color: '#F59E0B',
      bg: '#FEF3C7',
    };
  }
  return {
    status: 'IN_STOCK',
    label: 'In Stock',
    color: '#10B981',
    bg: '#D1FAE5',
  };
};
