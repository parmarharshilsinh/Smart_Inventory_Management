package com.inventory.dto.stock;

import java.math.BigDecimal;
import java.time.Instant;

public class StockTransactionResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String sku;
    private String transactionType;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private BigDecimal unitCost;
    private String referenceInvoice;
    private String notes;
    private String performedBy;
    private Instant timestamp;

    public StockTransactionResponse() {
    }

    public StockTransactionResponse(Long id, Long productId, String productName, String sku, String transactionType, Integer quantity, Integer previousQuantity, Integer newQuantity, BigDecimal unitCost, String referenceInvoice, String notes, String performedBy, Instant timestamp) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.unitCost = unitCost;
        this.referenceInvoice = referenceInvoice;
        this.notes = notes;
        this.performedBy = performedBy;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public String getType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public void setPreviousQuantity(Integer previousQuantity) {
        this.previousQuantity = previousQuantity;
    }

    public Integer getNewQuantity() {
        return newQuantity;
    }

    public void setNewQuantity(Integer newQuantity) {
        this.newQuantity = newQuantity;
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

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
