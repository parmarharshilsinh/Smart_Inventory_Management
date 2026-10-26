# Software Requirements Specification (SRS)
# Smart Inventory Management Mobile Application

---

## 1. Introduction & Purpose
This document specifies the software requirements for the **Smart Inventory Management Mobile Application**, an enterprise mobile and backend system designed for real-time warehouse stock tracking, goods receipt/dispatch, automated low-stock warnings, and transaction auditing.

---

## 2. User Roles & Personas

### Role 1: System Administrator (`ROLE_ADMIN`)
- **Profile:** Inventory Supervisor / General Manager.
- **Responsibilities:**
  - Create, update, and delete product catalog items.
  - Configure purchase cost prices, retail selling prices, and reorder thresholds.
  - Maintain supplier directory and category classifications.
  - Manage user accounts and toggle active/inactive staff statuses.
  - Analyze overall inventory valuation and categorical financial breakdowns.

### Role 2: Inventory Staff Member (`ROLE_STAFF`)
- **Profile:** Warehouse Worker / Floor Storekeeper.
- **Responsibilities:**
  - Perform instant SKU, barcode, and product name searches.
  - Record goods receipts (`Stock In`) against supplier invoices.
  - Record goods dispatches (`Stock Out`) for order fulfillments or requisitions.
  - View real-time stock balances and storage rack locations.
  - Inspect the low-stock alert feed and track transaction movement history.

---

## 3. User Stories & Use Cases

| User Story ID | As a... | I want to... | So that I can... |
| :--- | :--- | :--- | :--- |
| **US-01** | Staff / Admin | Log in with my registered email and secure password | Access the system based on my authorized security role |
| **US-02** | Staff Member | Search for a product by name, SKU, or barcode | Quickly determine its shelf location and current physical stock |
| **US-03** | Staff Member | Record a Goods Receipt (`Stock In`) with quantity and invoice # | Increment inventory immediately when a delivery truck arrives |
| **US-04** | Staff Member | Record a Goods Dispatch (`Stock Out`) with reason notes | Decrement inventory accurately while preventing accidental over-dispatch |
| **US-05** | Administrator | Create a new product with category and pricing | Expand the warehouse catalog with unique SKU tracking |
| **US-06** | Administrator | Edit product pricing and location shelves | Update warehouse bin locations without modifying stock counts |
| **US-07** | Administrator | Delete an obsolete product with confirmation | Keep the catalog clean while preventing deletion of items with audit history |
| **US-08** | Supervisor | View the Low Stock Alerts feed | Proactively reorder depleted goods before stockouts disrupt operations |
| **US-09** | Store Manager | View total inventory valuation on the Dashboard | Monitor company working capital tied up in physical inventory |
| **US-10** | Administrator | Toggle user account active status | Revoke system access for former employees immediately |

---

## 4. Functional Requirements (FR)

### Module 1: Authentication & Authorization
- **FR-01 (Stateless Authentication):** The system shall authenticate users via `POST /api/v1/auth/login`, returning an HMAC-SHA512 signed JWT token valid for 24 hours.
- **FR-02 (Password Hashing):** Passwords shall be encrypted with BCrypt (cost factor 12). Plaintext passwords must never be stored in the database or returned in API responses.
- **FR-03 (Server-Side RBAC):** Administrative endpoints (`/users/**`, `POST/PUT/DELETE /products/**`, `/categories/**`, `/suppliers/**`) shall enforce `@PreAuthorize("hasRole('ADMIN')")`, returning HTTP 403 Forbidden for unauthorized requests.
- **FR-04 (Safe Public Registration):** Unauthenticated registrations via `POST /api/v1/auth/register` shall strictly assign `ROLE_STAFF`, preventing unauthorized administrative privilege escalation.

### Module 2: Product & Catalog Management
- **FR-05 (Product Entity Attributes):** The system shall maintain product records with: ID, SKU (unique), Barcode (unique), Name, Description, Category ID, Supplier ID, Cost Price, Selling Price, Quantity on Hand, Min Reorder Level, Location Shelf, and Active Status.
- **FR-06 (Duplicate SKU Prevention):** Creation of duplicate SKUs or barcodes shall be rejected with HTTP 409 Conflict.
- **FR-07 (Metadata Immutability):** Updating product metadata via `PUT /api/v1/products/{id}` shall NOT modify physical stock quantities. Stock quantities must only change through verified ledger movements.
- **FR-08 (Orphan Prevention & Cascading Rules):** Deleting products linked to foreign key references shall be handled transactionally to prevent orphaned relational records.

### Module 3: Stock Transactions & Concurrency
- **FR-09 (Atomic Goods Receipt - Stock In):** The system shall record incoming stock with positive quantity increments and append an immutable `STOCK_IN` record to the audit ledger in a single transaction.
- **FR-10 (Deficit-Guarded Dispatch - Stock Out):** The system shall deduct dispatched quantities from inventory. If requested quantity exceeds available stock, the operation shall fail with HTTP 400 Bad Request (`Insufficient Stock`), leaving balance intact.
- **FR-11 (Pessimistic Concurrency Locking):** Stock updates shall acquire a database row-level exclusive lock (`PESSIMISTIC_WRITE` / `SELECT ... FOR UPDATE`), preventing concurrent race hazards.
- **FR-12 (Movement History Audit Trail):** The system shall record an append-only log storing timestamp, responsible user, delta quantity, previous balance, new balance, invoice number, and notes for every movement.

### Module 4: Low-Stock Intelligence & Dashboard Analytics
- **FR-13 (Low-Stock Detection):** Products where `quantity_on_hand <= min_reorder_level` shall automatically populate the low-stock feed with calculated restock deficits.
- **FR-14 (Real-Time KPI Calculations):** The dashboard shall compute total SKU count, total units on hand, total inventory asset valuation ($$\sum \text{quantity} \times \text{cost\_price}$$), and recent stock movements.

---

## 5. Non-Functional Requirements (NFR)

| NFR Category | Metric / Specification | Verification Mechanism |
| :--- | :--- | :--- |
| **Response Time** | API response time under 300ms for catalog queries and under 500ms for transactions. | Monitored via Spring Boot execution logs and MockMvc integration tests. |
| **ACID Integrity** | All stock modifications run within database transaction boundaries with `READ COMMITTED` isolation. | Verified via `StockServiceTest` and `EndToEndIntegrationWorkflowTest`. |
| **Security & Masking**| Zero exposure of Java stack traces, database schema details, or raw SQL queries in API responses. | Handled centrally via `GlobalExceptionHandler` and verified by unit tests. |
| **Credential Storage** | Authentication tokens stored in hardware-backed `Expo SecureStore` (Android KeyStore / iOS Keychain). | Verified via `apiClient.test.js` and storage abstraction layer. |
| **Cross-Platform** | Operates on Android smartphones (API 26+) and standard web browsers via `react-native-web`. | Verified on Chrome, Edge, and Android emulators. |
| **Test Coverage** | 100% automated test passing rate on both client (47 Jest tests) and server (25 JUnit tests). | Verified via `mvn test` and `npm test`. |

---

## 6. System Environment Requirements
- **Server:** Java 21 LTS, Spring Boot 3.3.4, Apache Maven 3.9.x.
- **Database:** MySQL Server 8.4 Community Edition (InnoDB engine, port 3306).
- **Client Runtime:** Node.js v18+/v20+, Expo SDK 51, `@expo/metro-runtime`.
