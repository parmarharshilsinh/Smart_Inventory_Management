package com.inventory.service;

import com.inventory.dto.common.PageResponse;
import com.inventory.dto.product.ProductCreateRequest;
import com.inventory.dto.product.ProductResponse;
import com.inventory.dto.product.ProductUpdateRequest;
import com.inventory.entity.Category;
import com.inventory.entity.Product;
import com.inventory.entity.StockTransaction;
import com.inventory.entity.Supplier;
import com.inventory.entity.User;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.InvalidOperationException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.ProductMapper;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import com.inventory.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, SupplierRepository supplierRepository, StockTransactionRepository stockTransactionRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.productMapper = productMapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(String search, Long categoryId, boolean lowStockOnly, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Product> page = productRepository.findWithFilters(cleanSearch, categoryId, lowStockOnly, pageable);
        Page<ProductResponse> dtoPage = page.map(productMapper::toResponse);
        return PageResponse.from(dtoPage);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode));
        return productMapper.toResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, User creator) {
        String cleanSku = request.getSku().trim().toUpperCase();
        if (productRepository.existsBySku(cleanSku)) {
            throw new DuplicateResourceException("Product with SKU '" + cleanSku + "' already exists.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        int initialQty = request.getInitialQuantity() != null ? request.getInitialQuantity() : 0;
        int minReorder = request.getMinReorderLevel() != null ? request.getMinReorderLevel() : 10;

        Product product = new Product(
                cleanSku,
                request.getName().trim(),
                category,
                request.getCostPrice(),
                request.getSellingPrice(),
                initialQty,
                minReorder
        );

        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            product.setBarcode(request.getBarcode().trim());
        }
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setSupplier(supplier);
        product.setLocationShelf(request.getLocationShelf() != null ? request.getLocationShelf().trim() : null);

        Product saved = productRepository.save(product);

        // Record initial intake transaction if quantity > 0
        if (initialQty > 0 && creator != null) {
            StockTransaction initTx = new StockTransaction(
                    saved,
                    StockTransaction.TransactionType.STOCK_IN,
                    initialQty,
                    0,
                    initialQty,
                    request.getCostPrice(),
                    "INITIAL-STOCK",
                    "Initial stock count on product creation",
                    creator
            );
            stockTransactionRepository.save(initTx);
        }

        return productMapper.toResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        String cleanSku = request.getSku().trim().toUpperCase();
        if (productRepository.existsBySkuAndIdNot(cleanSku, id)) {
            throw new DuplicateResourceException("Product with SKU '" + cleanSku + "' already exists.");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId()));
        }

        product.setName(request.getName().trim());
        product.setSku(cleanSku);
        product.setBarcode(request.getBarcode() != null && !request.getBarcode().trim().isEmpty() ? request.getBarcode().trim() : null);
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setCategory(category);
        product.setSupplier(supplier);
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        if (request.getMinReorderLevel() != null) {
            product.setMinReorderLevel(request.getMinReorderLevel());
        }
        product.setLocationShelf(request.getLocationShelf() != null ? request.getLocationShelf().trim() : null);

        // NOTE: product.getQuantityOnHand() is intentionally NOT modified here to prevent unverified stock alteration!

        Product updated = productRepository.save(product);
        return productMapper.toResponse(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (stockTransactionRepository.existsByProductId(id)) {
            throw new InvalidOperationException("Cannot delete product '" + product.getName() + "' because historical stock transactions exist. Deactivate the product instead.");
        }

        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(productMapper::toResponse)
                .collect(Collectors.toList());
    }
}
