package com.inventory.repository;

import com.inventory.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findByBarcode(String barcode);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    boolean existsByCategoryId(Long categoryId);

    boolean existsBySupplierId(Long supplierId);

    /**
     * Pessimistic locking for atomic concurrency during stock in/out
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    /**
     * Search and filter query with pagination
     */
    @Query("SELECT p FROM Product p " +
           "WHERE p.isActive = true " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR (p.barcode IS NOT NULL AND LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')))) " +
           "AND (:lowStockOnly = false OR p.quantityOnHand <= p.minReorderLevel)")
    Page<Product> findWithFilters(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("lowStockOnly") boolean lowStockOnly,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.quantityOnHand <= p.minReorderLevel ORDER BY p.quantityOnHand ASC")
    List<Product> findLowStockProducts();

    // Aggregations
    @Query("SELECT COALESCE(SUM(p.quantityOnHand), 0) FROM Product p WHERE p.isActive = true")
    Long sumTotalStockUnits();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true AND p.quantityOnHand <= p.minReorderLevel")
    Long countLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true AND p.quantityOnHand <= 0")
    Long countOutOfStockProducts();

    @Query("SELECT COALESCE(SUM(p.costPrice * p.quantityOnHand), 0) FROM Product p WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryValuation();

    long countByIsActiveTrue();
}
