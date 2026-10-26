# Smart Inventory Management — Comprehensive Setup & Developer Guide

## 1. System Requirements & Prerequisites

To run both the backend REST API and the mobile frontend application on **Windows 10/11**, ensure the following tools are installed:

- **Operating System:** Windows 10 / 11 (64-bit)
- **Java Development Kit:** Java 21 LTS (Oracle JDK or Eclipse Temurin OpenJDK 21)
- **Build Tool:** Apache Maven 3.9.x (Installed at `C:\Users\Nikunj\apache-maven-3.9.9`)
- **Database Engine:** MySQL Server 8.4 (Windows Service `MySQL80` running on port 3306)
- **JavaScript Runtime:** Node.js (v18.x or v20.x LTS) with `npm`
- **Expo Framework:** Expo SDK 51 with `@expo/metro-runtime` and `react-native-web`

---

## 2. Database Setup & Initialization (MySQL 8.4)

### Step 1: Verify MySQL Service
Ensure the MySQL Windows Service is active:
```powershell
Get-Service MySQL80
# If stopped, start it with administrator privileges:
# Start-Service MySQL80
```

### Step 2: Initialize Database Schema & Seed Data
Execute the database scripts in numerical order using MySQL CLI:
```powershell
cd C:\Project\InventoryManagement\database

# 1. Create the database
mysql -u root -p < 01_init_database.sql

# 2. Create tables, constraints, indexes
mysql -u root -p inventory_management < 02_create_tables.sql

# 3. Insert baseline categories, suppliers, products, and default accounts
mysql -u root -p inventory_management < 03_seed_data.sql
```

### Step 3: Configure Local Database Credentials
The application utilizes an isolated, git-ignored profile configuration for local developer machines:
File location: `inventory-backend/src/main/resources/application-local.yml`
```yaml
spring:
  datasource:
    password: ${DB_PASSWORD:your_mysql_password_here}
```
*Note: Never commit your database password to version control.*

---

## 3. Backend REST API Setup & Execution

### Step 1: Run Automated Backend Tests
Verify all 25 JUnit tests pass:
```powershell
cd C:\Project\InventoryManagement\inventory-backend
& "C:\Users\Nikunj\apache-maven-3.9.9\bin\mvn.cmd" test
```

### Step 2: Build Executable JAR
```powershell
cd C:\Project\InventoryManagement\inventory-backend
& "C:\Users\Nikunj\apache-maven-3.9.9\bin\mvn.cmd" clean package -DskipTests
```

### Step 3: Launch the Spring Boot Server
Launch the compiled standalone JAR:
```powershell
cd C:\Project\InventoryManagement\inventory-backend
java -jar target/smart-inventory-backend-1.0.0.jar
```
*Alternatively, run directly with the Spring Boot Maven plugin:*
```powershell
& "C:\Users\Nikunj\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
```

### Step 4: Verify Backend Health
Test the public health endpoint:
```powershell
curl http://localhost:8080/api/v1/health
# Expected Output: {"status":"UP","timestamp":"..."}
```

---

## 4. Mobile Application Setup & Execution

### Step 1: Install Dependencies
```powershell
cd C:\Project\InventoryManagement\inventory-mobile
npm install
```

### Step 2: Run Automated Mobile Tests
Verify all 47 Jest tests pass:
```powershell
cd C:\Project\InventoryManagement\inventory-mobile
npm test -- --watchAll=false
```

### Step 3: Run the Application

#### Option A: Run in Web Browser (Recommended when no emulator/physical phone is available)
The project includes `react-native-web` and `react-dom` configured for seamless browser testing:
```powershell
cd C:\Project\InventoryManagement\inventory-mobile
npx expo start --web
```
Open your browser at:
```
http://localhost:8081
```
*Tip: Press `F12` in Chrome/Edge and click the mobile device toggle (`Ctrl + Shift + M`) to simulate an iPhone or Pixel mobile viewport.*

#### Option B: Run on Android Emulator
If Android Studio and the Android SDK are installed:
```powershell
cd C:\Project\InventoryManagement\inventory-mobile
npx expo start --android
```
*Note: The app automatically detects Android Emulators and routes API calls to `http://10.0.2.2:8080/api/v1`.*

---

## 5. Pre-Seeded Default Accounts

| Role | Username / Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@inventory.local` | `Admin@123` | Full access: Product CRUD, Categories, Suppliers, User Management, Stock Operations, Reports |
| **Inventory Staff** | `staff@inventory.local` | `Staff@123` | Operational access: Stock In, Stock Out, View Catalog, Search, Filter, View Stock History |

---

## 6. Common Troubleshooting

### Error: `Port 8080 was already in use`
A previous background Java or Maven process is holding port 8080.
To terminate it:
```powershell
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Error: `Access denied for user 'root'@'localhost'`
Ensure your MySQL root password matches `src/main/resources/application-local.yml` or export the environment variable in your terminal session before starting:
```powershell
$env:DB_PASSWORD="your_actual_password"
java -jar target/smart-inventory-backend-1.0.0.jar
```
