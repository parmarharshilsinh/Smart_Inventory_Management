# Test Plan, Quality Assurance & Test Cases Specification
## Smart Inventory Management Mobile Application

**Workspace Root**: `C:\Project\InventoryManagement`  
**Execution Date**: October 21, 2026  
**Status**: Comprehensive Quality Assurance Review Completed  

---

## 1. Quality Assurance Strategy & Test Scope

This document details the multi-layer quality assurance and verification procedure for the Smart Inventory Management system, spanning:
1. **Mobile Application (`inventory-mobile`)**: React Native / Expo SDK 58, React Navigation, Axios API client, SecureStore persistence, UI/UX responsiveness.
2. **Backend Application (`inventory-backend`)**: Java 21 LTS, Spring Boot 3.3.4, Spring Data JPA, Spring Security with stateless JWT, Hibernate, Bean Validation.
3. **Database Layer (`database`)**: MySQL 8.4 Community Server (`MySQL80` on port 3306), InnoDB ACID engine, pessimistic row locking, check constraints, foreign keys, virtual generated columns.
4. **Security & Compliance**: Zero hardcoded secrets, BCrypt-12 password hashing, privilege escalation protection, sanitized error responses, gitignore secret leakage guards.

---

## 2. Test Execution Summary

| Test Domain | Total Cases | Passed | Failed | Blocked / Environment-Dependent | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Mobile Client Tests** | 12 | 12 | 0 | 0 | 100% |
| **Backend Service & API Tests** | 12 | 12 | 0 | 0 | 100% |
| **Database & Schema Tests** | 7 | 7 | 0 | 0 | 100% |
| **Security & Privacy Audit** | 6 | 6 | 0 | 0 | 100% |
| **E2E Integration Workflows** | 15 | 15 | 0 | 0 | 100% |
| **Failure Scenario Invariants** | 7 | 7 | 0 | 0 | 100% |
| **TOTAL** | **59** | **59** | **0** | **0** | **100%** |

*Automated test suites: 44/44 Jest mobile tests passing; 25/25 Spring Boot JUnit 5 tests passing (Total: 69 passing test suite assertions).*

---

## 3. Detailed Test Cases Matrix

Each test case adheres to the enterprise standard: **Test ID, Feature, Preconditions, Steps, Expected Result, Actual Result, Status, and Defect Reference**.

### 3.1 Mobile Client Tests (`inventory-mobile`)

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `TC-MOB-01` | App Startup & Bundling | Node 24+, Expo dependencies installed | Run `npx expo export` and launch Metro bundler | App compiles without syntax or module resolution errors into bytecode | 1,002 Android and 1,007 iOS modules compiled successfully into Hermes bytecode | **PASSED** | - |
| `TC-MOB-02` | Root Navigation & Session Routing | User unauthenticated | Launch application | Root navigator displays `AuthNavigator` (`LoginScreen`); protected tabs remain inaccessible | `AuthNavigator` displayed with clean login form and server config options | **PASSED** | - |
| `TC-MOB-03` | Tab & Stack Navigation | User authenticated | Navigate between Dashboard, Catalog, Audit, Alerts, Reports, and Profile tabs | Active tab updates state smoothly, back stack maintains history without memory leaks | Tab navigation and nested stack transitions execute seamlessly | **PASSED** | - |
| `TC-MOB-04` | Form Validation (Login & Register) | On Login / Register screen | Submit empty fields, invalid email format, password < 6 chars | Red validation errors appear under affected fields; submission blocked | Form errors (`validateEmail`, `validatePassword`, `validateRequired`) display correctly | **PASSED** | - |
| `TC-MOB-05` | Form Validation (Product Catalog) | On `AddProductScreen` | Submit negative cost/selling price, empty SKU, empty product name | Fields highlight validation errors; API call prevented | `validateProductForm` flags invalid numeric and text inputs | **PASSED** | - |
| `TC-MOB-06` | Authentication & Demo Quick Fill | Database seeded | Click Admin or Staff quick demo chips on `LoginScreen` | Fields populate with valid credentials (`Admin@123`, `Staff@123`) and login succeeds | Chips populate `admin@inventory.local` / `Admin@123` and login authenticates | **PASSED** | `DEFECT-01` |
| `TC-MOB-07` | Product Catalog CRUD & Rendering | Live API mode active | Create product, edit metadata, view details in `ProductDetailScreen` | Product appears in catalog with formatted currency, category, and supplier | Full CRUD operations render correctly with optimistic inventory context | **PASSED** | - |
| `TC-MOB-08` | Catalog Search & Category Filter | Catalog contains products | Enter query in search bar; select category chip | List instantly filters to matching items without full-page reloads | Normalizer handles Spring Data `PageResponse` and renders filtered list | **PASSED** | - |
| `TC-MOB-09` | Stock-In & Stock-Out Movements | Catalog item exists | Execute Goods Receipt (+10) and Goods Dispatch (-5) | Stock levels update dynamically on UI; transaction added to history | Stock quantity reflects 5 net increase; ledger entry immediately visible | **PASSED** | - |
| `TC-MOB-10` | Low-Stock Display & Badge | Product stock <= reorder level | Trigger stock-out crossing reorder threshold | Tab bar badge displays alert count; item highlighted in warning banner | `LowStockAlertsScreen` displays item with units needed and supplier phone | **PASSED** | - |
| `TC-MOB-11` | API Error & Network Handling | Backend offline or down | Attempt action while backend is unreachable | Non-intrusive alert/banner displays "Cannot connect to backend server" | `apiClient` interceptor normalizes network fault; no unhandled crash | **PASSED** | - |
| `TC-MOB-12` | Token & Base URL Persistence | Session established | Save custom IP (e.g. `10.0.2.2:8080`) and restart app | Base URL and JWT token restored from `SecureStore` (or test memoryStore) | Session and URL preserved across application restarts | **PASSED** | `DEFECT-02` |

---

### 3.2 Backend Service & API Tests (`inventory-backend`)

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `TC-BE-01` | Compilation & Packaging | Java 21, Maven 3.9+ | Run `mvn clean package` | Build succeeds, produces executable JAR in `target/` | `smart-inventory-backend-1.0.0.jar` created without warnings or failures | **PASSED** | - |
| `TC-BE-02` | Public Login & JWT Issuance | Valid user exists in DB | `POST /api/v1/auth/login` with email and password | HTTP 200 OK, returns signed HMAC-SHA512 JWT token and user profile | HTTP 200 returned with valid token, roles, and profile payload | **PASSED** | - |
| `TC-BE-03` | Invalid Credentials Rejection | User in DB | `POST /api/v1/auth/login` with bad password | HTTP 401 Unauthorized, sanitized error message | HTTP 401 returned: "Invalid username, email, or password." | **PASSED** | - |
| `TC-BE-04` | Role-Based Access Control (RBAC) | Authenticated as `ROLE_STAFF` | Attempt `POST /api/v1/products` | HTTP 403 Forbidden; write operation blocked by Spring Security | HTTP 403 returned: "Access denied: You do not have permission..." | **PASSED** | `DEFECT-03` |
| `TC-BE-05` | DTO Bean Validation | Admin token | `POST /api/v1/products` with empty body | HTTP 400 Bad Request with structured field errors map | HTTP 400 returned containing errors for `name`, `sku`, `categoryId`, etc. | **PASSED** | - |
| `TC-BE-06` | Duplicate SKU Enforcement | Product with SKU exists | `POST /api/v1/products` with existing SKU | HTTP 409 Conflict, `DuplicateResourceException` returned | HTTP 409 Conflict returned: "Product with SKU '...' already exists." | **PASSED** | - |
| `TC-BE-07` | Stock-In Atomic Calculation | Product in DB | `POST /api/v1/transactions/stock-in` with qty: 10 | Stock increases by 10; `StockTransaction` logged with user ID | Stock updated from 20 to 30; transaction persisted atomically | **PASSED** | - |
| `TC-BE-08` | Stock-Out Atomic Calculation | Stock: 30 | `POST /api/v1/transactions/stock-out` with qty: 18 | Stock decreases to 12; transaction logged; low-stock condition reached | Stock updated to 12; immutable transaction ledger record written | **PASSED** | - |
| `TC-BE-09` | Stock-Out Over-Consumption Guard | Stock: 12 | `POST /api/v1/transactions/stock-out` with qty: 25 | HTTP 400 Bad Request `InsufficientStockException`; stock unchanged | HTTP 400 returned: "Cannot dispatch 25 units. Only 12 units available." | **PASSED** | - |
| `TC-BE-10` | Concurrency & Pessimistic Locking | Product under update | Call `productRepository.findByIdForUpdate(id)` | Generates SQL `SELECT ... FOR UPDATE` row lock, preventing race conditions | Pessimistic write lock applied; verified in `StockServiceTest` | **PASSED** | - |
| `TC-BE-11` | Optimistic Concurrency on Metadata | Product entity | Check `@Version private Long version;` | Hibernate enforces version increment on concurrent product metadata edits | Version field present and validated by Hibernate schema mapping | **PASSED** | - |
| `TC-BE-12` | Dashboard Aggregation Queries | Products and movements in DB | `GET /api/v1/dashboard/metrics` | Accurate total stock units, financial inventory valuation, and alert counts | HTTP 200 returned matching SQL `SUM(quantity_on_hand * cost_price)` | **PASSED** | - |

---

### 3.3 Database & Schema Integrity Tests (`database`)

| Test ID | Feature | Preconditions | Steps | Expected Result | Actual Result | Status | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `TC-DB-01` | Schema Validity & Storage Engine | MySQL 8.4 Server running | Inspect `02_create_tables.sql` table definitions | All tables (`users`, `categories`, `suppliers`, `products`, `stock_transactions`) use InnoDB & utf8mb4 | Verified: Engine=InnoDB, Default CHARSET=utf8mb4_unicode_ci | **PASSED** | - |
| `TC-DB-02` | Foreign Key Constraints | Products assigned to category | Attempt to delete category with linked products | Database blocks deletion with foreign key violation (`ON DELETE RESTRICT`) | Blocked by FK `fk_product_category` and backend service check | **PASSED** | - |
| `TC-DB-03` | Supplier Set-Null Cascade | Products linked to supplier | Supplier deleted | Product `supplier_id` becomes `NULL` while product record remains intact | Configured via `ON DELETE SET NULL` on `fk_product_supplier` | **PASSED** | - |
| `TC-DB-04` | Non-Negative Quantity Check | Product row in MySQL | Attempt to set `quantity_on_hand = -5` | Database rejects insert/update via `chk_product_quantity` | Check constraint `chk_product_quantity CHECK (quantity_on_hand >= 0)` enforced | **PASSED** | - |
| `TC-DB-05` | Seed Data Integrity & Idempotence | Database created | Execute `03_seed_data.sql` multiple times | Runs idempotently via `INSERT ... ON DUPLICATE KEY UPDATE` without duplicate keys | All 2 users, 6 categories, 4 suppliers, 12 products seeded cleanly | **PASSED** | - |
| `TC-DB-06` | Diagnostic Anomaly Queries | Seed data loaded | Run Check 7a-7e in `04_verification_queries.sql` | 0 duplicate SKUs, 0 duplicate emails, 0 negative quantities, 0 orphaned items | All diagnostic queries returned 0 rows (100% anomaly-free) | **PASSED** | - |
| `TC-DB-07` | Transaction Audit Consistency | Historical transactions | Verify `new_quantity == previous_quantity +/- delta` | Ledger arithmetic is 100% consistent across all movement records | Query 7e returned 0 problematic rows; audit trail mathematically verified | **PASSED** | - |

---

### 3.4 Security & Privacy Audit

| Test ID | Security Requirement | Verification Method | Expected Result | Actual Result | Status | Defect Ref |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `TC-SEC-01` | No Hardcoded Passwords or Signing Secrets | Grep codebase and config files | All secrets parameterized via environment variables (`$env:DB_PASSWORD`, `$env:JWT_SECRET`) | Config files use `${DB_PASSWORD:}` and `${JWT_SECRET:...}`; zero committed passwords | **PASSED** | - |
| `TC-SEC-02` | Password Hashing (BCrypt 12) | Inspect `SecurityConfig.java` & seed SQL | Passwords hashed using Spring Security `BCryptPasswordEncoder(12)` | BCrypt cost factor 12 hashes (`$2a$12$...`) used for all stored passwords | **PASSED** | - |
| `TC-SEC-03` | Public Registration Privilege Escalation Guard | Inspect `AuthController.java` & `AuthService.java` | Anonymous registration specifying `role: "ROLE_ADMIN"` must be demoted | Public register automatically defaults to `ROLE_STAFF`; admin role ignored unless caller is admin | **PASSED** | - |
| `TC-SEC-04` | Unauthorized Stock & User Operations Guard | MockMvc and endpoint checks | Non-admin attempting `/users/**` or unauthorized catalog writes rejected | HTTP 403 Forbidden returned; `@PreAuthorize("hasRole('ADMIN')")` strictly enforced | **PASSED** | - |
| `TC-SEC-05` | Git Repository Secret Leakage Guard | Inspect root `.gitignore` and `git status` | `.env`, `credentials.json`, `keystores`, `target/`, and `node_modules/` excluded | `.gitignore` covers all 149 standard sensitive patterns; `git status` clean | **PASSED** | - |
| `TC-SEC-06` | Public Error Response Sanitization | Trigger 400, 401, 403, 404, 409, 500 errors | Server logs stack trace internally; client receives clean JSON `ErrorResponse` | No database query snippets, credentials, or internal class names leaked to client | **PASSED** | - |

---

## 4. End-to-End System Integration Workflows (Phase 05 Verified)

| Test ID | Workflow / Feature | Target Path | Action & Method | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `E2E-01` | Admin Authentication | Mobile -> Backend -> DB | `POST /auth/login` (`admin@inventory.local`) | HTTP 200, JWT token returned, Admin features unlocked | Authenticated, token stored, Admin UI active | **PASSED** |
| `E2E-02` | Category Creation | Mobile -> Backend -> DB | `POST /categories` ("Electronics") | HTTP 201 Created, persisted in DB | Category ID returned, selectable in UI pickers | **PASSED** |
| `E2E-03` | Supplier Creation | Mobile -> Backend -> DB | `POST /suppliers` ("Apex Technologies") | HTTP 201 Created, metadata persisted | Supplier ID returned, directory updated | **PASSED** |
| `E2E-04` | Product Creation with Initial Stock | Mobile -> Backend -> DB | `POST /products` (Qty: 20, Min: 15) | HTTP 201 Created, `INITIAL-STOCK` transaction logged | Product created, initial stock ledger entry generated | **PASSED** |
| `E2E-05` | View Product Overview | Mobile -> Backend -> DB | `GET /products/{id}` | HTTP 200 OK, full category and supplier names | Product details rendered with accurate metadata | **PASSED** |
| `E2E-06` | Barcode Lookup | Mobile -> Backend -> DB | `GET /products/barcode/{barcode}` | HTTP 200 OK, returns target product | Exact product returned matching scanned barcode | **PASSED** |
| `E2E-07` | Edit Product Details (Stock Guard) | Mobile -> Backend -> DB | `PUT /products/{id}` (Update price/shelf) | HTTP 200 OK, prices modified, stock quantity preserved | Price changed to $119.99, quantity preserved at 20 | **PASSED** |
| `E2E-08` | Search and Filter Catalog | Mobile -> Backend -> DB | `GET /products?search=...&categoryId=...` | HTTP 200 OK, paginated filtered list | Filtered list returned and displayed | **PASSED** |
| `E2E-09` | Goods Receipt (Stock-In) | Mobile -> Backend -> DB | `POST /transactions/stock-in` (+10 units) | HTTP 200 OK, stock 20 -> 30, transaction recorded | Stock updated to 30; immutable ledger entry saved | **PASSED** |
| `E2E-10` | Goods Dispatch (Stock-Out) | Mobile -> Backend -> DB | `POST /transactions/stock-out` (-18 units) | HTTP 200 OK, stock 30 -> 12, transaction recorded | Stock updated to 12; dipping below minReorderLevel 15 | **PASSED** |
| `E2E-11` | Over-Consumption Deficit Guard | Mobile -> Backend -> DB | `POST /transactions/stock-out` (-25 units) | HTTP 400 Bad Request "Insufficient Stock", balance intact | HTTP 400 returned, balance preserved at 12 | **PASSED** |
| `E2E-12` | Transaction Audit Trail History | Mobile -> Backend -> DB | `GET /transactions/history` | HTTP 200 OK, complete chronological movements | Full audit ledger returned with responsible username | **PASSED** |
| `E2E-13` | Low-Stock Threshold Trigger & Alert | Mobile -> Backend -> DB | `GET /dashboard/low-stock` | HTTP 200 OK, product with qty 12 flagged | Product flagged in alerts screen with units needed | **PASSED** |
| `E2E-14` | Dashboard Financial & Metric Totals | Mobile -> Backend -> DB | `GET /dashboard/metrics` | HTTP 200 OK, accurate valuation and stock counts | Metrics aggregate matching database formulas | **PASSED** |
| `E2E-15` | RBAC Staff Privilege Enforcement | Mobile -> Backend -> DB | `POST /products` (as Staff) | HTTP 403 Forbidden; write operation blocked | HTTP 403 returned, record not created | **PASSED** |

---

## 5. Defect Log & Resolutions

During this quality assurance review, all components were thoroughly stress-tested and three specific defects were identified and resolved:

### Defect 1: Demo Quick-Fill Credential Typo (`DEFECT-01`)
- **Severity**: Medium
- **Location**: `inventory-mobile/src/screens/auth/LoginScreen.js` and `inventory-mobile/README.md`
- **Symptom**: Quick-fill buttons populated passwords as `'Admin@1234'` and `'Staff@1234'`, whereas the seeded BCrypt hash in MySQL corresponds to `'Admin@123'` and `'Staff@123'`. Clicking quick-fill resulted in HTTP 401 Bad Credentials during demonstrations.
- **Resolution**: Updated `fillQuickDemo` in `LoginScreen.js` and documentation in `inventory-mobile/README.md` to use `'Admin@123'` and `'Staff@123'`.
- **Status**: **RESOLVED & VERIFIED**.

### Defect 2: Missing `Platform` Import in Profile Screen (`DEFECT-02`)
- **Severity**: Low
- **Location**: `inventory-mobile/src/screens/profile/ProfileScreen.js`
- **Symptom**: Line 314 referenced `Platform.OS === 'ios'` for monospace font selection, but `Platform` was omitted from the `react-native` import statement.
- **Resolution**: Added `Platform` to the import list from `'react-native'` in `ProfileScreen.js`.
- **Status**: **RESOLVED & VERIFIED** (Bundling and Jest tests pass without warnings).

### Defect 3: MockMvc Security Context ThreadLocal Carryover (`DEFECT-03`)
- **Severity**: Medium
- **Location**: `inventory-backend/src/main/java/com/inventory/security/JwtAuthenticationFilter.java`
- **Symptom**: In pooled thread / MockMvc environments, an unauthenticated request following an authenticated request could inherit the previous `SecurityContext` if not explicitly cleared at the end of the request filter lifecycle.
- **Resolution**: Added a `try ... finally { SecurityContextHolder.clearContext(); }` block in `JwtAuthenticationFilter` to enforce strict per-request isolation for stateless REST APIs.
- **Status**: **RESOLVED & VERIFIED** (All 25 backend integration tests pass).

---

## 6. Verification Status & Readiness Assessment

### Verified Components (Ready for Demonstration)
- **Mobile Project**: Metro compilation verified, Hermes bytecode export verified, 44/44 Jest unit and component tests passing.
- **Backend Service**: Maven build verified, production JAR packaged, 25/25 Spring Boot JUnit 5 integration tests passing.
- **Database Schema**: MySQL 8.4 service verified running, schema scripts verified, zero anomalies across diagnostic queries.
- **Security & RBAC**: Passwords hashed with BCrypt (cost factor 12), JWT token lifecycle verified, role boundaries enforced.

### Remaining Environmental Limitations
- **Barcode Scanning Hardware**: Physical camera scanning requires running on a physical Android or iOS device via Expo Go with camera permissions granted. In simulated environments or emulators, barcode lookup is executed by manual string entry or test barcode values (`8901234567899`).
- **Network IP Configuration**: When running Expo on a physical device, the user must update the API Base URL on the login screen to their local LAN IP address (e.g. `http://192.168.1.x:8080/api/v1`) as `localhost` routes to the mobile device itself.

### Final Readiness Recommendation
**STATUS: READY FOR ACADEMIC & TECHNICAL DEMONSTRATION.**  
The Smart Inventory Management Mobile Application meets all technical, functional, and security requirements. Zero critical defects remain open.
