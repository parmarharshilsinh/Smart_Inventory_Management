package com.inventory.repository;

import com.inventory.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByProductIdOrderByTransactionTimestampDesc(Long productId);

    Page<StockTransaction> findAllByOrderByTransactionTimestampDesc(Pageable pageable);

    boolean existsByProductId(Long productId);

    long countByTransactionTimestampAfter(Instant timestamp);

    @Query("SELECT t FROM StockTransaction t " +
           "WHERE (:productId IS NULL OR t.product.id = :productId) " +
           "AND (:type IS NULL OR t.transactionType = :type) " +
           "AND (:startDate IS NULL OR t.transactionTimestamp >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionTimestamp <= :endDate) " +
           "ORDER BY t.transactionTimestamp DESC")
    Page<StockTransaction> findWithFilters(
            @Param("productId") Long productId,
            @Param("type") StockTransaction.TransactionType type,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable
    );
}
