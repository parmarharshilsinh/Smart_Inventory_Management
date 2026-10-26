# Academic Mini-Project Proposal
# Smart Inventory Management Mobile Application

---

## 1. Project Title
**Smart Inventory Management Mobile Application**

---

## 2. Problem Statement
In small-to-medium enterprises (SMEs), university laboratories, local healthcare centers, and retail storehouses, inventory tracking is predominantly conducted using manual paper forms or spreadsheets (e.g., Microsoft Excel). These legacy methodologies suffer from critical operational inefficiencies:

1. **High Transcription & Miscounting Errors:** Manual data entry results in frequent SKU recording errors, inaccurate unit counts, and undetected shrinkage.
2. **Delayed Stock Visibility:** Physical stock counts recorded on shop floors are only entered into desktop systems hours or days later, causing stockouts or accidental overstocking that ties up operating capital.
3. **Lack of Handheld Floor Mobility:** Storekeepers and floor personnel lack a dedicated, handheld mobile solution to perform goods receipts and dispatches directly at the storage rack.
4. **Absence of Accountability & Audit Trails:** Spreadsheets do not maintain an immutable, tamper-resistant history recording which specific staff member changed stock balances, when it occurred, or the reference invoice number.

---

## 3. Project Objectives
The objective of this mini-project is to engineer, deploy, and validate a full-stack, enterprise-grade mobile inventory management system that achieves:

- **Instant Handheld Stock Synchronization:** Deliver real-time synchronization between mobile floor devices and the central database for every goods receipt (`Stock In`) and dispatch (`Stock Out`).
- **Barcode & SKU Lookup:** Enable rapid product identification using camera barcode scanning and instant indexed database queries (<300ms).
- **Proactive Low-Stock Alerting:** Automatically monitor inventory levels against dynamic reorder thresholds and notify managers of impending stockouts.
- **Robust Role-Based Access Control (RBAC):** Differentiate storekeeper operational permissions (`ROLE_STAFF`) from administrative catalog and user governance permissions (`ROLE_ADMIN`).
- **Immutable Transaction Audit Ledger:** Maintain an append-only transaction history logging the timestamp, responsible user, delta quantity, previous balance, new balance, and invoice numbers for every movement.
- **Real-Time Financial Valuation:** Compute aggregate inventory asset valuations ($$\sum \text{quantity} \times \text{cost\_price}$$) and categorical distributions on demand.

---

## 4. Target Users
1. **Storekeepers & Warehouse Staff:** Scan items, verify on-hand balances, receive incoming shipments, and fulfill outbound dispatches directly on mobile devices.
2. **Inventory Managers & Administrators:** Oversee product catalog metadata, configure cost/selling prices, define reorder thresholds, manage staff credentials, and analyze valuation reports.
3. **Academic Evaluators & Project Reviewers:** Assess architecture, data consistency, security protocols, API contracts, and automated testing rigor.

---

## 5. Proposed Features
- **User Authentication & Session Security:** Stateless HMAC-SHA512 JWT authentication with BCrypt password hashing (cost factor 12) and automatic session cleanup on logout.
- **Product Catalog Management:** Full CRUD operations for products with SKU, barcode, category, supplier, purchase cost, retail price, minimum reorder level, and shelf location.
- **Multi-Criteria Search & Filtering:** Instant searching across product title, SKU, and barcode; category filter chips; stock status filter chips (In Stock, Low Stock, Out of Stock); and multi-attribute sorting (Name A-Z/Z-A, Quantity High-Low/Low-High, Price High-Low/Low-High).
- **Atomic Goods Receipt (Stock In):** Live balance preview, vendor invoice documentation, and serialized database row-level locking.
- **Deficit-Guarded Goods Dispatch (Stock Out):** Over-consumption prevention blocking orders exceeding available physical stock, reason categorization, and atomic quantity deduction.
- **Low-Stock Intelligence:** Dedicated alerts feed highlighting items below reorder points with deficit calculation and one-tap restock shortcuts.
- **Interactive Executive Dashboard:** Real-time KPI summary cards, role-aware welcome greeting, quick-action shortcuts, and pull-to-refresh data reloading.

---

## 6. Technology Stack & Justification

| Technology | Layer | Justification for Selection |
| :--- | :--- | :--- |
| **React Native (Expo SDK 51)** | Mobile Frontend | Enables rapid cross-platform development (Android, iOS, and Web) with a unified JavaScript codebase, native hardware performance, and hardware-backed credential storage via `Expo SecureStore`. |
| **React Native Web** | Web Emulation | Allows examiners and evaluators without Android devices or emulators to review the full mobile application in standard web browsers (`http://localhost:8081`). |
| **Java 21 LTS** | Backend Runtime | Industry-standard enterprise programming language providing strict type safety, high throughput, and long-term stability for critical business microservices. |
| **Spring Boot 3.3.4** | REST API Framework | Provides production-ready REST controllers, declarative transactions (`@Transactional`), bean validation (`jakarta.validation`), and centralized exception advice (`@RestControllerAdvice`). |
| **Spring Security & JJWT 0.12.6** | Security & Auth | Delivers robust stateless token validation, HMAC-SHA512 cryptographic signing, role-based route filtering, and BCrypt password encryption. |
| **MySQL 8.4 Server (InnoDB)** | Relational Database | Mature ACID-compliant relational database engine supporting foreign key constraints, indexes on SKUs/barcodes, check constraints for non-negative balances, and row-level pessimistic locking (`PESSIMISTIC_WRITE`). |
| **Apache Maven 3.9.x** | Build Automation | Standardized build lifecycle management, dependency management, and automated test execution. |
| **Jest & JUnit 5** | Quality Assurance | Comprehensive unit and integration test frameworks verifying business invariants on both client (47 Jest tests) and server (25 JUnit tests). |

---

## 7. Expected Outcomes
1. A fully functioning, responsive mobile inventory management application operating on Android and web viewports.
2. A hardened, production-grade Spring Boot 3.3.4 backend exposing 24 verified REST endpoints.
3. Zero data inconsistency or negative stock quantities under concurrent transaction scenarios.
4. Complete automated test suites with 100% passing rate (25 backend + 47 mobile tests).
5. Comprehensive academic documentation including architecture diagrams, database ER models, API audits, test execution matrices, and demonstration guides.
