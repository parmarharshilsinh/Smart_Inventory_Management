# Database Configuration & Setup Guide
## Smart Inventory Management Mobile Application

---

## 1. Prerequisites

- **MySQL Server**: Version 8.0+ or 8.4 LTS running locally on port `3306`.
- **MySQL Client Tools**:
  - **MySQL Workbench 8.0 / 8.4** (Recommended GUI), OR
  - **MySQL Command Line Client (`mysql.exe`)**.
- **User Permissions**: A MySQL user account (such as `root` or a dedicated application user) with `CREATE`, `ALTER`, `INDEX`, `INSERT`, `UPDATE`, `DELETE`, and `SELECT` privileges.

---

## 2. Directory Structure & Script Execution Order

All database scripts are located under `database/sql/` and **must be executed in sequence**:

```
database/
├── README.md
└── sql/
    ├── 01_create_database.sql       # 1. Creates `inventory_management` DB with utf8mb4 encoding
    ├── 02_create_tables.sql         # 2. Creates users, categories, suppliers, products, stock_transactions
    ├── 03_seed_data.sql             # 3. Inserts initial categories, suppliers, products, and demo accounts
    └── 04_verification_queries.sql  # 4. Diagnostic & verification queries for KPIs and integrity
```

---

## 3. How to Execute Using MySQL Workbench

1. **Launch MySQL Workbench**:
   - Open MySQL Workbench from your Windows Start Menu or Desktop.
2. **Open a Connection**:
   - Click on your local MySQL connection (usually labeled `Local instance MySQL80` at `localhost:3306`).
   - Enter your MySQL password when prompted.
3. **Execute the SQL Scripts in Order**:
   - Click **File** -> **Open SQL Script...** (or press `Ctrl + Shift + O`).
   - Navigate to `C:\Project\InventoryManagement\database\sql\`.
   - Open and execute each script one by one:
     1. Open `01_create_database.sql` -> Click the **Execute (Lightning icon)** or press `Ctrl + Shift + Enter`.
     2. Open `02_create_tables.sql` -> Execute.
     3. Open `03_seed_data.sql` -> Execute.
     4. Open `04_verification_queries.sql` -> Execute and observe the result grids.
4. **Refresh Schemas**:
   - In the left sidebar under **Schemas**, right-click and select **Refresh All** to see `inventory_management` with all 5 tables.

---

## 4. How to Execute Using MySQL CLI (PowerShell / Command Prompt)

Open a PowerShell terminal and navigate to the project directory:

```powershell
cd C:\Project\InventoryManagement

# Step 1: Create Database
Get-Content database/sql/01_create_database.sql | mysql -u root -p

# Step 2: Create Tables & Constraints
Get-Content database/sql/02_create_tables.sql | mysql -u root -p

# Step 3: Insert Seed Data
Get-Content database/sql/03_seed_data.sql | mysql -u root -p

# Step 4: Run Verification Queries
Get-Content database/sql/04_verification_queries.sql | mysql -u root -p
```

*(You will be prompted to enter your MySQL root password for each execution).*

---

## 5. Backend Connection Configuration

The Spring Boot backend (`inventory-backend`) is configured to connect to MySQL using environment variables with development fallbacks.

In `inventory-backend/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:inventory_management}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}
```

### Setting Environment Variables in Windows PowerShell:
```powershell
# Set for current terminal session:
$env:DB_NAME = "inventory_management"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "YourActualPasswordHere"

# Run Spring Boot backend:
cd C:\Project\InventoryManagement\inventory-backend
& "C:\Users\Nikunj\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
```

> [!IMPORTANT]
> **No Credentials in Git**: Never place raw database passwords in SQL scripts or commit files with plaintext credentials. Use environment variables or `.env` files (which are ignored by `.gitignore`).

---

## 6. Pre-Configured Demo Accounts (From `03_seed_data.sql`)

| Username | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `admin@inventory.local` | `Admin@123` | `ROLE_ADMIN` | Full administrative privileges (create products, manage users) |
| `staff` | `staff@inventory.local` | `Staff@123` | `ROLE_STAFF` | Operational privileges (stock-in, stock-out, catalog viewing) |

*Both passwords are encrypted using BCrypt work factor 12 in the seed script.*

---

## 7. Common MySQL Connection & Permission Errors

### Error 1045 (28000): Access denied for user 'root'@'localhost'
- **Cause**: Incorrect password supplied for the user.
- **Resolution**:
  - Re-type the password configured during MySQL installation.
  - If forgotten, reset the root password using MySQL's safe mode (`--init-file`).

### Error 2003 (HY000): Can't connect to MySQL server on 'localhost:3306'
- **Cause**: The `MySQL80` service is stopped.
- **Resolution**:
  - Check service status in PowerShell: `Get-Service -Name MySQL80`
  - Start the service: `Start-Service -Name MySQL80`

### Error: Public Key Retrieval is not allowed
- **Cause**: Modern MySQL 8 caching_sha2_password authentication requires explicit public key retrieval over non-SSL connections.
- **Resolution**: Ensure connection URL includes `allowPublicKeyRetrieval=true&useSSL=false` (already configured in `application.yml`).

---

## 8. Resetting a Disposable Development Database (Safe Procedure)

> [!CAUTION]
> Dropping the database will permanently delete all records. Only execute this in an isolated development environment!

If you need to completely recreate the development database:

```sql
-- DANGER: Irreversible in production!
DROP DATABASE IF EXISTS `inventory_management`;
```

After dropping, re-run scripts `01`, `02`, and `03` in order to restore a fresh schema with initial seed data.
