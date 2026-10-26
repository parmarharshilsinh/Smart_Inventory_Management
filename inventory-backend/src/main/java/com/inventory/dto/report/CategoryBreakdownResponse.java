package com.inventory.dto.report;

import java.math.BigDecimal;

public class CategoryBreakdownResponse {

    private Long categoryId;
    private String categoryName;
    private long productCount;
    private long totalUnits;
    private BigDecimal totalValuation;
    private double percentageOfTotal;

    public CategoryBreakdownResponse() {
    }

    public CategoryBreakdownResponse(Long categoryId, String categoryName, long productCount, long totalUnits, BigDecimal totalValuation, double percentageOfTotal) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.productCount = productCount;
        this.totalUnits = totalUnits;
        this.totalValuation = totalValuation;
        this.percentageOfTotal = percentageOfTotal;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public long getProductCount() {
        return productCount;
    }

    public void setProductCount(long productCount) {
        this.productCount = productCount;
    }

    public long getTotalUnits() {
        return totalUnits;
    }

    public void setTotalUnits(long totalUnits) {
        this.totalUnits = totalUnits;
    }

    public BigDecimal getTotalValuation() {
        return totalValuation;
    }

    public void setTotalValuation(BigDecimal totalValuation) {
        this.totalValuation = totalValuation;
    }

    public double getPercentageOfTotal() {
        return percentageOfTotal;
    }

    public void setPercentageOfTotal(double percentageOfTotal) {
        this.percentageOfTotal = percentageOfTotal;
    }
}
