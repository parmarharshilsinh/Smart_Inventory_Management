package com.inventory.mapper;

import com.inventory.dto.stock.StockTransactionResponse;
import com.inventory.entity.StockTransaction;
import org.springframework.stereotype.Component;

@Component
public class StockTransactionMapper {

    public StockTransactionResponse toResponse(StockTransaction tx) {
        if (tx == null) return null;
        return new StockTransactionResponse(
                tx.getId(),
                tx.getProduct() != null ? tx.getProduct().getId() : null,
                tx.getProduct() != null ? tx.getProduct().getName() : null,
                tx.getProduct() != null ? tx.getProduct().getSku() : null,
                tx.getTransactionType().name(),
                tx.getQuantity(),
                tx.getPreviousQuantity(),
                tx.getNewQuantity(),
                tx.getUnitCost(),
                tx.getReferenceInvoice(),
                tx.getNotes(),
                tx.getPerformedByUser() != null ? tx.getPerformedByUser().getFullName() : "System",
                tx.getTransactionTimestamp()
        );
    }
}
