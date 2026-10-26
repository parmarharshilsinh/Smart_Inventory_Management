# System Architecture & Technical Design Specification
# Smart Inventory Management Mobile Application

---

## 1. High-Level Architecture Overview

The system employs a decoupled, multi-tiered client-server architecture composed of a **React Native + Expo mobile application**, a stateless **Spring Boot 3.3.4 REST API microservice**, and an ACID-compliant **MySQL 8.4 transactional database**.

```mermaid
graph TD
    subgraph ClientLayer ["Mobile Client Tier (React Native + Expo)"]
        UI["UI Screens & Components"]
        Ctx["State & Context (AuthContext, InventoryContext)"]
        SecStore["Secure Storage (Expo SecureStore)"]
        Axios["API Client (Axios + Interceptors)"]
        UI --> Ctx
        Ctx --> Axios
        Ctx --> SecStore
    end

    subgraph APILayer ["Backend Application Tier (Spring Boot 3.3.4 / Java 21)"]
        GW["REST API Gateway (Base URL: /api/v1)"]
        SecFilter["Spring Security Filter (JWT Validation & RBAC)"]
        Controllers["REST Controllers (Auth, Product, Stock, Dashboard)"]
        Services["Service Layer (Business Rules & Validations)"]
        Repos["Spring Data JPA Repositories (Pessimistic Locking)"]
        
        GW --> SecFilter
        SecFilter --> Controllers
        Controllers --> Services
        Services --> Repos
    end

    subgraph DBLayer ["Database Tier (MySQL 8.4 InnoDB)"]
        T_Users["users (BCrypt Passwords)"]
        T_Prods["products (Indexed SKU, Barcode, Check Qty >= 0)"]
        T_Cats["categories & suppliers"]
        T_Ledger["stock_transactions (Audit Trail)"]
        
        Repos --> T_Users
        Repos --> T_Prods
        Repos --> T_Cats
        Repos --> T_Ledger
    end

    Axios -- "HTTPS / JSON (Bearer JWT)" --> GW
```

---

## 2. Mobile Client Architecture (`inventory-mobile/`)

The mobile client is engineered with clean separation of concerns across 8 core modules:

```
inventory-mobile/
├── src/
│   ├── api/          # Centralized Axios client and API domain wrappers
│   ├── components/   # Reusable Atomic UI elements (AppButton, AppInput, ProductCard, etc.)
│   ├── constants/    # Environment configurations, demo data, and route keys
│   ├── context/      # Reactive application state (AuthContext, InventoryContext)
│   ├── hooks/        # Custom React hooks (useAuth, useInventory)
│   ├── navigation/   # Stack and BottomTab navigators with role-based routing
│   ├── screens/      # Domain screens (auth, dashboard, products, stock, alerts, profile)
│   ├── theme/        # Centralized design tokens (colors, typography, spacing, shadows)
│   └── utils/        # Formatters, input validators, and storage abstractions
```

### Key Architectural Invariants:
1. **Dynamic Base URL Resolution:** The API client automatically configures itself for Android Emulators (`http://10.0.2.2:8080/api/v1`), physical devices, and web browsers (`http://localhost:8080/api/v1`).
2. **Transparent Token Injection:** An Axios request interceptor pulls the active JWT from hardware-backed storage (`Expo SecureStore`) and sets `Authorization: Bearer <token>` on all outgoing calls.
3. **Graceful Network Degradation:** The response interceptor intercepts 4xx/5xx network failures and normalizes them into structured error objects without exposing raw exception traces to the user.

---

## 3. Backend Architecture (`inventory-backend/`)

The backend is built as an enterprise Spring Boot application adhering to Clean Architecture principles:

```mermaid
graph LR
    Req[Incoming HTTP Request] --> Ctrl[Controller Layer]
    Ctrl --> DTO[DTO Validation jakarta.validation]
    DTO --> Svc[Service Layer Business Logic]
    Svc --> Lock[Row-Level Lock SELECT FOR UPDATE]
    Lock --> Repo[Spring Data JPA Repository]
    Repo --> DB[(MySQL 8.4 Engine)]
    DB --> Entity[JPA Entity]
    Entity --> Mapper[Entity-to-DTO Mapper]
    Mapper --> Resp[HTTP Response 200 OK / 201 Created]
```

### Architectural Highlights:
- **Layered Decoupling:** Controllers only handle HTTP concerns and DTO binding; Services enforce business validation and transactional boundaries; Repositories manage persistence.
- **Pessimistic Concurrency Serialization:** In `StockService`, mutating stock operations acquire exclusive database row locks via `productRepository.findByIdForUpdate(productId)` with `@Transactional(isolation = Isolation.READ_COMMITTED)`. This guarantees zero inventory overdrafts during simultaneous warehouse transactions.
- **Optimistic Locking:** The `Product` entity contains `@Version private Long version`, providing secondary protection against lost updates during catalog metadata edits.

---

## 4. Authentication & Security Flow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Warehouse Staff
    participant Mobile as Mobile App (Expo)
    participant SecStore as Expo SecureStore
    participant AuthCtrl as AuthController
    participant SecFilter as JwtAuthenticationFilter
    participant StockCtrl as StockController
    participant DB as MySQL Database

    Staff->>Mobile: Enters email and password
    Mobile->>AuthCtrl: POST /api/v1/auth/login {email, password}
    AuthCtrl->>DB: Query user by email & verify BCrypt hash
    DB-->>AuthCtrl: User record verified (Role: ROLE_STAFF)
    AuthCtrl-->>Mobile: 200 OK {token: "eyJhbGciOi...", role: "ROLE_STAFF"}
    Mobile->>SecStore: Store JWT in hardware keychain
    Mobile->>Staff: Unlocks operational floor tabs

    Note over Mobile,StockCtrl: Subsequent Protected API Request
    Staff->>Mobile: Submits Goods Receipt (+10 units)
    Mobile->>SecStore: Read stored JWT
    SecStore-->>Mobile: Returns token
    Mobile->>SecFilter: POST /api/v1/transactions/stock-in (Header: Bearer JWT)
    SecFilter->>SecFilter: Verify HMAC-SHA512 signature & expiration
    SecFilter->>StockCtrl: Forward authenticated UserPrincipal
    StockCtrl->>DB: SELECT * FROM products WHERE id=? FOR UPDATE
    DB-->>StockCtrl: Exclusive row lock acquired
    StockCtrl->>DB: UPDATE products SET quantity = quantity + 10
    StockCtrl->>DB: INSERT INTO stock_transactions (audit log)
    DB-->>StockCtrl: Transaction committed
    StockCtrl-->>Mobile: 200 OK {newQuantity: 24, status: "SUCCESS"}
    Mobile->>Staff: Displays confirmation dialog & updates UI balance
```

---

## 5. API Request & Error Masking Architecture

To prevent sensitive information leakage:
1. **Centralized Exception Catching:** `@RestControllerAdvice` in `GlobalExceptionHandler.java` intercepts all thrown runtime exceptions.
2. **Safe Error Normalization:** Internal SQL exceptions or database constraint failures are translated into structured, safe responses:
   ```json
   {
     "status": 400,
     "error": "Insufficient Stock",
     "message": "Cannot dispatch 25 units. Only 14 units available on hand.",
     "path": "/api/v1/transactions/stock-out",
     "timestamp": "2026-10-21T16:20:00Z"
   }
   ```
3. **Redacted Server Logging:** Diagnostic stack traces are recorded exclusively in server-side logs with sensitive credentials (passwords, JWT secrets, authorization tokens) strictly redacted.
