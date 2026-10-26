# Changelog — Smart Inventory Management Mobile Application

All notable modifications, enhancements, bug fixes, and security hardening applied to the project are documented in this file.

---

## [1.1.0] — Production Hardening, UI/UX Overhaul & Security Audit (Current)

### Fixed & Resolved
- **MySQL Startup & Datasource Password Failure:**
  - Resolved `Access denied for user 'root'@'localhost' (using password: NO)`.
  - Removed default empty password fallback from `application.yml`.
  - Introduced active Spring profile switching (`${SPRING_PROFILES_ACTIVE:local}`).
  - Created developer-scoped configuration `src/main/resources/application-local.yml` strictly protected by `.gitignore`.
  - Added `.env.example` at repository root with environment variable documentation.
- **Database Schema & Relational Setup:**
  - Executed `01_init_database.sql`, `02_create_tables.sql`, and `03_seed_data.sql` on MySQL 8.4 Community Server.
  - Verified 5 core relational tables: `users`, `categories`, `suppliers`, `products`, `stock_transactions`.
- **Port Collision & Service Management:**
  - Standardized background process management to prevent Tomcat Port 8080 conflicts during backend restarts.

### Added & Enhanced
- **Centralized UI/UX Design System:**
  - Refined theme tokens in `inventory-mobile/src/theme/` (`colors.js`, `typography.js`, `spacing.js`).
  - Implemented high-contrast, accessible business color palette with dedicated status pills for stock states.
- **Product Management & Multi-Criteria Sorting:**
  - Enhanced `ProductListScreen.js` with dynamic sorting modal:
    - Product Name (A to Z)
    - Product Name (Z to A)
    - Stock Quantity (High to Low)
    - Stock Quantity (Low to High)
    - Selling Price (High to Low)
    - Selling Price (Low to High)
  - Added stock status chips (`All`, `In Stock`, `Low Stock`, `Out of Stock`) alongside category pills.
  - Added direct inline "In" and "Out" transaction buttons on `ProductCard.js`.
- **Stock Movement Controls:**
  - Added dynamic real-time balance calculations to `StockInScreen.js` and `StockOutScreen.js`.
  - Enforced client-side and server-side validation against over-consumption and negative stock balances.
- **Low Stock Intelligence:**
  - Enhanced `LowStockAlertsScreen.js` with deficit quantity calculations and visual progress indicators.
- **Web Browser Accessibility:**
  - Configured `react-native-web`, `react-dom`, and `@expo/metro-runtime` enabling the entire application to be reviewed in any desktop or mobile browser at `http://localhost:8081`.

### Security Hardening
- **Stateless HMAC-SHA512 JWT Authentication:** Expiration validation and cryptographic signing.
- **Server-Side Role-Based Access Control:** `@PreAuthorize("hasRole('ADMIN')")` enforced on all mutating catalog, category, supplier, and user operations.
- **Pessimistic Concurrency Locking:** Applied `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`) in `StockService` to eliminate race hazards during simultaneous stock transactions.
- **Optimistic Locking:** Embedded `@Version private Long version` in `Product` entity.
- **API Exception Masking:** Centralized `@RestControllerAdvice` in `GlobalExceptionHandler` returning sanitized `ErrorResponse` payloads without leaking database schema, stack traces, or raw queries.
- **Secure Mobile Token Persistence:** Integrated `Expo SecureStore` (KeyStore / Keychain) with automatic token purging upon user logout.

### Test Automation
- **Backend Tests:** 25 / 25 Passing (JUnit 5 + Spring Boot Test).
- **Mobile Tests:** Expanded to 47 / 47 Passing (Jest + React Native Testing Library across 5 test suites).

### Documentation Deliverables & Academic Compliance
- Created `docs/PROJECT_PROPOSAL.md` — Formal academic project proposal, problem statement, objectives, and tech justification.
- Created `docs/REQUIREMENTS.md` — Complete SRS with 14 functional requirements, 6 NFRs, and 10 user stories.
- Created `docs/SYSTEM_ARCHITECTURE.md` — Multi-tiered architecture, sequence flow, and Mermaid diagrams.
- Created `docs/DATABASE_DESIGN.md` — Relational schema data dictionary, check constraints, and ER model.
- Created `docs/UI_DESIGN.md` — Screen inventory, navigation flow, and interaction design.
- Created `docs/API_AUDIT.md` — Endpoint inventory, RBAC matrix, and client mapping.
- Created `docs/SECURITY_REVIEW.md` — Concurrency protection, JWT signing, and error masking.
- Created `docs/TEST_CASES.md` — Comprehensive 59-point test cases matrix adhering to QA standards.
- Created `docs/TEST_REPORT.md` — Verification logs (25 backend + 47 mobile automated tests).
- Created `docs/INDIVIDUAL_CONTRIBUTION_TEMPLATE.md` — Standardized individual evaluation template for students and faculty.
- Created `docs/SETUP_GUIDE.md` — Step-by-step developer setup and execution guide for Windows.
- Created `docs/FINAL_DEMO_GUIDE.md` — 10-step viva examination script and presentation guide.
- Created `docs/COLLEGE_REQUIREMENT_AUDIT.md` — 20-point requirements compliance audit (95% PASS, 5% PARTIAL).
- Created `docs/CHANGELOG.md` — Modification history and release notes.

---

## [1.0.0] — Initial Baseline
- Baseline React Native + Expo mobile application and Spring Boot 3.3.4 REST API.
