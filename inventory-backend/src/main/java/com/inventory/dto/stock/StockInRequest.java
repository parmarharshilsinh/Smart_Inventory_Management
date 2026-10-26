package com.inventory.dto.stock;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class StockInRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be a positive integer of at least 1")
    private Integer quantity;

    @DecimalMin(value = "0.0", inclusive = true, message = "Unit cost cannot be negative")
    private BigDecimal unitCost;

    private String referenceInvoice;

    private String notes;

    public StockInRequest() {
    }

    public StockInRequest(Long productId, Integer quantity, BigDecimal unitCost, String referenceInvoice, String notes) {
        this.productId = productId;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.referenceInvoice = referenceInvoice;
        this.notes = notes;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public String getReferenceInvoice() {
        return referenceInvoice;
    }

    public void setReferenceInvoice(String referenceInvoice) {
        this.referenceInvoice = referenceInvoice;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
