package com.inventory.controller;

import com.inventory.dto.common.PageResponse;
import com.inventory.dto.stock.StockInRequest;
import com.inventory.dto.stock.StockOutRequest;
import com.inventory.dto.stock.StockTransactionResponse;
import com.inventory.entity.StockTransaction;
import com.inventory.entity.User;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.UserRepository;
import com.inventory.service.StockService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/transactions")
public class StockController {

    private final StockService stockService;
    private final UserRepository userRepository;

    public StockController(StockService stockService, UserRepository userRepository) {
        this.stockService = stockService;
        this.userRepository = userRepository;
    }

    @PostMapping("/stock-in")
    public ResponseEntity<StockTransactionResponse> recordStockIn(
            @Valid @RequestBody StockInRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        StockTransactionResponse response = stockService.recordStockIn(request, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/stock-out")
    public ResponseEntity<StockTransactionResponse> recordStockOut(
            @Valid @RequestBody StockOutRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));

        StockTransactionResponse response = stockService.recordStockOut(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<PageResponse<StockTransactionResponse>> getTransactionHistory(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) StockTransaction.TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionTimestamp"));
        PageResponse<StockTransactionResponse> response = stockService.getTransactionHistory(productId, type, startDate, endDate, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockTransactionResponse>> getProductTransactions(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getProductTransactions(productId));
    }
}
