# Final Viva & Live Demonstration Guide
# Smart Inventory Management Mobile Application

---

## 1. Project Overview & Elevator Pitch

The **Smart Inventory Management Mobile Application** is a full-stack, enterprise-grade inventory system engineered for warehouse storehouses, retail outlets, and university laboratories. It combines a **React Native + Expo mobile client** with a **Java 21 / Spring Boot 3.3.4 REST API microservice** and a **MySQL 8.4 transactional database** equipped with pessimistic row-level locking to prevent race hazards and eliminate manual spreadsheet discrepancies.

---

## 2. Core Viva Talking Points

### A. The Core Problem Solved
- Legacy inventory management relies heavily on manual paper logs or Excel spreadsheets, causing high data entry error rates, delayed visibility of stock levels, lack of user accountability, and frequent stockouts or overstocking.
- This application provides an ergonomic handheld mobile tool that updates physical balances in real time at the storage rack upon every goods receipt and dispatch.

### B. High-Level Architecture
- **Three-Tier Architecture:** Mobile Client (React Native + Expo) $\leftrightarrow$ Backend REST Microservice (Spring Boot 3.3.4 / Java 21) $\leftrightarrow$ Relational Database (MySQL 8.4 Server).
- **Stateless Security:** Signed HMAC-SHA512 JWT tokens with BCrypt password encryption (cost factor 12) and strict server-side Role-Based Access Control (`ROLE_ADMIN` vs `ROLE_STAFF`).
- **Data Integrity & Concurrency:** Pessimistic write locking (`SELECT ... FOR UPDATE` via `@Lock(LockModeType.PESSIMISTIC_WRITE)`) in `StockService.java` guarantees that concurrent dispatches on the same product row cannot create negative inventory or race conditions.

---

## 3. Recommended Live Demonstration Sequence

| Demo Step | Screen / Component | Exact Action to Perform | What Evaluators Will See | Key Technical Concept to Explain |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Login Screen** | Click the **"Admin Demo"** quick-fill button, then click **"Sign In"**. | Fields populate with `admin@inventory.local` / `Admin@123`; app logs in and navigates to Dashboard. | • Client-side email/password validation<br>• BCrypt password authentication<br>• Issuance of stateless JWT token stored in hardware keychain |
| **2** | **Executive Dashboard** | Review the top metric cards, then pull down to trigger pull-to-refresh. | Total Valuation (e.g. `$22,869.50`), Total Units on Hand (e.g. `245`), and Low Stock Alerts render from live API data. | • Dynamic aggregate calculations ($$\sum \text{qty} \times \text{cost}$$)<br>• Role-aware greeting (`ADMIN`)<br>• Asynchronous REST fetching from `/api/v1/dashboard/metrics` |
| **3** | **Product Catalog** | Switch to the **Catalog** tab. Type `"mouse"` into the search bar. | Catalog filters instantly to matching products with no lag. | • Case-insensitive debounced search across name, SKU, and barcode<br>• Responsive `FlatList` rendering |
| **4** | **Multi-Criteria Sorting** | Click the **"Sort"** button; choose **"Selling Price (High to Low)"**. | Products re-order instantly with the highest priced item at the top. | • Client-side sorting modal with 6 distinct criteria (Name A-Z/Z-A, Qty High/Low, Price High/Low) |
| **5** | **Product Detail** | Tap on any product card (e.g., *Logitech MX Master 3S*). | Opens detail view with profit margin percentage, asset valuation, shelf bin location, and transaction history. | • Real-time margin calculation: `((sell - cost) / cost) * 100`<br>• Sub-resource relationship navigation |
| **6** | **Goods Receipt (Stock In)** | Tap **"Stock In"** on the product detail screen. Enter Quantity: `10`, Invoice: `PO-2026-99`, tap **"Record Goods Receipt"**. | Shows real-time balance preview (`Current: 14 → New: 24`); popup dialog confirms addition; new balance updates immediately. | • Atomic transaction execution (`@Transactional`)<br>• Pessimistic row locking (`PESSIMISTIC_WRITE`)<br>• Append-only ledger audit entry inserted |
| **7** | **Goods Dispatch Guard (Stock Out)** | Tap **"Stock Out"**. Enter Quantity: `999` (more than available). | Application displays a clear alert blocking the dispatch: *"Cannot dispatch 999 units. Only 24 units available on hand."* | • Deficit protection invariant<br>• Server-side `InsufficientStockException` handled by `@RestControllerAdvice`<br>• Zero inventory overdrafts |
| **8** | **Low-Stock Intelligence** | Switch to the **Alerts** tab. | Displays items whose stock is at or below minimum reorder level with a deficit progress bar and a **"Restock"** shortcut. | • Dynamic database filter query (`quantity_on_hand <= min_reorder_level`)<br>• One-tap restocking workflow |
| **9** | **Stock Movement History** | Switch to the **History** tab. | Chronological audit trail showing the Goods Receipt movement performed in Step 6 with timestamp, invoice #, and user name. | • Immutable audit ledger preserving accountability<br>• Filter tabs: All, Stock In, Stock Out |
| **10** | **Role-Based Access Control** | Go to Profile, tap **"Sign Out"**, then log in with **"Staff Demo"** (`staff@inventory.local`). | Catalog displays without the "Add New Product" button; admin user management tabs are completely hidden; backend rejects direct calls with `403 Forbidden`. | • Server-side `@PreAuthorize("hasRole('ADMIN')")`<br>• Zero client-side privilege escalation |

---

## 4. Database & API Architecture Explanation for Examiners

### Relational Schema (MySQL 8.4):
1. **`users`:** Stores credentials with BCrypt hashes and assigned role (`ROLE_ADMIN`, `ROLE_STAFF`).
2. **`products`:** Core entity with unique SKU, unique barcode, `CHECK (quantity_on_hand >= 0)`, foreign key to category, and `@Version` optimistic locking.
3. **`stock_transactions`:** Financial ledger recording movement type (`STOCK_IN`, `STOCK_OUT`), delta, prior balance, updated balance, invoice reference, and foreign key to `users`.

### API Implementation (Spring Boot 3.3.4):
- 24 documented REST endpoints across 7 controllers: `AuthController`, `ProductController`, `StockController`, `DashboardController`, `CategoryController`, `SupplierController`, `HealthController`.
- Centralized exception advice in `GlobalExceptionHandler.java` converts errors to standardized `ErrorResponse` objects without leaking Java stack traces or database SQL statements.

---

## 5. Automated Testing Results Summary

- **Backend Automated Tests:** **25 / 25 Passing** (`mvn test` in `inventory-backend`):
  - `AuthServiceTest` (6 tests)
  - `DashboardServiceTest` (2 tests)
  - `EndToEndIntegrationWorkflowTest` (2 tests)
  - `ProductServiceTest` (4 tests)
  - `SecurityAndRbacIntegrationTest` (6 tests)
  - `StockServiceTest` (5 tests)
- **Mobile Automated Tests:** **47 / 47 Passing** (`npm test` in `inventory-mobile` across 5 suites).

---

## 6. Technical Challenges Faced & Solutions

1. **MySQL Root Startup Password Issue:**
   - *Challenge:* `Access denied for user 'root'@'localhost' (using password: NO)`.
   - *Solution:* Isolated workstation credentials into git-ignored `application-local.yml` with active profile switching (`spring.profiles.active: ${SPRING_PROFILES_ACTIVE:local}`) and documented environment variables via `.env.example`.
2. **Stock Concurrency & Negative Balances:**
   - *Challenge:* Preventing race conditions when multiple warehouse personnel dispatch units from the same SKU simultaneously.
   - *Solution:* Implemented `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`) in `ProductRepository` and strict RDBMS check constraints (`CHECK quantity_on_hand >= 0`).
3. **Evaluator Browser Accessibility:**
   - *Challenge:* Evaluators lacking Android emulators or physical testing devices.
   - *Solution:* Configured `react-native-web`, `react-dom`, and `@expo/metro-runtime` allowing the entire mobile client to run interactively in any desktop or mobile browser at `http://localhost:8081`.

---

## 7. Future Enhancements & Scope
1. **Offline Ledger Sync:** Local SQLite / WatermelonDB caching with automatic conflict resolution upon network reconnect.
2. **Predictive Demand Forecasting:** Machine learning models (e.g. ARIMA / Prophet) analyzing historical stock movements to forecast seasonal replenishment requirements.
3. **Push Notifications:** Integration with Firebase Cloud Messaging (FCM) or Expo Push Notifications for immediate low-stock threshold triggers.
