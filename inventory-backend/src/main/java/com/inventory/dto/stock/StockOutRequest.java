package com.inventory.dto.stock;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StockOutRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be a positive integer of at least 1")
    private Integer quantity;

    private String referenceInvoice;

    @NotBlank(message = "Transaction reason or notes is required")
    private String notes;

    public StockOutRequest() {
    }

    public StockOutRequest(Long productId, Integer quantity, String referenceInvoice, String notes) {
        this.productId = productId;
        this.quantity = quantity;
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
