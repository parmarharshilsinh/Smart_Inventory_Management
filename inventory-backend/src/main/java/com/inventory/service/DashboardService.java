package com.inventory.service;

import com.inventory.dto.product.ProductResponse;
import com.inventory.dto.report.CategoryBreakdownResponse;
import com.inventory.dto.report.DashboardMetricsResponse;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.mapper.ProductMapper;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final ProductMapper productMapper;

    public DashboardService(ProductRepository productRepository, CategoryRepository categoryRepository, StockTransactionRepository stockTransactionRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.productMapper = productMapper;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsResponse getMetrics() {
        long totalProducts = productRepository.countByIsActiveTrue();
        Long totalStockUnits = productRepository.sumTotalStockUnits();
        BigDecimal totalValuation = productRepository.calculateTotalInventoryValuation();
        Long lowStockAlertsCount = productRepository.countLowStockProducts();
        Long outOfStockCount = productRepository.countOutOfStockProducts();

        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        long recentToday = stockTransactionRepository.countByTransactionTimestampAfter(startOfDay);

        return new DashboardMetricsResponse(
                totalProducts,
                totalStockUnits != null ? totalStockUnits : 0L,
                totalValuation != null ? totalValuation : BigDecimal.ZERO,
                lowStockAlertsCount != null ? lowStockAlertsCount : 0L,
                outOfStockCount != null ? outOfStockCount : 0L,
                recentToday
        );
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownResponse> getCategoryBreakdown() {
        List<Category> categories = categoryRepository.findAllByIsActiveTrue();
        BigDecimal totalValuation = productRepository.calculateTotalInventoryValuation();
        if (totalValuation == null) totalValuation = BigDecimal.ZERO;

        List<CategoryBreakdownResponse> breakdown = new ArrayList<>();
        for (Category cat : categories) {
            List<Product> products = cat.getProducts() != null
                    ? cat.getProducts().stream().filter(Product::isActive).collect(Collectors.toList())
                    : List.of();

            long units = products.stream().mapToLong(Product::getQuantityOnHand).sum();
            BigDecimal catValuation = products.stream()
                    .map(p -> p.getCostPrice().multiply(BigDecimal.valueOf(p.getQuantityOnHand())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double percentage = 0.0;
            if (totalValuation.compareTo(BigDecimal.ZERO) > 0) {
                percentage = catValuation.divide(totalValuation, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
            }

            breakdown.add(new CategoryBreakdownResponse(
                    cat.getId(),
                    cat.getName(),
                    products.size(),
                    units,
                    catValuation,
                    percentage
            ));
        }

        return breakdown;
    }
}
