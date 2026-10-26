# Smart Inventory Management — API Audit & Endpoint Inventory

## 1. Overview & Architecture

The **Smart Inventory Management Backend** exposes a RESTful API built with **Spring Boot 3.3.4** and **Java 21 LTS**, mounted at the base URL prefix:

```
http://localhost:8080/api/v1
```

All protected endpoints authenticate requests via the HTTP `Authorization` header containing a signed HMAC-SHA512 JWT bearer token:

```http
Authorization: Bearer <jwt-token>
```

---

## 2. Comprehensive Endpoint Inventory

### A. Authentication & User Management (`AuthController`)

| Method | Path | Auth Required | Required Role | Request Body / Params | Expected Response | Error Codes | Frontend Service & Screen | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | No | Public | `LoginRequest` (email, password) | `200 OK`: `LoginResponse` (token, type, user) | `400 Bad Request`, `401 Unauthorized` | `authApi.login` → `LoginScreen` | `AuthServiceTest`, `SecurityAndRbacIntegrationTest` |
| `POST` | `/auth/register` | No | Public (Admin promoted if caller is Admin) | `RegisterRequest` (username, email, password, fullName) | `201 Created`: `UserResponse` | `400 Bad Request`, `409 Conflict` | `authApi.register` → `RegisterScreen` | `AuthServiceTest`, `SecurityAndRbacIntegrationTest` |
| `GET` | `/auth/me` | Yes | `ADMIN`, `STAFF` | None | `200 OK`: `UserResponse` | `401 Unauthorized` | `authApi.getCurrentUser` → `AuthContext` | `AuthServiceTest` |
| `GET` | `/users` | Yes | `ROLE_ADMIN` | None | `200 OK`: `List<UserResponse>` | `401 Unauthorized`, `403 Forbidden` | `authApi.getUsers` → `UserManagementScreen` | `SecurityAndRbacIntegrationTest` |
| `PATCH` | `/users/{id}/status` | Yes | `ROLE_ADMIN` | `Map<String, Boolean>` (`isActive`) | `200 OK`: `UserResponse` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` | `authApi.toggleUserStatus` → `UserManagementScreen` | `SecurityAndRbacIntegrationTest` |

---

### B. Product Catalog (`ProductController`)

| Method | Path | Auth Required | Required Role | Request Body / Params | Expected Response | Error Codes | Frontend Service & Screen | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | Yes | `ADMIN`, `STAFF` | `search`, `categoryId`, `lowStockOnly`, `page`, `size`, `sort` | `200 OK`: `PageResponse<ProductResponse>` | `401 Unauthorized` | `productApi.getAll` → `ProductListScreen` | `ProductServiceTest`, `EndToEndIntegrationWorkflowTest` |
| `GET` | `/products/{id}` | Yes | `ADMIN`, `STAFF` | Path: `id` | `200 OK`: `ProductResponse` | `401 Unauthorized`, `404 Not Found` | `productApi.getById` → `ProductDetailScreen` | `ProductServiceTest` |
| `GET` | `/products/barcode/{barcode}` | Yes | `ADMIN`, `STAFF` | Path: `barcode` | `200 OK`: `ProductResponse` | `401 Unauthorized`, `404 Not Found` | `productApi.getByBarcode` → `ProductListScreen` | `ProductServiceTest` |
| `POST` | `/products` | Yes | `ROLE_ADMIN` | `ProductCreateRequest` (sku, name, categoryId, etc.) | `201 Created`: `ProductResponse` | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict` | `productApi.create` → `AddProductScreen` | `ProductServiceTest`, `SecurityAndRbacIntegrationTest` |
| `PUT` | `/products/{id}` | Yes | `ROLE_ADMIN` | `ProductUpdateRequest` | `200 OK`: `ProductResponse` | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` | `productApi.update` → `EditProductScreen` | `ProductServiceTest` |
| `DELETE` | `/products/{id}` | Yes | `ROLE_ADMIN` | Path: `id` | `204 No Content` | `401 Unauthorized`, `403 Forbidden`, `404 Not Found` | `productApi.delete` → `ProductDetailScreen` | `ProductServiceTest` |

---

### C. Stock Transactions (`StockController`)

| Method | Path | Auth Required | Required Role | Request Body / Params | Expected Response | Error Codes | Frontend Service & Screen | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/transactions/stock-in` | Yes | `ADMIN`, `STAFF` | `StockInRequest` (productId, quantity, invoice, notes) | `200 OK`: `StockTransactionResponse` | `400 Bad Request`, `401 Unauthorized`, `404 Not Found` | `stockApi.recordStockIn` → `StockInScreen` | `StockServiceTest`, `EndToEndIntegrationWorkflowTest` |
| `POST` | `/transactions/stock-out` | Yes | `ADMIN`, `STAFF` | `StockOutRequest` (productId, quantity, invoice, notes) | `200 OK`: `StockTransactionResponse` | `400 Bad Request` (Insufficient Stock), `401 Unauthorized`, `404 Not Found` | `stockApi.recordStockOut` → `StockOutScreen` | `StockServiceTest`, `EndToEndIntegrationWorkflowTest` |
| `GET` | `/transactions/history` | Yes | `ADMIN`, `STAFF` | `productId`, `type`, `startDate`, `endDate`, `page`, `size` | `200 OK`: `PageResponse<StockTransactionResponse>` | `401 Unauthorized` | `stockApi.getHistory` → `StockHistoryScreen` | `StockServiceTest` |
| `GET` | `/transactions/product/{productId}` | Yes | `ADMIN`, `STAFF` | Path: `productId` | `200 OK`: `List<StockTransactionResponse>` | `401 Unauthorized`, `404 Not Found` | `stockApi.getProductTransactions` → `ProductDetailScreen` | `StockServiceTest` |

---

### D. Dashboard & Analytics (`DashboardController`)

| Method | Path | Auth Required | Required Role | Request Body / Params | Expected Response | Error Codes | Frontend Service & Screen | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/metrics` | Yes | `ADMIN`, `STAFF` | None | `200 OK`: `DashboardMetricsResponse` (totalProducts, lowStockItems, valuation) | `401 Unauthorized` | `reportApi.getDashboardMetrics` → `DashboardScreen` | `DashboardServiceTest` |
| `GET` | `/dashboard/low-stock` | Yes | `ADMIN`, `STAFF` | None | `200 OK`: `List<ProductResponse>` | `401 Unauthorized` | `stockApi.getLowStockAlerts` → `LowStockAlertsScreen` | `DashboardServiceTest` |
| `GET` | `/reports/category-breakdown` | Yes | `ADMIN`, `STAFF` | None | `200 OK`: `List<CategoryBreakdownResponse>` | `401 Unauthorized` | `reportApi.getCategoryBreakdown` → `ReportsScreen` | `DashboardServiceTest` |
| `GET` | `/reports/valuation` | Yes | `ADMIN`, `STAFF` | None | `200 OK`: `DashboardMetricsResponse` | `401 Unauthorized` | `reportApi.getInventoryValuationReport` → `ReportsScreen` | `DashboardServiceTest` |

---

### E. Categories & Suppliers (`CategoryController`, `SupplierController`)

| Method | Path | Auth Required | Required Role | Request Body / Params | Expected Response | Error Codes | Frontend Service & Screen | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/categories` | Yes | `ADMIN`, `STAFF` | None | `200 OK`: `List<CategoryResponse>` | `401 Unauthorized` | `categoryApi.getAll` → `CategoryListScreen`, `ProductListScreen` | `EndToEndIntegrationWorkflowTest` |
| `POST` | `/categories` | Yes | `ROLE_ADMIN` | `CategoryRequest` (name, code, description) | `201 Created`: `CategoryResponse` | `400 Bad Request`, `403 Forbidden`, `409 Conflict` | `categoryApi.create` → `CategoryListScreen` | `SecurityAndRbacIntegrationTest` |
| `GET` | `/suppliers` | Yes | `ADMIN`, `STAFF` | None | `200 OK`: `List<SupplierResponse>` | `401 Unauthorized` | `supplierApi.getAll` → `SupplierListScreen` | `EndToEndIntegrationWorkflowTest` |
| `POST` | `/suppliers` | Yes | `ROLE_ADMIN` | `SupplierRequest` (name, contactPerson, email, phone) | `201 Created`: `SupplierResponse` | `400 Bad Request`, `403 Forbidden` | `supplierApi.create` → `SupplierListScreen` | `SecurityAndRbacIntegrationTest` |

---

### F. Health Monitoring (`HealthController`)

| Method | Path | Auth Required | Required Role | Request Body / Params | Expected Response | Error Codes | Frontend Service & Screen | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | No | Public | None | `200 OK`: `{"status":"UP","timestamp":"..."}` | None | Diagnostics / Startup Check | Integration health test |

---

## 3. Client Integration Specifications

### Centralized Axios Client (`src/api/client.js`)
- **Single Configurable Base URL:** Defaults to `http://localhost:8080/api/v1` for local web, `http://10.0.2.2:8080/api/v1` for Android Emulator, or a custom IP configured via settings.
- **Request Interceptor:** Automatically fetches token from `storage` (`Expo SecureStore` or web `localStorage`) and adds `Authorization: Bearer <token>`.
- **Response Normalization:** Intercepts 4xx/5xx status codes and formats errors into a consistent structure `{ status, message, details, isNetworkError }` without exposing backend internal exceptions or stack traces.
- **Idempotency & Safe Requests:** Safe retries are only permitted on read queries (`GET`), while mutating stock changes (`POST /transactions/stock-in`, `/transactions/stock-out`) are executed transactionally without auto-retrying duplicate financial decrements.
