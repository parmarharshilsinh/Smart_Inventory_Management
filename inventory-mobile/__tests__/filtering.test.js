import { mockProducts } from '../src/constants/mockData';

describe('Search and Filtering Logic', () => {
  const filterCatalog = (products, { search = '', categoryId = null, onlyLowStock = false }) => {
    return products.filter((item) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        (item.barcode && item.barcode.includes(term));

      const matchesCat = !categoryId || item.categoryId === categoryId;
      const matchesLowStock = !onlyLowStock || (item.quantity || 0) <= (item.minReorderLevel || 10);

      return matchesSearch && matchesCat && matchesLowStock;
    });
  };

  it('filters products by name case-insensitively', () => {
    const results = filterCatalog(mockProducts, { search: 'mouse' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Mouse');
  });

  it('filters products by SKU', () => {
    const results = filterCatalog(mockProducts, { search: 'SKU-ELEC-002' });
    expect(results.length).toBe(1);
    expect(results[0].sku).toBe('SKU-ELEC-002');
  });

  it('filters products by barcode', () => {
    const results = filterCatalog(mockProducts, { search: '884116388902' });
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(2);
  });

  it('filters products by category ID', () => {
    const results = filterCatalog(mockProducts, { categoryId: 1 }); // Electronics
    results.forEach((p) => {
      expect(p.categoryId).toBe(1);
    });
  });

  it('filters products by low stock threshold', () => {
    const results = filterCatalog(mockProducts, { onlyLowStock: true });
    results.forEach((p) => {
      expect(p.quantity).toBeLessThanOrEqual(p.minReorderLevel);
    });
  });

  it('returns empty array when search query matches nothing', () => {
    const results = filterCatalog(mockProducts, { search: 'non_existent_sku_xyz_123' });
    expect(results).toEqual([]);
  });

  it('combines category and low stock filters accurately', () => {
    const results = filterCatalog(mockProducts, { categoryId: 1, onlyLowStock: true });
    results.forEach((p) => {
      expect(p.categoryId).toBe(1);
      expect(p.quantity).toBeLessThanOrEqual(p.minReorderLevel);
    });
  });

  describe('Sorting Logic', () => {
    const sortCatalog = (products, sortBy) => {
      return [...products].sort((a, b) => {
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
    };

    it('sorts products alphabetically by name ascending and descending', () => {
      const asc = sortCatalog(mockProducts, 'name_asc');
      for (let i = 0; i < asc.length - 1; i++) {
        expect(asc[i].name.localeCompare(asc[i + 1].name)).toBeLessThanOrEqual(0);
      }

      const desc = sortCatalog(mockProducts, 'name_desc');
      for (let i = 0; i < desc.length - 1; i++) {
        expect(desc[i].name.localeCompare(desc[i + 1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it('sorts products by quantity ascending and descending', () => {
      const asc = sortCatalog(mockProducts, 'qty_asc');
      for (let i = 0; i < asc.length - 1; i++) {
        expect(asc[i].quantity).toBeLessThanOrEqual(asc[i + 1].quantity);
      }

      const desc = sortCatalog(mockProducts, 'qty_desc');
      for (let i = 0; i < desc.length - 1; i++) {
        expect(desc[i].quantity).toBeGreaterThanOrEqual(desc[i + 1].quantity);
      }
    });

    it('sorts products by price ascending and descending', () => {
      const asc = sortCatalog(mockProducts, 'price_asc');
      for (let i = 0; i < asc.length - 1; i++) {
        expect(asc[i].sellingPrice).toBeLessThanOrEqual(asc[i + 1].sellingPrice);
      }

      const desc = sortCatalog(mockProducts, 'price_desc');
      for (let i = 0; i < desc.length - 1; i++) {
        expect(desc[i].sellingPrice).toBeGreaterThanOrEqual(desc[i + 1].sellingPrice);
      }
    });
  });
});
