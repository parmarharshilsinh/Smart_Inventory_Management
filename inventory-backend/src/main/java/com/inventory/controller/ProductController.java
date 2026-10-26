package com.inventory.controller;

import com.inventory.dto.common.PageResponse;
import com.inventory.dto.product.ProductCreateRequest;
import com.inventory.dto.product.ProductResponse;
import com.inventory.dto.product.ProductUpdateRequest;
import com.inventory.entity.User;
import com.inventory.repository.UserRepository;
import com.inventory.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "false") boolean lowStockOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String[] sort
    ) {
        Sort.Direction direction = Sort.Direction.DESC;
        String property = "id";

        if (sort.length > 0) {
            String[] parts = sort[0].split(",");
            property = parts[0];
            if (parts.length > 1 && parts[1].equalsIgnoreCase("asc")) {
                direction = Sort.Direction.ASC;
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        PageResponse<ProductResponse> response = productService.getProducts(search, categoryId, lowStockOnly, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductResponse> getProductByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(productService.getProductByBarcode(barcode));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request,
            Authentication authentication
    ) {
        User creator = null;
        if (authentication != null) {
            creator = userRepository.findByUsername(authentication.getName()).orElse(null);
        }
        ProductResponse response = productService.createProduct(request, creator);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id:[0-9]+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id:[0-9]+}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
