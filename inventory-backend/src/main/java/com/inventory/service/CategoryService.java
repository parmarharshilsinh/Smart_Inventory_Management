package com.inventory.service;

import com.inventory.dto.category.CategoryRequest;
import com.inventory.dto.category.CategoryResponse;
import com.inventory.entity.Category;
import com.inventory.exception.DuplicateResourceException;
import com.inventory.exception.InvalidOperationException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.CategoryMapper;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.categoryMapper = categoryMapper;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String cleanName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(cleanName)) {
            throw new DuplicateResourceException("Category with name '" + cleanName + "' already exists.");
        }

        Category category = new Category(cleanName, request.getDescription() != null ? request.getDescription().trim() : null);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String cleanName = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(cleanName, id)) {
            throw new DuplicateResourceException("Category with name '" + cleanName + "' already exists.");
        }

        category.setName(cleanName);
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (productRepository.existsByCategoryId(id)) {
            throw new InvalidOperationException("Cannot delete category '" + category.getName() + "' because products are currently assigned to it.");
        }

        categoryRepository.delete(category);
    }
}
