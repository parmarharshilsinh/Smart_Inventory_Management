package com.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory.dto.auth.LoginRequest;
import com.inventory.dto.auth.LoginResponse;
import com.inventory.dto.product.ProductCreateRequest;
import com.inventory.dto.stock.StockInRequest;
import com.inventory.dto.stock.StockOutRequest;
import com.inventory.entity.Category;
import com.inventory.entity.User;
import com.inventory.repository.CategoryRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockTransactionRepository;
import com.inventory.repository.UserRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAndRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String staffToken;
    private Category testCategory;

    @BeforeEach
    void setUp() throws Exception {
        stockTransactionRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();

        // Seed Admin User
        User admin = new User("admin", "admin@inventory.local", passwordEncoder.encode("Admin@123"), "Admin User", User.Role.ROLE_ADMIN);
        userRepository.save(admin);

        // Seed Staff User
        User staff = new User("staff", "staff@inventory.local", passwordEncoder.encode("Staff@123"), "Staff User", User.Role.ROLE_STAFF);
        userRepository.save(staff);

        // Seed Category
        testCategory = new Category("Electronics", "Tech and devices");
        categoryRepository.save(testCategory);

        // Obtain Admin JWT
        LoginRequest adminLogin = new LoginRequest("admin@inventory.local", "Admin@123");
        MvcResult adminRes = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();
        LoginResponse adminDto = objectMapper.readValue(adminRes.getResponse().getContentAsString(), LoginResponse.class);
        adminToken = adminDto.getToken();

        // Obtain Staff JWT
        LoginRequest staffLogin = new LoginRequest("staff@inventory.local", "Staff@123");
        MvcResult staffRes = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffLogin)))
                .andExpect(status().isOk())
                .andReturn();
        LoginResponse staffDto = objectMapper.readValue(staffRes.getResponse().getContentAsString(), LoginResponse.class);
        staffToken = staffDto.getToken();
    }

    @Test
    @DisplayName("Public health endpoint should be accessible without token")
    void testHealthEndpointPublic() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    @DisplayName("Protected endpoint should return 401 Unauthorized when token is missing")
    void testMissingTokenReturns401() throws Exception {
        mockMvc.perform(get("/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("Staff user should receive 403 Forbidden when attempting to create a product")
    void testStaffCannotCreateProduct() throws Exception {
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("Secret Device");
        req.setSku("SKU-STAFF-FORBIDDEN");
        req.setCategoryId(testCategory.getId());
        req.setCostPrice(BigDecimal.valueOf(10));
        req.setSellingPrice(BigDecimal.valueOf(20));

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @DisplayName("Admin user should successfully create product (201 Created)")
    void testAdminCanCreateProduct() throws Exception {
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("Admin Approved Laptop");
        req.setSku("SKU-ADMIN-001");
        req.setCategoryId(testCategory.getId());
        req.setCostPrice(BigDecimal.valueOf(600.00));
        req.setSellingPrice(BigDecimal.valueOf(999.00));
        req.setInitialQuantity(15);
        req.setMinReorderLevel(5);

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.sku").value("SKU-ADMIN-001"))
                .andExpect(jsonPath("$.quantity").value(15));
    }

    @Test
    @DisplayName("Staff user should be able to view products and execute Stock-In / Stock-Out")
    void testStaffCanExecuteStockMovements() throws Exception {
        // 1. Admin creates product with 10 units
        ProductCreateRequest req = new ProductCreateRequest();
        req.setName("Computer Mouse");
        req.setSku("SKU-MOUSE-01");
        req.setCategoryId(testCategory.getId());
        req.setCostPrice(BigDecimal.valueOf(10.00));
        req.setSellingPrice(BigDecimal.valueOf(20.00));
        req.setInitialQuantity(10);
        req.setMinReorderLevel(5);

        MvcResult createRes = mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andReturn();

        Number prodId = com.jayway.jsonpath.JsonPath.read(createRes.getResponse().getContentAsString(), "$.id");
        Long productId = prodId.longValue();

        // 2. Staff views product
        mockMvc.perform(get("/products/" + productId)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(10));

        // 3. Staff performs Stock-In of 5 units (total: 15)
        StockInRequest inReq = new StockInRequest(productId, 5, BigDecimal.valueOf(10.00), "PO-TEST", "Delivery");
        mockMvc.perform(post("/transactions/stock-in")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newQuantity").value(15));

        // 4. Staff performs Stock-Out of 3 units (total: 12)
        StockOutRequest outReq = new StockOutRequest(productId, 3, "DISP-TEST", "Sales dispatch");
        mockMvc.perform(post("/transactions/stock-out")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(outReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.newQuantity").value(12));

        // 5. Staff attempts Stock-Out exceeding available stock (15 units when 12 available -> 400 Bad Request)
        StockOutRequest excessReq = new StockOutRequest(productId, 15, "DISP-EXCESS", "Exceeds available");
        mockMvc.perform(post("/transactions/stock-out")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(excessReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Insufficient Stock"));
    }

    @Test
    @DisplayName("Validation failure should return 400 Bad Request with field error mappings")
    void testValidationFailure() throws Exception {
        ProductCreateRequest invalidReq = new ProductCreateRequest();
        // Missing name, sku, category, prices

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.sku").exists())
                .andExpect(jsonPath("$.fieldErrors.categoryId").exists());
    }
}
