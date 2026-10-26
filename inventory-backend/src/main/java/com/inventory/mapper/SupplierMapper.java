package com.inventory.mapper;

import com.inventory.dto.supplier.SupplierResponse;
import com.inventory.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierResponse toResponse(Supplier supplier) {
        if (supplier == null) return null;
        return new SupplierResponse(
                supplier.getId(),
                supplier.getCompanyName(),
                supplier.getContactPerson(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getAddress(),
                supplier.isActive(),
                supplier.getCreatedAt()
        );
    }
}
