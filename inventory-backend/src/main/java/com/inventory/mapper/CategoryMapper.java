package com.inventory.mapper;

import com.inventory.dto.category.CategoryResponse;
import com.inventory.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) return null;
        int count = category.getProducts() != null ? category.getProducts().size() : 0;
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                count,
                category.getCreatedAt()
        );
    }
}
