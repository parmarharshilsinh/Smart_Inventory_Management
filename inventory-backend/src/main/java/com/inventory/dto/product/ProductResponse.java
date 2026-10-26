package com.inventory.dto.product;

import java.math.BigDecimal;
import java.time.Instant;

public class ProductResponse {

    private Long id;
    private String name;
    private String sku;
    private String barcode;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long supplierId;
    private String supplierName;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer quantity;
    private Integer minReorderLevel;
    private String locationShelf;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public ProductResponse() {
    }

    public ProductResponse(Long id, String name, String sku, String barcode, String description, Long categoryId, String categoryName, Long supplierId, String supplierName, BigDecimal costPrice, BigDecimal sellingPrice, Integer quantity, Integer minReorderLevel, String locationShelf, boolean isActive, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.barcode = barcode;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.costPrice = costPrice;
        this.sellingPrice = sellingPrice;
        this.quantity = quantity;
        this.minReorderLevel = minReorderLevel;
        this.locationShelf = locationShelf;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(BigDecimal sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Integer getQuantityOnHand() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getMinReorderLevel() {
        return minReorderLevel;
    }

    public void setMinReorderLevel(Integer minReorderLevel) {
        this.minReorderLevel = minReorderLevel;
    }

    public String getLocationShelf() {
        return locationShelf;
    }

    public void setLocationShelf(String locationShelf) {
        this.locationShelf = locationShelf;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
