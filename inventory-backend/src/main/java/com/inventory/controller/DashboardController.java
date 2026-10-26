package com.inventory.controller;

import com.inventory.dto.product.ProductResponse;
import com.inventory.dto.report.CategoryBreakdownResponse;
import com.inventory.dto.report.DashboardMetricsResponse;
import com.inventory.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/metrics")
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        return ResponseEntity.ok(dashboardService.getMetrics());
    }

    @GetMapping("/dashboard/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        return ResponseEntity.ok(dashboardService.getLowStockProducts());
    }

    @GetMapping("/reports/category-breakdown")
    public ResponseEntity<List<CategoryBreakdownResponse>> getCategoryBreakdown() {
        return ResponseEntity.ok(dashboardService.getCategoryBreakdown());
    }

    @GetMapping("/reports/valuation")
    public ResponseEntity<DashboardMetricsResponse> getValuationReport() {
        return ResponseEntity.ok(dashboardService.getMetrics());
    }
}
