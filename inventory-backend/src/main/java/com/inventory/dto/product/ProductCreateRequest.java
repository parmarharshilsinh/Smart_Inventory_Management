package com.inventory.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProductCreateRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "SKU is required")
    private String sku;

    private String barcode;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Long supplierId;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Cost price must be greater than or equal to 0")
    private BigDecimal costPrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Selling price must be greater than or equal to 0")
    private BigDecimal sellingPrice;

    @Min(value = 0, message = "Initial quantity cannot be negative")
    private Integer initialQuantity = 0;

    @Min(value = 0, message = "Minimum stock level cannot be negative")
    private Integer minReorderLevel = 10;

    private String locationShelf;

    public ProductCreateRequest() {
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

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
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

    public Integer getInitialQuantity() {
        return initialQuantity;
    }

    public void setInitialQuantity(Integer initialQuantity) {
        this.initialQuantity = initialQuantity;
    }

    public void setQuantity(Integer quantity) {
        this.initialQuantity = quantity;
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
}
