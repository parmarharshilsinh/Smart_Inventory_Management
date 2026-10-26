package com.inventory.service;

import com.inventory.dto.supplier.SupplierRequest;
import com.inventory.dto.supplier.SupplierResponse;
import com.inventory.entity.Supplier;
import com.inventory.exception.InvalidOperationException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.mapper.SupplierMapper;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final SupplierMapper supplierMapper;

    public SupplierService(SupplierRepository supplierRepository, ProductRepository productRepository, SupplierMapper supplierMapper) {
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.supplierMapper = supplierMapper;
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return supplierMapper.toResponse(supplier);
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        Supplier supplier = new Supplier(
                request.getCompanyName().trim(),
                request.getContactPerson() != null ? request.getContactPerson().trim() : null,
                request.getEmail() != null ? request.getEmail().trim() : null,
                request.getPhone() != null ? request.getPhone().trim() : null,
                request.getAddress() != null ? request.getAddress().trim() : null
        );
        Supplier saved = supplierRepository.save(supplier);
        return supplierMapper.toResponse(saved);
    }

    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        supplier.setCompanyName(request.getCompanyName().trim());
        supplier.setContactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : null);
        supplier.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        supplier.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        supplier.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);

        Supplier updated = supplierRepository.save(supplier);
        return supplierMapper.toResponse(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        if (productRepository.existsBySupplierId(id)) {
            throw new InvalidOperationException("Cannot delete supplier '" + supplier.getCompanyName() + "' because products are linked to this supplier.");
        }

        supplierRepository.delete(supplier);
    }
}
