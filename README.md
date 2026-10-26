# Smart Inventory Management Mobile Application

A full-stack, enterprise-grade mobile inventory management system designed for warehouse operations, retail storehouses, and institutional laboratories. The solution features an Expo React Native mobile client, a Spring Boot 3.3.4 REST API service running on Java 21 LTS, and a MySQL 8.4 transactional database with pessimistic concurrency control and an immutable audit ledger.

---

## 🏛️ Project Architecture & Directory Structure

```
InventoryManagement/
├── inventory-mobile/       # React Native + Expo Mobile Application (SDK 58)
│   ├── assets/             # Mobile branding & adaptive icons
│   ├── src/                # Components, contexts, screens, hooks, API client
│   ├── __tests__/          # 47 Jest unit, filtering, and component tests
│   ├── eas.json            # EAS Build profiles for Android APK and App Bundle
│   └── app.json            # Expo application configuration & package ID
├── inventory-backend/      # Spring Boot 3.3.4 REST API Service (Java 21 LTS)
│   ├── src/main/java/      # 10 core packages (config, controller, dto, entity, etc.)
│   ├── src/main/resources/ # application.yml with parameterized environment configs
│   ├── src/test/java/      # 26 JUnit 5 integration & RBAC test suites
│   └── pom.xml             # Maven dependencies and packaging lifecycle
├── database/               # MySQL 8.4 DDL, DML seed scripts, and verification queries
│   ├── README.md           # Database setup and execution instructions
│   └── sql/                # Idempotent SQL scripts (01 to 04)
├── docs/                   # Complete engineering & academic documentation
│   ├── COLLEGE_REQUIREMENT_AUDIT.md # 20-point College Mini-Project Compliance Audit
│   ├── PROJECT_PROPOSAL.md # Formal academic project proposal & tech justification
│   ├── REQUIREMENTS.md     # Software Requirements Specification (SRS) & User Stories
│   ├── SYSTEM_ARCHITECTURE.md # Multi-tier architecture, sequence flows & diagrams
│   ├── DATABASE_DESIGN.md  # Relational schema definitions, constraints & ER model
│   ├── UI_DESIGN.md        # Screen inventory, navigation hierarchy & design system
│   ├── API_AUDIT.md        # 24-endpoint inventory, RBAC matrix & client mapping
│   ├── SECURITY_REVIEW.md  # Vulnerability audit, pessimistic locks & error masking
│   ├── TEST_CASES.md       # Comprehensive 60-point test cases QA matrix
│   ├── TEST_REPORT.md      # Real test execution totals (26/26 Java, 47/47 Jest)
│   ├── INDIVIDUAL_CONTRIBUTION_TEMPLATE.md # Academic individual grading template
│   ├── SETUP_GUIDE.md      # Detailed developer setup guide for Windows & Expo
│   ├── FINAL_DEMO_GUIDE.md # 10-step live viva demonstration script & questions
│   └── CHANGELOG.md        # Concise summary of all modifications
├── .env.example            # Deployment environment variables template
├── .gitignore              # Multi-stack ignore rules (Java, Node, Expo, Android, secrets)
└── README.md               # Root project documentation (this file)
```

---

## ⚙️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :---: | :--- |
| **Mobile Client** | React Native + Expo | 0.88 / SDK 58 | Cross-platform mobile application with bottom tabs & modals |
| **State & Navigation** | React Navigation + Context API | v7 | Navigation stacks, SecureStore tokens, reactive inventory state |
| **HTTP Client** | Axios | v1.20 | Request/response interceptors, dynamic baseURL, error normalization |
| **Backend API** | Spring Boot | 3.3.4 | REST microservices with Spring Data JPA & Bean Validation |
| **Language & Runtime**| Java (OpenJDK Adoptium) | 21 LTS | Modern LTS Java runtime with Virtual Threads & Records support |
| **Security & Auth** | Spring Security + JJWT | 0.12.6 | Stateless JWT authentication (HMAC-SHA512) & RBAC |
| **Database** | MySQL Server | 8.4 (x64) | InnoDB engine, ACID compliance, pessimistic row-level locking |
| **Build Tools** | Apache Maven & npm | 3.9.9 / 11.19 | Dependency management, packaging, and test runners |
| **Testing** | JUnit 5 + Jest | Latest | Unit testing, MockMvc integration testing, and component tests |

---

## ✨ Key Features

1. **Barcode Scanning**: Scan product barcodes using the mobile camera for immediate catalog retrieval and transaction logging.
2. **Goods Receipt (`Stock-In`)**: Receive supplier shipments with positive inventory increments and atomic ledger entries.
3. **Goods Dispatch (`Stock-Out`)**: Fulfill orders with built-in deficit protection preventing dispatch of more units than available.
4. **Pessimistic Row Locking**: Serializes concurrent stock adjustments on the same product using database-level `SELECT ... FOR UPDATE` locks.
5. **Low-Stock Alerting**: Automatic warning badges and filtered low-stock views for items at or below reorder levels.
6. **Role-Based Access Control**:
   - `ROLE_ADMIN`: Full access (catalog CRUD, category/supplier directories, user administration, financial valuation).
   - `ROLE_STAFF`: Operational access (stock-in, stock-out, catalog search, movement history, low-stock alerts).
7. **Immutable Audit Ledger**: Unalterable historical transaction records capturing timestamp, responsible staff member, delta, and post-movement balance.
8. **Configurable Endpoints**: Easily switch backend endpoints between Android Emulator (`10.0.2.2:8080`), local Wi-Fi LAN IP, or `localhost`.

---

## 📋 Prerequisites

Before running the application, ensure the following are installed on your Windows development workstation:
- **Java**: OpenJDK 21 LTS (`java -version`).
- **Maven**: Apache Maven 3.9+ (`mvn -version`).
- **Node.js**: Node.js 20+ and npm 10+ (`node -v`, `npm -v`).
- **MySQL Server**: MySQL 8.4 Community Server running locally on port 3306 (`Get-Service -Name MySQL*`).
- **Expo Go App**: Installed on your physical Android/iOS phone (from Google Play Store or Apple App Store).

---

## 🚀 Step-by-Step Installation & Setup

### 1. Database Setup (MySQL 8.4)
Verify the MySQL Windows Service is active:
```powershell
Get-Service -Name MySQL*
# If stopped:
Start-Service -Name MySQL80
```

Execute the versioned SQL scripts in order using MySQL CLI or MySQL Workbench:
```powershell
cd C:\Project\InventoryManagement

# Run scripts in dependency order:
Get-Content database/sql/01_create_database.sql | mysql -u root -p
Get-Content database/sql/02_create_tables.sql | mysql -u root -p
Get-Content database/sql/03_seed_data.sql | mysql -u root -p
Get-Content database/sql/04_verification_queries.sql | mysql -u root -p
```

### 2. Launch Spring Boot Backend
In a PowerShell window, set your session database password and launch the service:
```powershell
cd C:\Project\InventoryManagement\inventory-backend

# Set environment variable for your session (never commit passwords to files):
$env:DB_NAME = "inventory_management"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_actual_mysql_password_here"

# Start the Spring Boot application:
& "C:\Users\Nikunj\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
```
*Verification*: Open your browser to `http://localhost:8080/api/v1/health` -> `{"status":"UP"}`.

### 3. Launch Expo Mobile Application
In a separate terminal window:
```powershell
cd C:\Project\InventoryManagement\inventory-mobile
npm start
```
- **Android Emulator**: Press `a` in the terminal. The app connects to `http://10.0.2.2:8080/api/v1` automatically.
- **Physical Mobile Device**: Open the **Expo Go** app on your phone and scan the displayed QR code.
  - On the mobile login screen, tap **Server Settings** and enter your computer's Wi-Fi LAN IP address: `http://192.168.1.x:8080/api/v1`.
- **Web Preview**: Press `w` in the terminal to view in your browser.

---

## 🔑 Pre-Configured Demo Accounts

For evaluation and viva presentations, the login screen includes **Quick Demo Login Chips**:

| Role | Username | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admin@inventory.local` | `Admin@123` | Full access: CRUD products, categories, suppliers, stock ops, user toggles |
| **Warehouse Staff** | `staff` | `staff@inventory.local` | `Staff@123` | Operational access: Stock-in, stock-out, catalog search, low-stock alerts |

---

## 📱 Mobile Device & Emulator API Configuration

| Device Type | Target Address | How to Configure |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:8080/api/v1` | Default configuration; connects automatically to host `localhost:8080`. |
| **Physical Phone (Expo Go)**| `http://192.168.x.x:8080/api/v1` | On Login screen, tap **Server Settings**, type your PC's Wi-Fi IP address, and tap **Save Endpoint**. |
| **Web Preview** | `http://localhost:8080/api/v1` | Runs directly in your browser without proxying. |

*To find your computer's Wi-Fi IP on Windows*: Run `ipconfig` and look for `IPv4 Address` under your active Wi-Fi adapter. Ensure your phone and PC are connected to the same Wi-Fi network.

---

## 📦 Android Build & Packaging Guide

The mobile application is built using Expo's managed workflow. There are two distinct Android artifacts:
1. **Installable APK (`.apk`)**: Standalone binary that can be sideloaded and installed directly on any physical Android device without needing the Expo Go app.
2. **Android App Bundle (`.aab`)**: Publishing package required for Google Play Store submissions.

### How to Build an Installable Android APK using EAS:
1. Ensure `eas.json` is present in `inventory-mobile/` (pre-configured with the `preview` profile):
   ```json
   {
     "build": {
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```
2. Log into your free Expo account:
   ```bash
   npx eas-cli login
   ```
3. Run the cloud APK build:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
4. Once completed, EAS provides a direct download link for the `.apk` file which can be transferred to an Android phone and installed immediately.

*Note: For local classroom demonstrations, running via `npx expo start` with the **Expo Go** app provides instant Live Reload and is the recommended evaluation workflow.*

---

## 🧪 Automated Testing

### Backend Integration Tests (26/26 Passing)
```powershell
cd C:\Project\InventoryManagement\inventory-backend
& "C:\Users\Nikunj\apache-maven-3.9.9\bin\mvn.cmd" test
```
*Covers authentication, password hashing, product CRUD, duplicate SKU rejection, pessimistic locking, stock deficit guard, RBAC role enforcement, dedicated low-stock routing, and complete end-to-end integration workflows.*

### Mobile Client Tests (47/47 Passing)
```powershell
cd C:\Project\InventoryManagement\inventory-mobile
npm test -- --watchAll=false
```
*Covers form validators, input sanitation, real-time search/filter algorithms, SecureStore session persistence, and UI components.*

---

## 🎯 Step-by-Step Viva Demonstration Workflow

To demonstrate the full capabilities of the application to an instructor or examiner, follow this 5-minute workflow:

1. **Login as Administrator**:
   - Tap the **Admin Quick Fill** chip (`admin@inventory.local` / `Admin@123`).
   - Tap **Sign In**. Observe the Dashboard loading live KPIs (Total SKUs, Stock Units, Financial Valuation).
2. **Create Category & Supplier**:
   - Open the **Profile** tab -> tap **Categories Directory** -> tap **+ Add Category** ("Audio Gear").
   - Back to Profile -> tap **Suppliers Directory** -> tap **+ Add Supplier** ("SoundTech Inc").
3. **Add a Product**:
   - Go to the **Catalog** tab -> tap **+ Add Product**.
   - Enter Name ("Wireless Earbuds"), SKU ("EARBUD-WL-01"), Cost (₹300), Selling (₹600), Initial Stock (20), Reorder Level (15).
   - Save and observe the product appear in the catalog with 20 units in stock.
4. **Demonstrate Goods Receipt (`Stock-In`)**:
   - Open the **Dashboard** -> tap **Receive Stock**.
   - Select "Wireless Earbuds", enter quantity `10`, Invoice `PO-1001`.
   - Confirm. Observe stock increment from 20 to 30.
5. **Demonstrate Goods Dispatch (`Stock-Out`) & Threshold Alert**:
   - Tap **Dispatch Stock**. Select "Wireless Earbuds", enter quantity `18`.
   - Confirm. Observe stock reduce to 12.
   - Since 12 is less than the reorder level of 15, notice the **Alerts** tab badge increments! Tap the **Stock Alerts** tab to see the item flagged in amber with "3 units needed".
6. **Demonstrate Deficit Guard (Over-Consumption Prevention)**:
   - Tap **Dispatch Stock** again. Select "Wireless Earbuds", attempt to dispatch `20` units (only 12 available).
   - Confirm. Observe the red error banner: *"Cannot dispatch 20 units. Only 12 units available in stock."* The stock balance remains untouched.
7. **Inspect Audit History**:
   - Open the **Stock Audit** tab. Inspect the complete chronological audit trail showing each movement, timestamps, responsible user, delta, and exact balance transitions.
8. **Demonstrate RBAC Security Enforcement**:
   - Sign out and tap the **Staff Quick Fill** chip (`staff@inventory.local` / `Staff@123`).
   - Sign in as Staff. Notice the **+ Add Product** button is hidden, and User Management is inaccessible.

---

## 🔧 Troubleshooting & Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `Cannot connect to backend server` | Mobile cannot reach backend URL | Ensure Spring Boot is running (`http://localhost:8080/api/v1/health`). On a physical device, set **Server Settings** on the login screen to your PC's Wi-Fi LAN IP (e.g. `http://192.168.1.50:8080/api/v1`). |
| `Access denied for user 'root'@'localhost'` | Incorrect database password | Set `$env:DB_PASSWORD = "your_actual_password"` in PowerShell before starting Spring Boot. |
| `Table 'inventory_management.products' doesn't exist` | Database scripts not executed | Execute `01_create_database.sql`, `02_create_tables.sql`, and `03_seed_data.sql` in MySQL. |
| `Port 8080 already in use` | Another process is holding port 8080 | Run `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force` in PowerShell. |
| `Camera barcode scanning doesn't open` | Running on web preview or emulator | Barcode camera requires physical hardware with Expo Go permissions. On emulators, enter barcodes manually (e.g. `8901234567899`). |

---

## 🔒 Security & Credentials Policy

- **No Secrets in Source Control**: All sensitive database credentials and JWT signing keys are loaded from environment variables (`DB_PASSWORD`, `JWT_SECRET`).
- **Stateless Authentication**: Passwords stored as BCrypt (cost factor 12) hashes. All protected REST APIs require signed Bearer tokens.
- **Stock Movement Integrity**: Stock quantities cannot be directly overwritten via product edits; all updates must pass through atomic `STOCK_IN` or `STOCK_OUT` transactions with pessimistic locking (`PESSIMISTIC_WRITE`).
