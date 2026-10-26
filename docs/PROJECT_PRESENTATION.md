# Academic Viva Presentation Slides
## Smart Inventory Management Mobile Application
**Course:** Mobile Application Development & Enterprise Architecture  
**Degree:** Bachelor of Technology in Computer Science & Engineering  
**Academic Year:** 2025–2026

---

## Slide 1: Title & Team Information

### Project Title
**Smart Inventory Management Mobile Application**  
*A Modern Multi-Tier Enterprise Mobile Solution for Real-Time Stock Tracking, Concurrency Control, and Barcode Auditing*

### Academic Details
- **Institution**: [College / University Name]
- **Department**: Department of Computer Science & Engineering
- **Course**: Mobile Application Development (Mini Project)
- **Academic Year**: [Academic Year 2025–2026]

### Project Team
| Student Name | Enrollment / Roll No. | Module / Specialization |
| :--- | :--- | :--- |
| **[Student Name 1]** | `[Enrollment No 1]` | Mobile Client Architecture (React Native & Navigation) |
| **[Student Name 2]** | `[Enrollment No 2]` | Backend Microservices (Spring Boot & JWT Security) |
| **[Student Name 3]** | `[Enrollment No 3]` | Database Engineering & Concurrency Locks (MySQL 8.4) |
| **[Student Name 4]** | `[Enrollment No 4]` | QA Engineering, Test Suites & Technical Documentation |

### Under the Guidance of:
- **Project Guide / Mentor**: [Faculty Guide Name & Designation]

---

## Slide 2: Problem Statement & Motivation

### Real-World Industry Pain Points
1. **Manual Ledger Vulnerabilities**: Paper logbooks and standalone spreadsheets suffer from frequent data transcription errors and lost physical documentation.
2. **Synchronization Latency**: Shop-floor stock movements take hours or days to be transcribed into central desktop accounting records, causing surprise stockouts.
3. **Inventory Discrepancy & Shrinkage**: Unrecorded or unassigned stock movements make auditing impossible.
4. **No Accountability**: Lack of verifiable user identities tied to specific physical inventory movements.
5. **Concurrency Race Conditions**: Simultaneous multi-user dispatches lead to negative physical counts and unfulfillable orders.

### Project Motivation
- Modern smartphones possess high-speed processors and high-resolution cameras.
- Transforming standard mobile devices into **intelligent handheld barcode scanners** brings warehouse-grade inventory control within reach of SMEs, hospitals, and educational storehouses without expensive dedicated hardware.

---

## Slide 3: Project Objectives

1. **Cross-Platform Touch-Optimized Mobile Client**:
   Develop an intuitive, touch-friendly mobile UI using React Native & Expo with responsive layouts, dark/light contrast, and instant feedback.
2. **Stateless Enterprise Security & RBAC**:
   Enforce HMAC-SHA512 JWT Bearer authentication and BCrypt password encryption (work factor 12) separating Administrative and Staff capabilities.
3. **Pessimistic Concurrency & Data Consistency**:
   Employ database-level row locks (`SELECT ... FOR UPDATE`) to serialize concurrent inventory modifications and prevent negative stock balances.
4. **Immutable Transaction Ledger & Audit Trail**:
   Record an append-only audit entry for every single item movement (timestamp, user, delta, pre-balance, and post-balance).
5. **Real-Time Automated Alerting & Valuation**:
   Calculate financial inventory valuation and dynamically flag items falling below minimum reorder thresholds.

---

## Slide 4: Existing System vs. Proposed Solution

| Operational Metric | Existing Systems (Paper / Spreadsheets) | Proposed Smart Mobile Application |
| :--- | :--- | :--- |
| **Data Ingestion** | Manual pencil entry / desktop keyboard | Mobile camera barcode scanning & instant tap workflows |
| **Data Synchronization** | Batched manual entry (Hours/Days delay) | Real-time REST API synchronization across all connected devices |
| **Concurrency Protection**| Zero (Last write silently overwrites) | Database pessimistic write locks (`FOR UPDATE`) preventing race conditions |
| **Negative Stock Risk** | High (Permits negative stock counts) | Blocked at database engine (Check Constraint) and backend deficit guard |
| **Audit Traceability** | Disconnected notes; editable history | Immutable, append-only `stock_transactions` ledger |
| **Access Control** | Anyone with file access can edit formulas | Strict RBAC (`ROLE_ADMIN` vs `ROLE_STAFF`) enforced on backend APIs |
| **Alerting** | Discovered only upon complete stock depletion | Dynamic badges, low-stock filter feeds, and dashboard alerts |

---

## Slide 5: Technology Stack & Architectural Decision Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (Mobile)                      │
│   React Native 0.88 + Expo SDK 58.0 | React Navigation 7 | Axios 1.20   │
│   Hardware Barcode Scanning | SecureStore | Mobile-First Tokens        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Bearer Auth)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       APPLICATION TIER (Backend)                       │
│   Java 21 LTS | Spring Boot 3.3.4 | Spring Security 6.3 | Hibernate 6.5│
│   Pessimistic Locking | Global Exception Handler | Bean Validation     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JDBC / Connection Pool (Port 3306)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       PERSISTENCE TIER (Database)                      │
│   MySQL 8.4 Community Server (InnoDB Engine) | ACID Compliance          │
│   Foreign Key Restrict | Check Constraints | Virtual Generated Columns │
└────────────────────────────────────────────────────────────────────────┘
```

### Why This Stack?
- **Java 21 + Spring Boot 3.3.4**: Industry standard for enterprise REST APIs, rock-solid transactional isolation (`@Transactional`), and high-performance JVM execution.
- **React Native + Expo SDK 58**: Universal cross-platform codebase supporting Android, iOS, and Web preview with hot-reload development efficiency.
- **MySQL 8.4 InnoDB**: True ACID transaction guarantees, row-level write locks (`PESSIMISTIC_WRITE`), and referential integrity.

---

## Slide 6: System Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Warehouse Staff (Mobile)
    participant Client as React Native App (Axios)
    participant Auth as JwtAuthenticationFilter
    participant Controller as TransactionController
    participant Service as StockService
    participant DB as MySQL 8.4 (InnoDB)

    Staff->>Client: Tap "Dispatch Stock" (Qty: 10)
    Client->>Auth: POST /api/v1/transactions/stock-out (Bearer JWT)
    Auth->>Auth: Validate HMAC-SHA512 Signature & Expiry
    Auth->>Controller: Forward Authenticated User Principal
    Controller->>Service: recordStockOut(productId, 10, ref, notes)
    Service->>DB: SELECT * FROM products WHERE id=? FOR UPDATE (Pessimistic Lock)
    Note over Service,DB: Row locked; concurrent transactions wait
    Service->>Service: Check: Available (15) >= Requested (10)
    Service->>DB: UPDATE products SET quantity_on_hand = 5 WHERE id=?
    Service->>DB: INSERT INTO stock_transactions (STOCK_OUT, -10, prev:15, new:5)
    DB-->>Service: Transaction Committed (Lock Released)
    Service-->>Controller: TransactionResponseDTO
    Controller-->>Client: 200 OK (New Quantity: 5)
    Client-->>Staff: Display Green Success Banner & Updated Stock
```

---

## Slide 7: Database Design & Entity Relationships

### Relational Schema (5 Normalized Tables)
- **`users`**: User credentials (`password_hash` BCrypt-12), role (`ROLE_ADMIN`, `ROLE_STAFF`), active flag.
- **`categories`**: Product taxonomy groupings (Electronics, Hardware, Office Supplies).
- **`suppliers`**: Vendor contact information, phone, email, address.
- **`products`**: Master catalog (`sku`, `barcode`, `name`, `cost_price`, `selling_price`, `quantity_on_hand`, `min_reorder_level`, `location_shelf`).
  - *Integrity*: `CHECK (quantity_on_hand >= 0)`.
  - *Foreign Keys*: `category_id -> categories(id) ON DELETE RESTRICT`, `supplier_id -> suppliers(id) ON DELETE RESTRICT`.
- **`stock_transactions`**: Immutable append-only audit trail capturing movement type (`STOCK_IN`, `STOCK_OUT`), delta, pre/post balances, and user ID reference.

---

## Slide 8: Key Functional Modules

### 1. Authentication & Role-Based Access Control (RBAC)
- Stateless authentication issuing 24-hour HMAC-SHA512 JWT Bearer tokens.
- Automatic default of public registrations to `ROLE_STAFF` to prevent privilege escalation.
- Administrative access required for Product creation/editing, Category management, and User management.

### 2. Product Catalog Management & Fast Search
- Multi-field search across product name, SKU, and barcode.
- Category filtering and multi-criteria sorting (A-Z, Z-A, Stock Quantity, Selling Price).
- Hardware barcode camera scanning for instant item resolution.

### 3. Goods Receipt (`Stock-In`) & Dispatch (`Stock-Out`)
- Atomic stock-in with invoice reference logging.
- Stock-out with deficit guard: prevents dispatching more units than currently available on shelf.
- Pessimistic row locking (`SELECT ... FOR UPDATE`) prevents race conditions between simultaneous dispatches.

### 4. Real-Time Low-Stock Warnings & Valuation Analytics
- Real-time calculation of total units, valuation ($), and low-stock count.
- Automatic amber badge alerts when an item dips to or below its minimum reorder point.

---

## Slide 9: Mobile UI/UX Design & Component Hierarchy

- **Design System Tokens**:
  - Curated color palette: Slate Navy `#0F172A`, Primary Indigo `#4F46E5`, Success Emerald `#10B981`, Warning Amber `#F59E0B`, Danger Crimson `#EF4444`.
  - Typography: Modern system font with clear typographic hierarchy.
  - Spacing & Radius: 8-point geometric grid with 12px rounded cards.
- **Core Screen Navigation**:
  - `LoginScreen`: Auth form with Admin & Staff one-tap demo quick-fill buttons and dynamic Server Settings.
  - `DashboardScreen`: 4 KPI metrics cards, quick-action shortcuts, and low-stock summary list.
  - `ProductCatalogScreen`: Search bar, category chips, sort modal, and low-stock indicator pills.
  - `StockInScreen` & `StockOutScreen`: Touch-friendly quantity inputs, live available stock preview, and deficit warnings.
  - `TransactionHistoryScreen`: Chronological audit log with color-coded type pills.
  - `ProfileScreen`: Role indicator, server connection tester, and user administration for Admins.

---

## Slide 10: Screen Walkthrough & Visual Inventory

*Demonstrating actual application flows on device/web:*

1. **Sign-In Flow**:
   - Clean card-based login with email/password validation.
   - Dynamic **Server Settings** card allowing seamless switching between Android Emulator (`10.0.2.2:8080`), Localhost (`localhost:8080`), and LAN Wi-Fi IP (`192.168.x.x`).
2. **Interactive Dashboard**:
   - Total SKUs, total units, overall valuation, and low-stock count rendered from live MySQL database.
3. **Product Catalog & Detail View**:
   - Fast filtering, stock status chips (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`), and barcode lookup.
4. **Goods Dispatch with Error Guard**:
   - Attempting to dispatch 20 units of an item with only 12 available immediately displays:  
     *“Cannot dispatch 20 units. Only 12 units available in stock.”*
5. **Low Stock Alerts Feed**:
   - Real-time list of deficient inventory displaying exact deficit units and quick-restock shortcut.

---

## Slide 11: Backend Architecture & Concurrency Safeguards

### Concurrency Protection via Pessimistic Row Locking
```java
// StockService.java - Concurrency Serialization
@Transactional
public TransactionResponse recordStockOut(StockOutRequest request, Long userId) {
    // Row is locked in MySQL using SELECT ... FOR UPDATE
    Product product = productRepository.findByIdForUpdate(request.getProductId())
        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

    // Business Deficit Guard
    if (product.getQuantityOnHand() < request.getQuantity()) {
        throw new InsufficientStockException(
            "Insufficient stock. Available: " + product.getQuantityOnHand() + 
            ", Requested: " + request.getQuantity()
        );
    }
    
    int previousQty = product.getQuantityOnHand();
    int newQty = previousQty - request.getQuantity();
    product.setQuantityOnHand(newQty);
    productRepository.save(product);

    // Immutable Ledger Entry
    StockTransaction txn = new StockTransaction(
        product, TransactionType.STOCK_OUT, request.getQuantity(),
        previousQty, newQty, request.getReference(), user
    );
    stockTransactionRepository.save(txn);
    return transactionMapper.toDto(txn);
}
```

---

## Slide 12: Testing Strategy & Verification Results

### Summary: 73 / 73 Automated Tests Passing (100% Pass Rate)

```
┌──────────────────────────────────────┬───────┬────────┬────────┬──────────┐
│ Test Suite                           │ Cases │ Passed │ Failed │ Status   │
├──────────────────────────────────────┼───────┼────────┼────────┼──────────┤
│ Backend Integration (JUnit 5 + Spring)│   26  │   26   │    0   │  PASS    │
│ Mobile Unit & Component (Jest)       │   47  │   47   │    0   │  PASS    │
│ End-to-End Operational Workflows     │   15  │   15   │    0   │  PASS    │
│ Security & Concurrency Invariants    │    8  │    8   │    0   │  PASS    │
├──────────────────────────────────────┼───────┼────────┼────────┼──────────┤
│ TOTAL VERIFIED ASSERTIONS            │   73  │   73   │    0   │  100%    │
└──────────────────────────────────────┴───────┴────────┴────────┴──────────┘
```

### Verified Scenarios:
- ✅ Password encryption (BCrypt work factor 12) & JWT signature verification.
- ✅ Pessimistic write lock concurrency serialization under simultaneous requests.
- ✅ Over-consumption deficit guard (`400 Bad Request`).
- ✅ Role enforcement (`403 Forbidden` for non-admin catalog modifications).
- ✅ Unhandled exception masking: zero Java stack traces or secrets exposed to client.

---

## Slide 13: Technical Challenges Encountered & Solutions

| # | Technical Challenge | Root Cause | Engineering Solution Implemented |
| :-: | :--- | :--- | :--- |
| **1** | **Database Connection Authentication Failure** | MySQL service configured with local password while `application.yml` defaulted to empty string. | Implemented parameterized `$env:DB_PASSWORD` configuration and isolated local profile. |
| **2** | **Spring MVC Path Collision** | `GET /products/low-stock` matched `@GetMapping("/{id}")`, triggering `MethodArgumentTypeMismatchException`. | Constrained ID route with regex `/{id:[0-9]+}`, explicitly mapped `/low-stock`, and added dedicated 400/404 exception handlers. |
| **3** | **SecurityContext ThreadLocal Leak** | Connection-pooled MockMvc threads retained authentication across test methods. | Added `try ... finally { SecurityContextHolder.clearContext(); }` inside `JwtAuthenticationFilter`. |
| **4** | **Pagination Response Format Mismatch** | Mobile client expected flat arrays; backend returned Spring `PageResponse<T>`. | Implemented response normalizers in `productApi.js` and `stockApi.js` extracting `data.content`. |
| **5** | **Mobile Environment Cross-Platform Differences** | Unhandled missing `Platform` import caused crash when inspecting OS in Profile settings. | Imported `Platform` from `react-native` and verified compatibility across Web, Android, and iOS. |

---

## Slide 14: Demonstration Script Summary (5-Minute Viva Flow)

1. **Start System**:
   - MySQL 8.4 Server active on port 3306.
   - Spring Boot REST API started (`GET /api/v1/health` -> `200 UP`).
   - Expo Mobile App running (`http://localhost:8081` / Expo Go on mobile).
2. **Authenticate as Admin**:
   - Tap **Admin Quick Fill** (`admin@inventory.local` / `Admin@123`).
   - Observe live dashboard KPI valuation and inventory counts.
3. **Create Product**:
   - Add new SKU: "Ergonomic Desk Mat", Selling: $25.00, Initial Stock: 20, Reorder: 15.
4. **Goods Receipt (`Stock-In`)**:
   - Receive +10 units with invoice reference -> Stock updates to 30.
5. **Goods Dispatch (`Stock-Out`) & Trigger Low Stock Alert**:
   - Dispatch 18 units -> Stock updates to 12.
   - Reorder threshold crossed! Low Stock Alerts badge immediately updates.
6. **Trigger Deficit Guard**:
   - Attempt to dispatch 25 units (only 12 available) -> Rejection alert displayed.
7. **Inspect Audit History & Demonstrate RBAC**:
   - Show immutable ledger entry in Stock History.
   - Log out and log in as Staff -> Observe that administrative create/edit actions are restricted.

---

## Slide 15: Conclusion & Future Scope

### Project Conclusion
- The **Smart Inventory Management Mobile Application** successfully solves the core inefficiencies of manual paper/spreadsheet inventory systems.
- Demonstrates modern enterprise architecture: clean separation of concerns, strict type validation, stateless security, and rock-solid relational concurrency control.
- Delivered with comprehensive test suites (73 automated tests), full documentation, and a ready-to-demonstrate mobile client.

### Future Scope
1. **Offline-First Synchronization**: Local SQLite / WatermelonDB storage with bi-directional delta synchronization when reconnected.
2. **Multi-Warehouse Transfers**: Inter-facility stock tracking with transit ledger states.
3. **Automated Purchase Orders**: Automatic generation and emailing of POs to suppliers when stock dips below reorder points.
4. **Predictive Analytics**: Machine learning models for demand forecasting based on historical seasonal trends.

---

## Slide 16: Q&A and Thank You

### Smart Inventory Management Mobile Application

*Thank you to our Project Guide, Review Committee, and Department Faculty.*

**Open for Questions & Live Demonstration**

```
Repository Root: C:\Project\InventoryManagement
Frontend: React Native + Expo (SDK 58)
Backend : Java 21 LTS + Spring Boot 3.3.4
Database: MySQL 8.4 Server
```
