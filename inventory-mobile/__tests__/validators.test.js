import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePositiveNumber,
  validatePositiveInteger,
  validateStockIn,
  validateStockOut,
  validateProductForm,
} from '../src/utils/validators';

describe('Validator Utilities', () => {
  describe('Required Field Validation', () => {
    it('returns error when value is empty, null, or whitespace', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required.');
      expect(validateRequired('   ', 'Email')).toBe('Email is required.');
      expect(validateRequired(null, 'SKU')).toBe('SKU is required.');
      expect(validateRequired(undefined, 'Price')).toBe('Price is required.');
    });

    it('returns null when valid value is provided', () => {
      expect(validateRequired('Valid String', 'Name')).toBeNull();
      expect(validateRequired('0', 'Quantity')).toBeNull();
    });
  });

  describe('Email & Password Validation', () => {
    it('rejects invalid email formats', () => {
      expect(validateEmail('notanemail')).toBe('Please enter a valid email address.');
      expect(validateEmail('user@')).toBe('Please enter a valid email address.');
      expect(validateEmail('@domain.com')).toBe('Please enter a valid email address.');
    });

    it('accepts valid email', () => {
      expect(validateEmail('admin@inventory.local')).toBeNull();
    });

    it('enforces password minimum length of 6 characters', () => {
      expect(validatePassword('12345')).toBe('Password must be at least 6 characters.');
      expect(validatePassword('123456')).toBeNull();
    });
  });

  describe('Invalid Price and Quantity Validation', () => {
    it('rejects negative, non-numeric, or zero prices when allowZero is false', () => {
      expect(validatePositiveNumber('-5.00', 'Cost Price')).toContain('must be greater than 0');
      expect(validatePositiveNumber('0', 'Cost Price', false)).toContain('must be greater than 0');
      expect(validatePositiveNumber('abc', 'Cost Price')).toBe('Cost Price must be a valid number.');
    });

    it('allows zero price when allowZero is true', () => {
      expect(validatePositiveNumber('0', 'Cost Price', true)).toBeNull();
      expect(validatePositiveNumber('15.50', 'Cost Price', true)).toBeNull();
    });

    it('rejects non-integer, negative, or invalid quantities', () => {
      expect(validatePositiveInteger('4.5', 'Quantity')).toBe('Quantity must be a whole integer.');
      expect(validatePositiveInteger('-2', 'Quantity')).toContain('must be greater than');
      expect(validatePositiveInteger('notanumber', 'Quantity')).toBe('Quantity must be a whole integer.');
    });

    it('accepts valid positive integers', () => {
      expect(validatePositiveInteger('25', 'Quantity')).toBeNull();
      expect(validatePositiveInteger('0', 'Quantity', true)).toBeNull();
    });
  });

  describe('Stock-In Validation', () => {
    it('fails when product is not selected or quantity is not positive integer', () => {
      const res = validateStockIn({ productId: null, quantity: '0' });
      expect(res.isValid).toBe(false);
      expect(res.errors.productId).toBe('Product is required.');
      expect(res.errors.quantity).toBeDefined();
    });

    it('succeeds with valid stock-in payload', () => {
      const res = validateStockIn({ productId: 1, quantity: '10' });
      expect(res.isValid).toBe(true);
      expect(res.errors).toEqual({});
    });
  });

  describe('Stock-Out Validation & Available Stock Limit', () => {
    it('fails when stock-out quantity exceeds available stock', () => {
      const res = validateStockOut({
        productId: 1,
        quantity: '25',
        availableStock: 10,
        reason: 'Customer Order',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.quantity).toBe('Quantity cannot exceed available stock (10).');
    });

    it('fails when reason is missing', () => {
      const res = validateStockOut({
        productId: 1,
        quantity: '5',
        availableStock: 10,
        reason: '',
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.reason).toBe('Reason is required.');
    });

    it('succeeds when quantity is valid and <= available stock', () => {
      const res = validateStockOut({
        productId: 1,
        quantity: '5',
        availableStock: 10,
        reason: 'Order fulfillment',
      });
      expect(res.isValid).toBe(true);
    });
  });

  describe('Duplicate SKU & Product Form Validation', () => {
    const existingProducts = [
      { id: 1, name: 'Item A', sku: 'SKU-001' },
      { id: 2, name: 'Item B', sku: 'SKU-002' },
    ];

    it('detects duplicate SKU from existing catalog', () => {
      const form = {
        name: 'New Item',
        sku: 'SKU-001', // Duplicate!
        categoryId: 1,
        costPrice: '10',
        sellingPrice: '20',
      };
      const res = validateProductForm(form, existingProducts);
      expect(res.isValid).toBe(false);
      expect(res.errors.sku).toBe('SKU already exists. Please choose a unique SKU.');
    });

    it('allows same SKU when updating the current product itself', () => {
      const form = {
        name: 'Item A Updated',
        sku: 'SKU-001', // Same SKU as product 1
        categoryId: 1,
        costPrice: '10',
        sellingPrice: '20',
      };
      const res = validateProductForm(form, existingProducts, 1);
      expect(res.errors.sku).toBeUndefined();
    });

    it('validates all required product fields', () => {
      const emptyForm = { name: '', sku: '', categoryId: null };
      const res = validateProductForm(emptyForm, existingProducts);
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toBeDefined();
      expect(res.errors.sku).toBeDefined();
      expect(res.errors.categoryId).toBeDefined();
    });
  });
});
