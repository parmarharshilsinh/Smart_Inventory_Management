package com.inventory.dto.category;

import java.time.Instant;

public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private boolean isActive;
    private int productCount;
    private Instant createdAt;

    public CategoryResponse() {
    }

    public CategoryResponse(Long id, String name, String description, boolean isActive, int productCount, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.productCount = productCount;
        this.createdAt = createdAt;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public int getProductCount() {
        return productCount;
    }

    public void setProductCount(int productCount) {
        this.productCount = productCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
