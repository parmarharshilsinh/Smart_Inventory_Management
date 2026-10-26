import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';
import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import supplierApi from '../api/supplierApi';
import stockApi from '../api/stockApi';
import reportApi from '../api/reportApi';
import {
  mockProducts,
  mockCategories,
  mockSuppliers,
  mockTransactions,
} from '../constants/mockData';

export const InventoryContext = createContext({
  products: [],
  categories: [],
  suppliers: [],
  transactions: [],
  lowStockItems: [],
  metrics: null,
  isLoading: false,
  error: null,
  searchTerm: '',
  selectedCategoryId: null,
  setSearchTerm: () => {},
  setSelectedCategoryId: () => {},
  loadAllData: async () => {},
  addProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  recordStockIn: async () => {},
  recordStockOut: async () => {},
  addCategory: async () => {},
  addSupplier: async () => {},
});

export const InventoryProvider = ({ children }) => {
  const { isMockMode, user, logout } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Load all data
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isMockMode) {
        // LIVE SPRING BOOT API MODE
        const [prodRes, catRes, supRes, trxRes, metricRes] = await Promise.all([
          productApi.getAll(),
          categoryApi.getAll(),
          supplierApi.getAll(),
          stockApi.getHistory(),
          reportApi.getDashboardMetrics().catch(() => null),
        ]);

        setProducts(prodRes || []);
        setCategories(catRes || []);
        setSuppliers(supRes || []);
        setTransactions(trxRes || []);
        setMetrics(metricRes);
      } else {
        // ISOLATED MOCK MODE
        await new Promise((r) => setTimeout(r, 200));
        setProducts([...mockProducts]);
        setCategories([...mockCategories]);
        setSuppliers([...mockSuppliers]);
        setTransactions([...mockTransactions]);

        // Compute mock metrics
        const totalStockUnits = mockProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
        const totalValuation = mockProducts.reduce(
          (sum, p) => sum + (p.costPrice || 0) * (p.quantity || 0),
          0
        );
        const lowStockCount = mockProducts.filter(
          (p) => (p.quantity || 0) <= (p.minReorderLevel || 10)
        ).length;

        setMetrics({
          totalProducts: mockProducts.length,
          totalStockUnits,
          totalInventoryValuation: totalValuation,
          lowStockAlertsCount: lowStockCount,
          recentTransactionsToday: mockTransactions.length,
        });
      }
    } catch (err) {
      console.warn('Failed to load inventory data:', err);
      if (err?.status === 401 && logout) {
        logout();
      }
      setError(err.message || 'Failed to load inventory data.');
    } finally {
      setIsLoading(false);
    }
  }, [isMockMode, logout]);

  // Reload when mockMode changes
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Derived low stock items
  const lowStockItems = products.filter(
    (p) => (p.quantity || 0) <= (p.minReorderLevel || 10)
  );

  // Add Product
  const addProduct = useCallback(
    async (productData) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!isMockMode) {
          const created = await productApi.create(productData);
          await loadAllData();
          return created;
        }

        // Mock mode
        await new Promise((r) => setTimeout(r, 300));
        const matchedCategory = categories.find((c) => c.id === Number(productData.categoryId));
        const matchedSupplier = suppliers.find((s) => s.id === Number(productData.supplierId));

        const newProd = {
          id: Date.now(),
          ...productData,
          categoryName: matchedCategory ? matchedCategory.name : 'General',
          supplierName: matchedSupplier ? matchedSupplier.companyName : 'N/A',
          quantity: Number(productData.quantity) || 0,
          costPrice: Number(productData.costPrice) || 0,
          sellingPrice: Number(productData.sellingPrice) || 0,
          minReorderLevel: Number(productData.minReorderLevel) || 10,
          isActive: true,
          updatedAt: new Date().toISOString(),
        };

        mockProducts.unshift(newProd);
        setProducts([...mockProducts]);
        return newProd;
      } catch (err) {
        setError(err.message || 'Failed to create product.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isMockMode, categories, suppliers, loadAllData]
  );

  // Edit Product: Note that editing product metadata does NOT change current stock quantity
  const updateProduct = useCallback(
    async (id, productData) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!isMockMode) {
          const updated = await productApi.update(id, productData);
          await loadAllData();
          return updated;
        }

        // Mock mode
        await new Promise((r) => setTimeout(r, 300));
        const index = mockProducts.findIndex((p) => p.id === id);
        if (index === -1) throw new Error('Product not found.');

        const matchedCategory = categories.find((c) => c.id === Number(productData.categoryId));
        const matchedSupplier = suppliers.find((s) => s.id === Number(productData.supplierId));

        // Preserve current stock quantity from existing product
        const existing = mockProducts[index];
        mockProducts[index] = {
          ...existing,
          ...productData,
          quantity: existing.quantity, // Preserve stock
          categoryName: matchedCategory ? matchedCategory.name : existing.categoryName,
          supplierName: matchedSupplier ? matchedSupplier.companyName : existing.supplierName,
          costPrice: Number(productData.costPrice) || existing.costPrice,
          sellingPrice: Number(productData.sellingPrice) || existing.sellingPrice,
          minReorderLevel: Number(productData.minReorderLevel) || existing.minReorderLevel,
          updatedAt: new Date().toISOString(),
        };

        setProducts([...mockProducts]);
        return mockProducts[index];
      } catch (err) {
        setError(err.message || 'Failed to update product.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isMockMode, categories, suppliers, loadAllData]
  );

  // Delete Product
  const deleteProduct = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!isMockMode) {
          await productApi.delete(id);
          await loadAllData();
          return;
        }

        // Mock mode
        await new Promise((r) => setTimeout(r, 200));
        const idx = mockProducts.findIndex((p) => p.id === id);
        if (idx !== -1) {
          mockProducts.splice(idx, 1);
        }
        setProducts([...mockProducts]);
      } catch (err) {
        setError(err.message || 'Failed to delete product.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isMockMode, loadAllData]
  );

  // Stock In: Atomic addition
  const recordStockIn = useCallback(
    async ({ productId, quantity, unitCost, referenceInvoice, notes }) => {
      setIsLoading(true);
      setError(null);
      const qtyNum = Number(quantity);

      try {
        if (!isMockMode) {
          const res = await stockApi.recordStockIn({
            productId,
            quantity: qtyNum,
            unitCost,
            referenceInvoice,
            notes,
          });
          await loadAllData();
          return res;
        }

        // Mock mode
        await new Promise((r) => setTimeout(r, 300));
        const prod = mockProducts.find((p) => p.id === Number(productId));
        if (!prod) throw new Error('Product not found.');

        const prevQty = prod.quantity || 0;
        const newQty = prevQty + qtyNum;
        prod.quantity = newQty;
        prod.updatedAt = new Date().toISOString();

        const newTrx = {
          id: Date.now(),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'STOCK_IN',
          quantity: qtyNum,
          previousQuantity: prevQty,
          newQuantity: newQty,
          referenceInvoice: referenceInvoice || 'N/A',
          notes: notes || 'Stock received',
          performedBy: user?.fullName || 'Current User',
          timestamp: new Date().toISOString(),
        };

        mockTransactions.unshift(newTrx);
        setProducts([...mockProducts]);
        setTransactions([...mockTransactions]);
        return newTrx;
      } catch (err) {
        setError(err.message || 'Failed to record stock in.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isMockMode, user, loadAllData]
  );

  // Stock Out: Atomic reduction with validation
  const recordStockOut = useCallback(
    async ({ productId, quantity, referenceInvoice, notes }) => {
      setIsLoading(true);
      setError(null);
      const qtyNum = Number(quantity);

      try {
        if (!isMockMode) {
          const res = await stockApi.recordStockOut({
            productId,
            quantity: qtyNum,
            referenceInvoice,
            notes,
          });
          await loadAllData();
          return res;
        }

        // Mock mode
        await new Promise((r) => setTimeout(r, 300));
        const prod = mockProducts.find((p) => p.id === Number(productId));
        if (!prod) throw new Error('Product not found.');

        const prevQty = prod.quantity || 0;
        if (qtyNum > prevQty) {
          throw new Error(`Insufficient stock. Available: ${prevQty}, requested: ${qtyNum}.`);
        }

        const newQty = prevQty - qtyNum;
        prod.quantity = newQty;
        prod.updatedAt = new Date().toISOString();

        const newTrx = {
          id: Date.now(),
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'STOCK_OUT',
          quantity: qtyNum,
          previousQuantity: prevQty,
          newQuantity: newQty,
          referenceInvoice: referenceInvoice || 'N/A',
          notes: notes || 'Stock dispatched',
          performedBy: user?.fullName || 'Current User',
          timestamp: new Date().toISOString(),
        };

        mockTransactions.unshift(newTrx);
        setProducts([...mockProducts]);
        setTransactions([...mockTransactions]);
        return newTrx;
      } catch (err) {
        setError(err.message || 'Failed to record stock out.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isMockMode, user, loadAllData]
  );

  // Add Category
  const addCategory = useCallback(
    async (categoryData) => {
      setIsLoading(true);
      try {
        if (!isMockMode) {
          const res = await categoryApi.create(categoryData);
          await loadAllData();
          return res;
        }
        await new Promise((r) => setTimeout(r, 200));
        const newCat = {
          id: Date.now(),
          name: categoryData.name,
          description: categoryData.description || '',
          productCount: 0,
        };
        mockCategories.push(newCat);
        setCategories([...mockCategories]);
        return newCat;
      } finally {
        setIsLoading(false);
      }
    },
    [isMockMode, loadAllData]
  );

  // Add Supplier
  const addSupplier = useCallback(
    async (supplierData) => {
      setIsLoading(true);
      try {
        if (!isMockMode) {
          const res = await supplierApi.create(supplierData);
          await loadAllData();
          return res;
        }
        await new Promise((r) => setTimeout(r, 200));
        const newSup = {
          id: Date.now(),
          ...supplierData,
        };
        mockSuppliers.push(newSup);
        setSuppliers([...mockSuppliers]);
        return newSup;
      } finally {
        setIsLoading(false);
      }
    },
    [isMockMode, loadAllData]
  );

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        suppliers,
        transactions,
        lowStockItems,
        metrics,
        isLoading,
        error,
        searchTerm,
        selectedCategoryId,
        setSearchTerm,
        setSelectedCategoryId,
        loadAllData,
        addProduct,
        updateProduct,
        deleteProduct,
        recordStockIn,
        recordStockOut,
        addCategory,
        addSupplier,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;
