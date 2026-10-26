package com.inventory;

import com.inventory.dto.stock.StockInRequest;
import com.inventory.dto.stock.StockOutRequest;
import com.inventory.dto.stock.StockTransactionResponse;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.StockTransaction;
import com.inventory.entity.User;
import com.inventory.exception.InsufficientStockException;
import com.inventory.exception.InvalidOperationException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.StockTransactionMapper;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import com.inventory.service.StockService;
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
class StockServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockTransactionRepository stockTransactionRepository;

    private StockTransactionMapper stockTransactionMapper;
    private StockService stockService;

    private User staffUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        stockTransactionMapper = new StockTransactionMapper();
        stockService = new StockService(productRepository, stockTransactionRepository, stockTransactionMapper);

        staffUser = new User("staff1", "staff1@inventory.local", "hashed", "Staff User", User.Role.ROLE_STAFF);
        staffUser.setId(2L);

        Category cat = new Category("Electronics", "Tech");
        cat.setId(1L);

        testProduct = new Product("SKU-100", "Wireless Mouse", cat, BigDecimal.valueOf(15.0), BigDecimal.valueOf(25.0), 30, 10);
        testProduct.setId(10L);
    }

    @Test
    @DisplayName("Should successfully record Stock-In and increment product quantity")
    void testRecordStockInSuccess() {
        StockInRequest req = new StockInRequest(10L, 20, BigDecimal.valueOf(14.50), "PO-2026-001", "Delivered on time");

        when(productRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(testProduct));
        when(stockTransactionRepository.save(any(StockTransaction.class))).thenAnswer(inv -> {
            StockTransaction tx = inv.getArgument(0);
            return tx;
        });

        StockTransactionResponse res = stockService.recordStockIn(req, staffUser);

        assertThat(res).isNotNull();
        assertThat(res.getTransactionType()).isEqualTo("STOCK_IN");
        assertThat(res.getQuantity()).isEqualTo(20);
        assertThat(res.getPreviousQuantity()).isEqualTo(30);
        assertThat(res.getNewQuantity()).isEqualTo(50);
        assertThat(testProduct.getQuantityOnHand()).isEqualTo(50);

        verify(productRepository).save(testProduct);
        verify(stockTransactionRepository).save(any(StockTransaction.class));
    }

    @Test
    @DisplayName("Should reject Stock-In with non-positive quantity")
    void testRecordStockInInvalidQuantity() {
        StockInRequest req = new StockInRequest(10L, 0, BigDecimal.TEN, "PO-0", "Invalid");

        assertThatThrownBy(() -> stockService.recordStockIn(req, staffUser))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("positive integer");

        verify(productRepository, never()).findByIdForUpdate(any());
    }

    @Test
    @DisplayName("Should successfully record Stock-Out and decrement product quantity")
    void testRecordStockOutSuccess() {
        StockOutRequest req = new StockOutRequest(10L, 10, "DISP-101", "Sales Order");

        when(productRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(testProduct));
        when(stockTransactionRepository.save(any(StockTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        StockTransactionResponse res = stockService.recordStockOut(req, staffUser);

        assertThat(res).isNotNull();
        assertThat(res.getTransactionType()).isEqualTo("STOCK_OUT");
        assertThat(res.getQuantity()).isEqualTo(10);
        assertThat(res.getPreviousQuantity()).isEqualTo(30);
        assertThat(res.getNewQuantity()).isEqualTo(20);
        assertThat(testProduct.getQuantityOnHand()).isEqualTo(20);

        verify(productRepository).save(testProduct);
    }

    @Test
    @DisplayName("Should reject Stock-Out when requested quantity exceeds available stock")
    void testRecordStockOutExceedsAvailable() {
        // testProduct currently has 30 units. Requesting 35 units.
        StockOutRequest req = new StockOutRequest(10L, 35, "DISP-102", "Excessive request");

        when(productRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(testProduct));

        assertThatThrownBy(() -> stockService.recordStockOut(req, staffUser))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock")
                .hasMessageContaining("Available: 30")
                .hasMessageContaining("Requested: 35");

        // Verify balance was not decremented
        assertThat(testProduct.getQuantityOnHand()).isEqualTo(30);
        verify(stockTransactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void testProductNotFound() {
        StockInRequest req = new StockInRequest(999L, 5, BigDecimal.TEN, "PO-999", "Test");
        when(productRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockService.recordStockIn(req, staffUser))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found with id: 999");
    }
}
