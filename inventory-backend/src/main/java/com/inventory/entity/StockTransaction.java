package com.inventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "stock_transactions", indexes = {
        @Index(name = "idx_trx_product", columnList = "product_id"),
        @Index(name = "idx_trx_user", columnList = "performed_by_user_id"),
        @Index(name = "idx_trx_timestamp", columnList = "transaction_timestamp")
})
public class StockTransaction {

    public enum TransactionType {
        STOCK_IN,
        STOCK_OUT,
        ADJUSTMENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "previous_quantity", nullable = false)
    private Integer previousQuantity;

    @Column(name = "new_quantity", nullable = false)
    private Integer newQuantity;

    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "reference_invoice", length = 100)
    private String referenceInvoice;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by_user_id", nullable = false)
    private User performedByUser;

    @Column(name = "transaction_timestamp", nullable = false, updatable = false)
    private Instant transactionTimestamp = Instant.now();

    public StockTransaction() {
    }

    public StockTransaction(Product product, TransactionType transactionType, Integer quantity, Integer previousQuantity, Integer newQuantity, BigDecimal unitCost, String referenceInvoice, String notes, User performedByUser) {
        this.product = product;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.unitCost = unitCost;
        this.referenceInvoice = referenceInvoice;
        this.notes = notes;
        this.performedByUser = performedByUser;
        this.transactionTimestamp = Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.transactionTimestamp == null) {
            this.transactionTimestamp = Instant.now();
        }
    }

    // Getters only for audit fields to maintain immutability
    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public Integer getPreviousQuantity() {
        return previousQuantity;
    }

    public Integer getNewQuantity() {
        return newQuantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public String getReferenceInvoice() {
        return referenceInvoice;
    }

    public String getNotes() {
        return notes;
    }

    public User getPerformedByUser() {
        return performedByUser;
    }

    public Instant getTransactionTimestamp() {
        return transactionTimestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StockTransaction that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
