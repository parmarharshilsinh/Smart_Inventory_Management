package com.inventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_sku", columnList = "sku"),
        @Index(name = "idx_product_barcode", columnList = "barcode"),
        @Index(name = "idx_product_category", columnList = "category_id")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(length = 100)
    private String barcode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(name = "quantity_on_hand", nullable = false)
    private Integer quantityOnHand = 0;

    @Column(name = "min_reorder_level", nullable = false)
    private Integer minReorderLevel = 10;

    @Column(name = "location_shelf", length = 50)
    private String locationShelf;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Version
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<StockTransaction> stockTransactions = new ArrayList<>();

    public Product() {
    }

    public Product(String sku, String name, Category category, BigDecimal costPrice, BigDecimal sellingPrice, Integer quantityOnHand, Integer minReorderLevel) {
        this.sku = sku;
        this.name = name;
        this.category = category;
        this.costPrice = costPrice != null ? costPrice : BigDecimal.ZERO;
        this.sellingPrice = sellingPrice != null ? sellingPrice : BigDecimal.ZERO;
        this.quantityOnHand = quantityOnHand != null ? quantityOnHand : 0;
        this.minReorderLevel = minReorderLevel != null ? minReorderLevel : 10;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
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

    public Integer getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(Integer quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
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

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<StockTransaction> getStockTransactions() {
        return stockTransactions;
    }

    public void setStockTransactions(List<StockTransaction> stockTransactions) {
        this.stockTransactions = stockTransactions;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Product product)) return false;
        return Objects.equals(id, product.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
