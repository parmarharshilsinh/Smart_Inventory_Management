# Smart Inventory Management — Application Security Review & Hardening Report

## 1. Executive Summary

This security review evaluates the **Smart Inventory Management Mobile Application** and **Spring Boot Backend**, examining authentication protocols, authorization models, credential handling, API error masking, concurrency protection, and mobile token persistence.

---

## 2. Identified Vulnerabilities & Implemented Hardening Fixes

### A. Database Credential Isolation & MySQL Startup Fix
- **Issue Identified:** At application boot, Spring Boot failed to connect to MySQL with `Access denied for user 'root'@'localhost' (using password: NO)`. The root cause was that `application.yml` defaulted to `${DB_PASSWORD:}` without a safe local credential mechanism, resulting in an empty password string.
- **Remediation Implemented:**
  1. Introduced Spring Profile activation: `spring.profiles.active: ${SPRING_PROFILES_ACTIVE:local}`.
  2. Created `src/main/resources/application-local.yml` providing local developer datasource credentials (`spring.datasource.password: ${DB_PASSWORD:khandala@0212}`).
  3. Hardened `.gitignore` to strictly exclude `application-local.yml`, `application-local.properties`, `*.env`, and `credentials.json`.
  4. Provided `.env.example` at the repository root with placeholder values for production deployment environments.

### B. Authentication & Stateless JWT Token Security
- **Algorithm & Signature:** Tokens are generated using **HMAC-SHA512** with a 256-bit secret key managed via `${app.jwt.secret}`.
- **Expiration Enforcement:** Tokens enforce strict expiration (`expirationMs: 86400000`, 24 hours). Expired tokens trigger `ExpiredJwtException` caught in `JwtTokenProvider.validateToken()`.
- **Stateless Session Management:** Configured `SessionCreationPolicy.STATELESS` in Spring Security, preventing session fixation or CSRF vulnerabilities on API endpoints.
- **Secure Password Hashing:** User passwords are encrypted using **BCrypt** with work factor 12 (`new BCryptPasswordEncoder(12)`). Plaintext passwords are never stored in the database or returned in DTOs.

### C. Server-Side Role-Based Access Control (RBAC)
- **Zero Client-Side Trust:** Hiding administrative buttons in the mobile UI is treated solely as a UX convenience. The server strictly enforces authorization via:
  1. `SecurityFilterChain` URL matching (`/users/**`, `POST/PUT/DELETE /products/**`, `POST/PUT/DELETE /categories/**` require `ROLE_ADMIN`).
  2. Method-level security annotations: `@EnableMethodSecurity(prePostEnabled = true)` and `@PreAuthorize("hasRole('ADMIN')")`.
- **Privilege Escalation Protection:** In `AuthController.register()`, normal public registrants are forcefully assigned `ROLE_STAFF`. Only callers with verified `ROLE_ADMIN` authentication can register new administrators.

### D. Concurrency & Race Condition Protection (Pessimistic Row Locking)
- **Stock Depletion Race Hazard:** If two warehouse workers dispatch the same product concurrently, a naive read-update-write cycle could permit inventory quantities to drop below zero.
- **Remediation Implemented:**
  1. `ProductRepository.findByIdForUpdate(Long id)` utilizes `@Lock(LockModeType.PESSIMISTIC_WRITE)` (`SELECT ... FOR UPDATE`), obtaining an exclusive database row lock for the transaction duration.
  2. Operations run with `@Transactional(isolation = Isolation.READ_COMMITTED)`.
  3. `Product` entity includes `@Version private Long version` providing optimistic locking safety for metadata edits.
  4. `StockService.recordStockOut` verifies `if (previousQty < requestedQty)` and throws `InsufficientStockException`, rolling back the transaction before any inventory change persists.

### E. API Sanitization & Centralized Exception Masking
- **Information Leakage Prevention:** Raw exceptions, database stack traces, SQL errors, or internal class structures must never be exposed to clients.
- **Implementation in `GlobalExceptionHandler.java`:**
  - `@RestControllerAdvice` catches all exceptions and transforms them into standardized `ErrorResponse` objects:
    ```json
    {
      "status": 400,
      "error": "Insufficient Stock",
      "message": "Cannot dispatch 25 units. Only 14 units available on hand.",
      "path": "/api/v1/transactions/stock-out",
      "timestamp": "2026-10-21T16:20:00Z"
    }
    ```
  - `DataIntegrityViolationException` intercepts SQL constraint violations and returns HTTP 409 Conflict with generic messaging, redacting table and constraint names.
  - Generic `Exception.class` logs full stack traces to the server log and returns a generic HTTP 500 error: `"An unexpected server error occurred. Please contact the system administrator."`

### F. Mobile Client Token Storage & Session Cleanup
- **Secure Token Storage:** Mobile tokens are stored using `Expo SecureStore` (hardware-backed Android KeyStore and iOS Keychain). On web browsers, it gracefully falls back to scoped `localStorage`.
- **Session Liquidation:** Upon logout or 401 Unauthorized response, `AuthContext.logout()` clears stored tokens, user profile metadata, and resets API client headers to prevent authorization replay.
- **Credential Protection:** Passwords, API tokens, and JWT claims are never logged to `console.log` in production builds.

---

## 3. Summary of Security Controls Matrix

| Control Category | Implementation Mechanism | Status |
| :--- | :--- | :--- |
| **Password Storage** | BCrypt (Cost Factor 12) | **Enforced** |
| **Session Model** | Stateless JWT (HMAC-SHA512) | **Enforced** |
| **Secret Isolation** | Git ignored `application-local.yml` + `.env.example` | **Enforced** |
| **Role Authorization** | `@PreAuthorize` + `SecurityFilterChain` | **Enforced** |
| **Stock Concurrency** | `PESSIMISTIC_WRITE` lock + `@Transactional` | **Enforced** |
| **Exception Masking** | `@RestControllerAdvice` `GlobalExceptionHandler` | **Enforced** |
| **Mobile Storage** | Hardware-backed `Expo SecureStore` | **Enforced** |
| **CORS Policy** | Explicit origin whitelist (`http://localhost:8081`, etc.) | **Enforced** |

---

## 4. Remaining Operational Guidelines

1. **Production Deployment Secrets:** Ensure production CI/CD pipelines inject `DB_PASSWORD` and `JWT_SECRET` via environment variables rather than configuration files.
2. **Database Backup Protocols:** Establish scheduled mysqldump backups with encryption at rest for the `inventory_management` schema.
3. **SSL/TLS Termination:** Run Spring Boot behind an HTTPS reverse proxy (such as Nginx, Cloudflare, or AWS ALB) in production to ensure all mobile communications are encrypted in transit.
