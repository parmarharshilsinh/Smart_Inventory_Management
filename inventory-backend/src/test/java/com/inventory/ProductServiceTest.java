package com.inventory;

import com.inventory.dto.product.ProductCreateRequest;
import com.inventory.dto.product.ProductResponse;
import com.inventory.dto.product.ProductUpdateRequest;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.Supplier;
import com.inventory.entity.User;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.InvalidOperationException;
import com.inventory.mapper.ProductMapper;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import com.inventory.repository.SupplierRepository;
import com.inventory.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private StockTransactionRepository stockTransactionRepository;

    private ProductMapper productMapper;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productMapper = new ProductMapper();
        productService = new ProductService(productRepository, categoryRepository, supplierRepository, stockTransactionRepository, productMapper);
    }

    @Test
    @DisplayName("Should successfully create a product with unique SKU and category")
    void testCreateProductSuccess() {
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("Ergonomic Keyboard");
        req.setSku("SKU-KB-001");
        req.setCategoryId(1L);
        req.setCostPrice(BigDecimal.valueOf(50.00));
        req.setSellingPrice(BigDecimal.valueOf(89.99));
        req.setInitialQuantity(20);
        req.setMinReorderLevel(5);

        Category cat = new Category("Electronics", "Peripherals");
        cat.setId(1L);

        when(productRepository.existsBySku("SKU-KB-001")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        User admin = new User("admin", "admin@test.com", "hash", "Admin", User.Role.ROLE_ADMIN);
        ProductResponse res = productService.createProduct(req, admin);

        assertThat(res).isNotNull();
        assertThat(res.getId()).isEqualTo(100L);
        assertThat(res.getSku()).isEqualTo("SKU-KB-001");
        assertThat(res.getQuantity()).isEqualTo(20);
        assertThat(res.getCategoryName()).isEqualTo("Electronics");

        // Verify initial stock transaction was recorded
        verify(stockTransactionRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should reject product creation with duplicate SKU")
    void testCreateProductDuplicateSku() {
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("Duplicate Item");
        req.setSku("DUPLICATE-SKU");

        when(productRepository.existsBySku("DUPLICATE-SKU")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(req, null))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update product metadata without altering stock quantityOnHand")
    void testUpdateProductPreservesQuantity() {
        Category cat = new Category("Tools", "Hand tools");
        cat.setId(2L);

        Product existing = new Product("SKU-DRILL", "Drill v1", cat, BigDecimal.valueOf(40), BigDecimal.valueOf(70), 55, 10);
        existing.setId(5L);

        ProductUpdateRequest updateReq = new ProductUpdateRequest();
        updateReq.setName("Drill v2 Pro");
        updateReq.setSku("SKU-DRILL-PRO");
        updateReq.setCategoryId(2L);
        updateReq.setCostPrice(BigDecimal.valueOf(45));
        updateReq.setSellingPrice(BigDecimal.valueOf(79.99));
        updateReq.setMinReorderLevel(12);

        when(productRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(productRepository.existsBySkuAndIdNot("SKU-DRILL-PRO", 5L)).thenReturn(false);
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(cat));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponse res = productService.updateProduct(5L, updateReq);

        assertThat(res.getName()).isEqualTo("Drill v2 Pro");
        assertThat(res.getSku()).isEqualTo("SKU-DRILL-PRO");
        // CRITICAL: quantityOnHand must remain untouched (55)
        assertThat(res.getQuantity()).isEqualTo(55);
        assertThat(existing.getQuantityOnHand()).isEqualTo(55);
    }

    @Test
    @DisplayName("Should prevent deletion of product with transaction history")
    void testDeleteProductWithTransactionHistoryBlocked() {
        Product p = new Product("SKU-01", "Item", null, BigDecimal.TEN, BigDecimal.TEN, 10, 5);
        p.setId(1L);

        when(productRepository.findById(1L)).thenReturn(Optional.of(p));
        when(stockTransactionRepository.existsByProductId(1L)).thenReturn(true);

        assertThatThrownBy(() -> productService.deleteProduct(1L))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("historical stock transactions exist");

        verify(productRepository, never()).delete(any());
    }
}
