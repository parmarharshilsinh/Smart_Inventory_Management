package com.inventory.dto.report;

import java.math.BigDecimal;

public class DashboardMetricsResponse {

    private long totalProducts;
    private long totalStockUnits;
    private BigDecimal totalInventoryValuation;
    private long lowStockAlertsCount;
    private long outOfStockCount;
    private long recentTransactionsToday;

    public DashboardMetricsResponse() {
    }

    public DashboardMetricsResponse(long totalProducts, long totalStockUnits, BigDecimal totalInventoryValuation, long lowStockAlertsCount, long outOfStockCount, long recentTransactionsToday) {
        this.totalProducts = totalProducts;
        this.totalStockUnits = totalStockUnits;
        this.totalInventoryValuation = totalInventoryValuation;
        this.lowStockAlertsCount = lowStockAlertsCount;
        this.outOfStockCount = outOfStockCount;
        this.recentTransactionsToday = recentTransactionsToday;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalStockUnits() {
        return totalStockUnits;
    }

    public void setTotalStockUnits(long totalStockUnits) {
        this.totalStockUnits = totalStockUnits;
    }

    public BigDecimal getTotalInventoryValuation() {
        return totalInventoryValuation;
    }

    public BigDecimal getInventoryValuation() {
        return totalInventoryValuation;
    }

    public void setTotalInventoryValuation(BigDecimal totalInventoryValuation) {
        this.totalInventoryValuation = totalInventoryValuation;
    }

    public long getLowStockCount() {
        return lowStockAlertsCount;
    }

    public long getLowStockAlertsCount() {
        return lowStockAlertsCount;
    }

    public void setLowStockAlertsCount(long lowStockAlertsCount) {
        this.lowStockAlertsCount = lowStockAlertsCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }

    public void setOutOfStockCount(long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }

    public long getRecentTransactionsToday() {
        return recentTransactionsToday;
    }

    public void setRecentTransactionsToday(long recentTransactionsToday) {
        this.recentTransactionsToday = recentTransactionsToday;
    }
}
