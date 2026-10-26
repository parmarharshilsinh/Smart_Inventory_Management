package com.inventory.mapper;

import com.inventory.dto.product.ProductResponse;
import com.inventory.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        if (product == null) return null;
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSku(),
                product.getBarcode(),
                product.getDescription(),
                product.getCategory() != null ? product.getCategory().getId() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getSupplier() != null ? product.getSupplier().getId() : null,
                product.getSupplier() != null ? product.getSupplier().getCompanyName() : null,
                product.getCostPrice(),
                product.getSellingPrice(),
                product.getQuantityOnHand(),
                product.getMinReorderLevel(),
                product.getLocationShelf(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
