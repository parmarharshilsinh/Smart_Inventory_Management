package com.inventory.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "supplier", fetch = FetchType.LAZY)
    private List<Product> products = new ArrayList<>();

    public Supplier() {
    }

    public Supplier(String companyName, String contactPerson, String email, String phone, String address) {
        this.companyName = companyName;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Supplier supplier)) return false;
        return Objects.equals(id, supplier.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
