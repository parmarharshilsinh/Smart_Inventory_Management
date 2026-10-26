package com.inventory.service;

import com.inventory.dto.common.PageResponse;
import com.inventory.dto.stock.StockInRequest;
import com.inventory.dto.stock.StockOutRequest;
import com.inventory.dto.stock.StockTransactionResponse;
import com.inventory.entity.Product;
import com.inventory.entity.StockTransaction;
import com.inventory.entity.User;
import com.inventory.exception.InsufficientStockException;
import com.inventory.exception.InvalidOperationException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.StockTransactionMapper;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final StockTransactionMapper stockTransactionMapper;

    public StockService(ProductRepository productRepository, StockTransactionRepository stockTransactionRepository, StockTransactionMapper stockTransactionMapper) {
        this.productRepository = productRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.stockTransactionMapper = stockTransactionMapper;
    }

    /**
     * Atomically executes a Stock-In operation with pessimistic locking.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public StockTransactionResponse recordStockIn(StockInRequest request, User performer) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new InvalidOperationException("Stock in quantity must be a positive integer greater than 0.");
        }

        // Lock product row to prevent concurrent race conditions
        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        int previousQty = product.getQuantityOnHand() != null ? product.getQuantityOnHand() : 0;
        int newQty = previousQty + request.getQuantity();

        product.setQuantityOnHand(newQty);
        productRepository.save(product);

        StockTransaction transaction = new StockTransaction(
                product,
                StockTransaction.TransactionType.STOCK_IN,
                request.getQuantity(),
                previousQty,
                newQty,
                request.getUnitCost() != null ? request.getUnitCost() : product.getCostPrice(),
                request.getReferenceInvoice() != null ? request.getReferenceInvoice().trim() : null,
                request.getNotes() != null ? request.getNotes().trim() : "Stock received",
                performer
        );

        StockTransaction saved = stockTransactionRepository.save(transaction);
        return stockTransactionMapper.toResponse(saved);
    }

    /**
     * Atomically executes a Stock-Out operation with pessimistic locking & balance check.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public StockTransactionResponse recordStockOut(StockOutRequest request, User performer) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new InvalidOperationException("Stock out quantity must be a positive integer greater than 0.");
        }

        // Lock product row for update
        Product product = productRepository.findByIdForUpdate(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        int previousQty = product.getQuantityOnHand() != null ? product.getQuantityOnHand() : 0;

        if (request.getQuantity() > previousQty) {
            throw new InsufficientStockException(product.getName(), request.getQuantity(), previousQty);
        }

        int newQty = previousQty - request.getQuantity();
        product.setQuantityOnHand(newQty);
        productRepository.save(product);

        StockTransaction transaction = new StockTransaction(
                product,
                StockTransaction.TransactionType.STOCK_OUT,
                request.getQuantity(),
                previousQty,
                newQty,
                product.getCostPrice(),
                request.getReferenceInvoice() != null ? request.getReferenceInvoice().trim() : null,
                request.getNotes() != null ? request.getNotes().trim() : "Stock dispatched",
                performer
        );

        StockTransaction saved = stockTransactionRepository.save(transaction);
        return stockTransactionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<StockTransactionResponse> getTransactionHistory(Long productId, StockTransaction.TransactionType type, Instant startDate, Instant endDate, Pageable pageable) {
        Page<StockTransaction> page = stockTransactionRepository.findWithFilters(productId, type, startDate, endDate, pageable);
        return PageResponse.from(page.map(stockTransactionMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public List<StockTransactionResponse> getProductTransactions(Long productId) {
        return stockTransactionRepository.findByProductIdOrderByTransactionTimestampDesc(productId).stream()
                .map(stockTransactionMapper::toResponse)
                .collect(Collectors.toList());
    }
}
