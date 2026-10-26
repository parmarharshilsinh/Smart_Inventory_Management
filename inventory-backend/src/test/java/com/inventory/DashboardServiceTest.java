package com.inventory;

import com.inventory.dto.report.CategoryBreakdownResponse;
import com.inventory.dto.report.DashboardMetricsResponse;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.mapper.ProductMapper;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import com.inventory.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private StockTransactionRepository stockTransactionRepository;

    private ProductMapper productMapper;
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        productMapper = new ProductMapper();
        dashboardService = new DashboardService(productRepository, categoryRepository, stockTransactionRepository, productMapper);
    }

    @Test
    @DisplayName("Should correctly calculate dashboard metrics and KPIs")
    void testGetMetrics() {
        when(productRepository.countByIsActiveTrue()).thenReturn(25L);
        when(productRepository.sumTotalStockUnits()).thenReturn(540L);
        when(productRepository.calculateTotalInventoryValuation()).thenReturn(BigDecimal.valueOf(12500.50));
        when(productRepository.countLowStockProducts()).thenReturn(4L);
        when(productRepository.countOutOfStockProducts()).thenReturn(1L);
        when(stockTransactionRepository.countByTransactionTimestampAfter(any())).thenReturn(8L);

        DashboardMetricsResponse metrics = dashboardService.getMetrics();

        assertThat(metrics.getTotalProducts()).isEqualTo(25L);
        assertThat(metrics.getTotalStockUnits()).isEqualTo(540L);
        assertThat(metrics.getTotalInventoryValuation()).isEqualByComparingTo("12500.50");
        assertThat(metrics.getLowStockAlertsCount()).isEqualTo(4L);
        assertThat(metrics.getOutOfStockCount()).isEqualTo(1L);
        assertThat(metrics.getRecentTransactionsToday()).isEqualTo(8L);
    }

    @Test
    @DisplayName("Should correctly calculate category breakdown percentages")
    void testCategoryBreakdown() {
        Category cat1 = new Category("Electronics", "Tech");
        cat1.setId(1L);
        Product p1 = new Product("SKU-1", "Laptop", cat1, BigDecimal.valueOf(500), BigDecimal.valueOf(800), 10, 2);
        cat1.setProducts(List.of(p1));

        when(categoryRepository.findAllByIsActiveTrue()).thenReturn(List.of(cat1));
        when(productRepository.calculateTotalInventoryValuation()).thenReturn(BigDecimal.valueOf(5000));

        List<CategoryBreakdownResponse> breakdown = dashboardService.getCategoryBreakdown();

        assertThat(breakdown).hasSize(1);
        CategoryBreakdownResponse item = breakdown.get(0);
        assertThat(item.getCategoryName()).isEqualTo("Electronics");
        assertThat(item.getTotalUnits()).isEqualTo(10L);
        assertThat(item.getTotalValuation()).isEqualByComparingTo("5000");
        assertThat(item.getPercentageOfTotal()).isEqualTo(100.0);
    }
}
