/**
 * Form and input validation utilities for Smart Inventory
 */

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined) {
    return `${fieldName} is required.`;
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return `${fieldName} is required.`;
  }
  return null;
};

export const validateEmail = (email) => {
  const req = validateRequired(email, 'Email');
  if (req) return req;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

export const validatePassword = (password) => {
  const req = validateRequired(password, 'Password');
  if (req) return req;
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName = 'Price', allowZero = false) => {
  const req = validateRequired(value, fieldName);
  if (req) return req;

  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number.`;
  }
  if (allowZero ? num < 0 : num <= 0) {
    return `${fieldName} must be greater than ${allowZero ? 'or equal to 0' : '0'}.`;
  }
  return null;
};

export const validatePositiveInteger = (value, fieldName = 'Quantity', allowZero = false) => {
  const req = validateRequired(value, fieldName);
  if (req) return req;

  const num = Number(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    return `${fieldName} must be a whole integer.`;
  }
  if (allowZero ? num < 0 : num <= 0) {
    return `${fieldName} must be greater than ${allowZero ? 'or equal to 0' : '0'}.`;
  }
  return null;
};

export const validateStockIn = ({ productId, quantity, referenceInvoice }) => {
  const errors = {};
  const prodErr = validateRequired(productId, 'Product');
  if (prodErr) errors.productId = prodErr;

  const qtyErr = validatePositiveInteger(quantity, 'Quantity', false);
  if (qtyErr) errors.quantity = qtyErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateStockOut = ({ productId, quantity, availableStock, reason }) => {
  const errors = {};
  const prodErr = validateRequired(productId, 'Product');
  if (prodErr) errors.productId = prodErr;

  const qtyErr = validatePositiveInteger(quantity, 'Quantity', false);
  if (qtyErr) {
    errors.quantity = qtyErr;
  } else if (availableStock !== undefined && Number(quantity) > Number(availableStock)) {
    errors.quantity = `Quantity cannot exceed available stock (${availableStock}).`;
  }

  const reasonErr = validateRequired(reason, 'Reason');
  if (reasonErr) errors.reason = reasonErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateProductForm = (form, existingProducts = [], currentProductId = null) => {
  const errors = {};

  const nameErr = validateRequired(form.name, 'Product Name');
  if (nameErr) errors.name = nameErr;

  const skuErr = validateRequired(form.sku, 'SKU');
  if (skuErr) {
    errors.sku = skuErr;
  } else {
    // Check for duplicate SKU
    const isDuplicate = existingProducts.some(
      (p) =>
        p.sku?.trim().toUpperCase() === form.sku?.trim().toUpperCase() &&
        p.id !== currentProductId
    );
    if (isDuplicate) {
      errors.sku = 'SKU already exists. Please choose a unique SKU.';
    }
  }

  const catErr = validateRequired(form.categoryId, 'Category');
  if (catErr) errors.categoryId = catErr;

  const costErr = validatePositiveNumber(form.costPrice, 'Cost Price', true);
  if (costErr) errors.costPrice = costErr;

  const sellErr = validatePositiveNumber(form.sellingPrice, 'Selling Price', true);
  if (sellErr) errors.sellingPrice = sellErr;

  if (form.costPrice && form.sellingPrice && Number(form.costPrice) > Number(form.sellingPrice)) {
    errors.sellingPrice = 'Selling price should normally be greater than cost price.';
  }

  if (form.quantity !== undefined && form.quantity !== null && form.quantity !== '') {
    const qtyErr = validatePositiveInteger(form.quantity, 'Quantity', true);
    if (qtyErr) errors.quantity = qtyErr;
  }

  if (form.minReorderLevel !== undefined && form.minReorderLevel !== null && form.minReorderLevel !== '') {
    const minErr = validatePositiveInteger(form.minReorderLevel, 'Minimum Stock Level', true);
    if (minErr) errors.minReorderLevel = minErr;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
