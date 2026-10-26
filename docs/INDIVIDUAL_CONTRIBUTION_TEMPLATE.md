# Academic Mini-Project: Individual Contribution Template
# Smart Inventory Management Mobile Application

> **Note for Students & Evaluators:**  
> This template provides a standardized format for each team member to document their specific responsibilities, architectural contributions, modules implemented, technical hurdles overcome, and verification evidence for final academic evaluation.

---

## Student Contribution Record

### 1. Student Details
- **Student Name:** `[Enter Student Full Name]`
- **University Roll Number / Registration ID:** `[Enter Roll Number]`
- **Academic Degree & Branch:** `B.Tech / B.E. / M.C.A. in Computer Science & Engineering`
- **Semester / Year:** `[Enter Semester / Year]`
- **Academic Mentor / Guide:** `[Enter Project Guide Name]`
- **Assigned Module / Role:** `[e.g. Mobile Frontend Engineer / Backend API Developer / Database Architect / QA Lead]`

---

### 2. Assigned Responsibilities
*Outline the specific modules and components assigned to this team member:*
- [ ] Mobile UI/UX screen design and navigation architecture
- [ ] Centralized design system tokens (`colors.js`, `typography.js`, `spacing.js`)
- [ ] Spring Boot REST API controllers and service implementations
- [ ] Database schema DDL, indexing, check constraints, and seed data scripts
- [ ] Concurrency control, pessimistic row locking (`PESSIMISTIC_WRITE`), and transactions
- [ ] Spring Security, stateless JWT authentication, and RBAC authorization
- [ ] Client-side API integration (Axios, interceptors, error normalizers)
- [ ] Automated testing (JUnit 5 backend tests / Jest mobile tests)
- [ ] Academic report authoring, architecture diagrams, and SRS documentation

---

### 3. Modules Developed & Source Code Files
*List the exact file paths developed or significantly modified by this student:*

| Module / Component | Source File Path | Description of Contribution |
| :--- | :--- | :--- |
| **Example: Mobile Catalog** | `inventory-mobile/src/screens/products/ProductListScreen.js` | Built multi-criteria sorting modal, status filter chips, and search bar |
| **Example: Stock Service** | `inventory-backend/src/main/java/com/inventory/service/StockService.java` | Implemented atomic stock-in/out logic with pessimistic row-level locking |
| **Example: Security Layer** | `inventory-backend/src/main/java/com/inventory/config/SecurityConfig.java` | Configured stateless JWT filters, BCrypt password encoder, and RBAC rules |
| **Example: Database Schema** | `database/sql/02_create_tables.sql` | Created relational DDL with check constraints and foreign keys |
| **Example: Automated Tests** | `inventory-mobile/__tests__/filtering.test.js` | Authored Jest test suites covering search, category, and sorting logic |

---

### 4. Technical Challenges Encountered & Solutions Implemented

#### Challenge 1: `[Title of Problem]`
- **Problem Description:** `[Explain the specific error, race condition, or integration bug encountered]`
- **Root Cause Analysis:** `[Identify why the issue occurred at the code or configuration level]`
- **Solution Implemented:** `[Detail the exact code change, architectural pattern, or configuration applied]`
- **Verification Evidence:** `[Reference the passing test case or verification screenshot]`

#### Challenge 2: `[Title of Problem]`
- **Problem Description:** `[Explain the second challenge]`
- **Root Cause Analysis:** `[Identify root cause]`
- **Solution Implemented:** `[Detail fix]`
- **Verification Evidence:** `[Reference passing test or screenshot]`

---

### 5. Measurable Contributions & Test Verification
- **Automated Tests Authored / Maintained:** `[Number of passing unit/integration tests]`
- **API Endpoints Implemented:** `[List endpoints, e.g., POST /transactions/stock-in]`
- **Mobile Screens Built:** `[List screens, e.g., DashboardScreen, StockInScreen]`
- **Documentation Delivered:** `[List authored sections of project report]`

---

### 6. Student & Evaluator Sign-Off

**Student Declaration:**  
*I hereby declare that the contributions detailed above represent my original individual work for this academic mini-project.*

**Student Signature:** ___________________________ &nbsp;&nbsp;&nbsp;&nbsp; **Date:** _______________

<br>

**Faculty Evaluator Assessment & Marks:**  
- Understanding of Code & Architecture (out of 10): _____  
- Implementation Quality & Originality (out of 10): _____  
- Viva Voce & Demonstration Performance (out of 10): _____  
- **Total Individual Score (out of 30):** _____  

**Evaluator Signature:** ___________________________ &nbsp;&nbsp;&nbsp;&nbsp; **Date:** _______________
