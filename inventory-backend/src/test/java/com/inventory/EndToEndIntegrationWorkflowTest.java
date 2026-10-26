package com.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.dto.auth.LoginRequest;
import com.inventory.dto.auth.LoginResponse;
import com.inventory.dto.category.CategoryRequest;
import com.inventory.dto.category.CategoryResponse;
import com.inventory.dto.product.ProductCreateRequest;
import com.inventory.dto.product.ProductResponse;
import com.inventory.dto.product.ProductUpdateRequest;
import com.inventory.dto.stock.StockInRequest;
import com.inventory.dto.stock.StockOutRequest;
import com.inventory.dto.supplier.SupplierRequest;
import com.inventory.dto.supplier.SupplierResponse;
import com.inventory.entity.User;
import com.inventory.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EndToEndIntegrationWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String staffToken;

    @BeforeEach
    void setupDatabase() throws Exception {
        stockTransactionRepository.deleteAll();
        productRepository.deleteAll();
        supplierRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        // Seed Admin User
        User admin = new User("admin", "admin@inventory.local", passwordEncoder.encode("Admin@123"), "System Administrator", User.Role.ROLE_ADMIN);
        userRepository.save(admin);

        // Seed Staff User
        User staff = new User("staff", "staff@inventory.local", passwordEncoder.encode("Staff@123"), "Warehouse Staff", User.Role.ROLE_STAFF);
        userRepository.save(staff);

        // Login as Admin
        LoginRequest adminLogin = new LoginRequest("admin@inventory.local", "Admin@123");
        MvcResult adminRes = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        LoginResponse adminDto = objectMapper.readValue(adminRes.getResponse().getContentAsString(), LoginResponse.class);
        adminToken = adminDto.getToken();

        // Login as Staff
        LoginRequest staffLogin = new LoginRequest("staff@inventory.local", "Staff@123");
        MvcResult staffRes = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffLogin)))
                .andExpect(status().isOk())
                .andReturn();
        LoginResponse staffDto = objectMapper.readValue(staffRes.getResponse().getContentAsString(), LoginResponse.class);
        staffToken = staffDto.getToken();

        // Clear ThreadLocal security context so that all test requests rely strictly on JWT bearer tokens
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Complete End-to-End Workflow: Auth -> Category -> Supplier -> Product -> Stock-In -> Stock-Out -> Low-Stock -> Metrics")
    void testCompleteEndToEndWorkflow() throws Exception {
        // 1. Create Category
        CategoryRequest catReq = new CategoryRequest("Electronics", "High-tech consumer gadgets");
        MvcResult catResult = mockMvc.perform(post("/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Electronics"))
                .andReturn();
        CategoryResponse catDto = objectMapper.readValue(catResult.getResponse().getContentAsString(), CategoryResponse.class);
        Long categoryId = catDto.getId();

        // 2. Create Supplier
        SupplierRequest supReq = new SupplierRequest("Apex Technologies", "Alice Smith", "alice@apex.local", "+1-555-0100", "742 Evergreen Terrace");
        MvcResult supResult = mockMvc.perform(post("/suppliers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(supReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.companyName").value("Apex Technologies"))
                .andReturn();
        SupplierResponse supDto = objectMapper.readValue(supResult.getResponse().getContentAsString(), SupplierResponse.class);
        Long supplierId = supDto.getId();

        // 3. Admin creates Product (Initial Quantity: 20, Min Reorder: 15)
        ProductCreateRequest prodReq = new ProductCreateRequest();
        prodReq.setSku("SKU-PROD-E2E-001");
        prodReq.setBarcode("8901234567899");
        prodReq.setName("Noise Cancelling Headphones");
        prodReq.setDescription("Over-ear Bluetooth active noise-cancelling headphones");
        prodReq.setCategoryId(categoryId);
        prodReq.setSupplierId(supplierId);
        prodReq.setCostPrice(BigDecimal.valueOf(50.00));
        prodReq.setSellingPrice(BigDecimal.valueOf(99.99));
        prodReq.setInitialQuantity(20);
        prodReq.setMinReorderLevel(15);
        prodReq.setLocationShelf("Aisle 3, Shelf B");

        MvcResult prodResult = mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prodReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.sku").value("SKU-PROD-E2E-001"))
                .andExpect(jsonPath("$.quantity").value(20))
                .andReturn();
        ProductResponse prodDto = objectMapper.readValue(prodResult.getResponse().getContentAsString(), ProductResponse.class);
        Long productId = prodDto.getId();

        // 4. Staff views product details
        mockMvc.perform(get("/products/" + productId)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Noise Cancelling Headphones"))
                .andExpect(jsonPath("$.categoryName").value("Electronics"))
                .andExpect(jsonPath("$.supplierName").value("Apex Technologies"));

        // 5. Staff performs Barcode Scan lookup
        mockMvc.perform(get("/products/barcode/8901234567899")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU-PROD-E2E-001"));

        // 6. Admin updates Product Metadata (price change, shelf change; stock quantity protected)
        ProductUpdateRequest updateReq = new ProductUpdateRequest();
        updateReq.setSku("SKU-PROD-E2E-001");
        updateReq.setName("Noise Cancelling Headphones Pro");
        updateReq.setCategoryId(categoryId);
        updateReq.setSupplierId(supplierId);
        updateReq.setCostPrice(BigDecimal.valueOf(55.00));
        updateReq.setSellingPrice(BigDecimal.valueOf(119.99));
        updateReq.setMinReorderLevel(15);
        updateReq.setLocationShelf("Aisle 3, Shelf A");

        mockMvc.perform(put("/products/" + productId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Noise Cancelling Headphones Pro"))
                .andExpect(jsonPath("$.sellingPrice").value(119.99))
                .andExpect(jsonPath("$.quantity").value(20)); // Stock quantity preserved!

        // 7. Search and Filter Products
        mockMvc.perform(get("/products")
                        .header("Authorization", "Bearer " + staffToken)
                        .param("search", "Headphones")
                        .param("categoryId", categoryId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sku").value("SKU-PROD-E2E-001"));

        // 8. Staff executes Stock-In (+10 units: 20 -> 30)
        StockInRequest inReq = new StockInRequest(productId, 10, BigDecimal.valueOf(55.00), "PO-2026-901", "Restock shipment");
        mockMvc.perform(post("/transactions/stock-in")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("STOCK_IN"))
                .andExpect(jsonPath("$.previousQuantity").value(20))
                .andExpect(jsonPath("$.newQuantity").value(30));

        // 9. Staff executes Stock-Out (-18 units: 30 -> 12, dipping below minReorderLevel 15!)
        StockOutRequest outReq = new StockOutRequest(productId, 18, "DISP-2026-001", "Order dispatch");
        mockMvc.perform(post("/transactions/stock-out")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("STOCK_OUT"))
                .andExpect(jsonPath("$.previousQuantity").value(30))
                .andExpect(jsonPath("$.newQuantity").value(12));

        // 10. Attempt Over-Consumption Stock-Out (Request 50 when 12 available -> 400 Insufficient Stock)
        StockOutRequest excessReq = new StockOutRequest(productId, 50, "DISP-EXCESS", "Exceeds available");
        mockMvc.perform(post("/transactions/stock-out")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(excessReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Insufficient Stock"))
                .andExpect(jsonPath("$.message", containsString("Available: 12, Requested: 50")));

        // 11. Transaction History Audit (3 transactions: Initial intake + Stock-In + Stock-Out)
        mockMvc.perform(get("/transactions/history")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)));

        mockMvc.perform(get("/transactions/product/" + productId)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        // 12. Verify Low-Stock Alert (Product has 12 <= 15 minReorderLevel)
        mockMvc.perform(get("/dashboard/low-stock")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sku").value("SKU-PROD-E2E-001"))
                .andExpect(jsonPath("$[0].quantity").value(12));

        // 13. Verify Dashboard Summary Metrics
        mockMvc.perform(get("/dashboard/metrics")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(1))
                .andExpect(jsonPath("$.totalStockUnits").value(12))
                .andExpect(jsonPath("$.lowStockAlertsCount").value(1))
                .andExpect(jsonPath("$.outOfStockCount").value(0))
                .andExpect(jsonPath("$.inventoryValuation").value(660.00)); // 12 * 55.00 = 660.00

        // 14. Verify Category Breakdown Report
        mockMvc.perform(get("/reports/category-breakdown")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categoryName").value("Electronics"))
                .andExpect(jsonPath("$[0].productCount").value(1))
                .andExpect(jsonPath("$[0].totalUnits").value(12));
    }

    @Test
    @DisplayName("Failure & Edge Case Handling: 401, 403, 404, 409, and Validation Errors")
    void testFailureAndEdgeCases() throws Exception {
        // 1. Invalid Credentials Login -> 401 Unauthorized
        LoginRequest badLogin = new LoginRequest("admin@inventory.local", "WrongPassword@999");
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));

        // 2. Missing Token on Protected Endpoint -> 401 Unauthorized
        mockMvc.perform(get("/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        // 3. Unauthorized Admin Operation by Staff -> 403 Forbidden
        ProductCreateRequest staffProd = new ProductCreateRequest();
        staffProd.setName("Staff Created Item");
        staffProd.setSku("SKU-STAFF-FORBIDDEN");
        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffProd)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));

        // 4. Duplicate SKU Creation -> 409 Conflict
        // First create valid category
        CategoryRequest catReq = new CategoryRequest("Hardware", "Tools and parts");
        MvcResult catRes = mockMvc.perform(post("/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andReturn();
        Long catId = objectMapper.readValue(catRes.getResponse().getContentAsString(), CategoryResponse.class).getId();

        ProductCreateRequest prod1 = new ProductCreateRequest();
        prod1.setSku("SKU-UNIQUE-TEST");
        prod1.setName("Screw Pack");
        prod1.setCategoryId(catId);
        prod1.setCostPrice(BigDecimal.ONE);
        prod1.setSellingPrice(BigDecimal.valueOf(2));

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prod1)))
                .andExpect(status().isCreated());

        // Attempt second product with duplicate SKU
        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prod1)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message", containsString("SKU-UNIQUE-TEST")));

        // 5. Invalid Input Validation -> 400 Bad Request with fieldErrors
        ProductCreateRequest invalidProd = new ProductCreateRequest();
        // Missing name, sku, category, negative prices
        invalidProd.setCostPrice(BigDecimal.valueOf(-5.00));
        invalidProd.setSellingPrice(BigDecimal.valueOf(-10.00));

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidProd)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.sku").exists())
                .andExpect(jsonPath("$.fieldErrors.categoryId").exists())
                .andExpect(jsonPath("$.fieldErrors.costPrice").exists())
                .andExpect(jsonPath("$.fieldErrors.sellingPrice").exists());

        // 6. Resource Not Found -> 404
        mockMvc.perform(get("/products/999999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        // 7. Non-numeric Path Variable on ID endpoint -> 404 / 400 Type Mismatch
        mockMvc.perform(get("/products/invalid-id-string")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());

        // 8. Unhandled Unknown Endpoint -> 404 Not Found (NoResourceFoundException)
        mockMvc.perform(get("/unknown-system-route")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("Verify /products/low-stock dedicated route returns 200 OK")
    void testProductsLowStockRoute() throws Exception {
        // Create category
        CategoryRequest catReq = new CategoryRequest("Stationery", "Office supplies");
        MvcResult catRes = mockMvc.perform(post("/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andReturn();
        Long catId = objectMapper.readValue(catRes.getResponse().getContentAsString(), CategoryResponse.class).getId();

        // Create low stock product (quantity: 2 <= minReorderLevel: 10)
        ProductCreateRequest prod = new ProductCreateRequest();
        prod.setSku("SKU-LOW-TEST-01");
        prod.setName("Paper Clips");
        prod.setCategoryId(catId);
        prod.setCostPrice(BigDecimal.ONE);
        prod.setSellingPrice(BigDecimal.valueOf(3));
        prod.setInitialQuantity(2);
        prod.setMinReorderLevel(10);

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prod)))
                .andExpect(status().isCreated());

        // Call GET /products/low-stock
        mockMvc.perform(get("/products/low-stock")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].sku").value("SKU-LOW-TEST-01"))
                .andExpect(jsonPath("$[0].quantity").value(2));
    }
}
