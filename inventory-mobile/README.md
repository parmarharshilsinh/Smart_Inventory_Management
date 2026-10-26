# Smart Inventory Management — Mobile Application

Cross-platform mobile application built with **React Native**, **Expo SDK 58**, **React Navigation**, and **Axios**, designed for real-time warehouse inventory tracking, goods receipt/dispatch, and stock alerting.

---

## 📱 Features

- **Role-Based Access Control**:
  - **Administrator**: Full catalog CRUD, supplier/category configuration, stock audits, user management, and financial valuation reports.
  - **Staff Member**: Instant stock intake (`STOCK_IN`), goods dispatch (`STOCK_OUT`), catalog lookup, and low-stock alerts.
- **Stock Movement Integrity**:
  - Independent, dedicated forms for Stock In and Stock Out.
  - Strict validation preventing negative stock, non-integer inputs, and dispatching more than available inventory.
  - Real-time stock balance simulation and historical audit trail.
- **Dynamic Catalog**:
  - Search by product name, SKU, or barcode.
  - Category filter chips and urgent low-stock filter toggles.
  - Duplicate SKU detection.
- **Enterprise Security**:
  - Secure token storage using **Expo SecureStore** (with automatic test-environment fallback).
  - No passwords or secrets stored in plain storage.
- **Dual Runtime Architecture**:
  - **Standalone Demo (Mock Mode)**: Self-contained development preview with isolated mock data.
  - **Live Spring Boot Mode**: Connects directly via Axios to the Spring Boot REST API (`/api/v1`).
  - Configurable backend host IP changeable right from the Profile screen.

---

## 🛠️ Project Structure

```
inventory-mobile/
├── assets/                  # App icons, splash screens, and images
├── src/
│   ├── api/                 # Axios client, interceptors, and modular endpoints
│   │   ├── client.js        # Base Axios instance, token interceptor & error normalizer
│   │   ├── authApi.js       # Authentication & user API
│   │   ├── productApi.js    # Catalog management API
│   │   ├── categoryApi.js   # Category management API
│   │   ├── supplierApi.js   # Supplier directory API
│   │   ├── stockApi.js      # Stock movements & transaction history API
│   │   └── reportApi.js     # Analytics & valuation API
│   ├── components/          # Reusable UI components
│   │   ├── AppButton.js     # Multi-variant button with loading & disabled states
│   │   ├── AppInput.js      # Text input with labels, icons, and error handling
│   │   ├── LoadingView.js   # Full-screen and inline loading indicators
│   │   ├── EmptyState.js    # Illustrated empty list placeholders
│   │   ├── ErrorMessage.js  # Alert banners with retry action
│   │   ├── ProductCard.js   # Stock badge, pricing, and quick in/out buttons
│   │   └── ConfirmDialog.js # Modal confirmation for destructive operations
│   ├── navigation/
│   │   ├── RootNavigator.js # Auth state gate & session bootstrap
│   │   ├── AuthNavigator.js # Login and staff registration stack
│   │   └── MainNavigator.js # Bottom tab + modal stack navigator
│   ├── screens/
│   │   ├── auth/            # LoginScreen, RegisterScreen
│   │   ├── dashboard/       # DashboardScreen (KPIs, quick actions, alerts preview)
│   │   ├── products/        # ProductListScreen, ProductDetailScreen, AddProduct, EditProduct
│   │   ├── categories/      # CategoryListScreen
│   │   ├── suppliers/       # SupplierListScreen
│   │   ├── stock/           # StockInScreen, StockOutScreen, StockHistoryScreen
│   │   ├── alerts/          # LowStockAlertsScreen (with instant restock)
│   │   ├── reports/         # ReportsScreen (financial valuation & margins)
│   │   └── profile/         # ProfileScreen, UserManagementScreen
│   ├── context/
│   │   ├── AuthContext.js   # Authentication, SecureStore token persistence, RBAC
│   │   └── InventoryContext.js # Centralized state for catalog & stock movements
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useInventory.js
│   ├── constants/
│   │   ├── config.js        # Configurable API endpoints and timeouts
│   │   └── mockData.js      # Isolated seed data for offline preview
│   ├── theme/               # Colors, typography, spacing, shadows
│   └── utils/
│       ├── storage.js       # Expo SecureStore wrapper with memory fallback
│       ├── validators.js    # Comprehensive form validation & stock limit checks
│       └── formatters.js    # Currency, date, and stock status badges
├── __tests__/               # Jest unit and component test suites
├── App.js                   # Application root with context providers
├── app.json                 # Expo configuration
└── package.json             # Dependencies and test runner scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher (v24.x tested).
- **npm**: v10 or higher.
- **Expo Go App** (Optional, on your physical Android or iPhone) or Android Studio emulator.

### 2. Installation
Navigate into the `inventory-mobile` folder and install dependencies:
```powershell
cd C:\Project\InventoryManagement\inventory-mobile
npm install
```

### 3. Running the App
Start the Expo Metro development server:
```powershell
npx expo start
```
- **On a Physical Android/iOS Device**: Open the **Expo Go** application and scan the terminal QR code. Ensure your computer and smartphone are on the same Wi-Fi network.
- **On Android Emulator**: Press `a` in the terminal to launch on a running Android emulator.
- **On Web Browser**: Press `w` in the terminal or run `npx expo start --web`.

---

## 🌐 Connecting to Spring Boot Backend

The backend IP can be customized directly within the app on the **My Profile** screen under **System & Network Configuration**:

| Device Type | Target Address |
| :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:8080/api/v1` (Default) |
| **Physical Phone (Expo Go)** | `http://<YOUR_COMPUTER_LAN_IP>:8080/api/v1` (e.g. `http://192.168.1.50:8080/api/v1`) |
| **Local Web Preview** | `http://localhost:8080/api/v1` |

---

## 🧪 Running Automated Tests

Run the full suite of unit and component tests:
```powershell
npm test
```

### Included Test Suites:
1. `validators.test.js`: Required field checks, price validation, quantity limits, stock-in validation, stock-out limits, and duplicate SKU detection.
2. `filtering.test.js`: Search by name/SKU/barcode, category filtering, low-stock threshold queries, and empty list states.
3. `apiClient.test.js`: Axios base URL persistence, HTTP 400/401/403/404/500 error normalization, and network offline handling.
4. `authNavigation.test.js`: Role access control (`ROLE_ADMIN` vs `ROLE_STAFF`), SecureStore token persistence, and logout cleanup.
5. `components.test.js`: `AppButton` states, `AppInput` typing, `ProductCard` badge rendering, and `EmptyState` actions.

---

## 🔑 Demo Presentation Credentials

For quick evaluation during project presentations, the Login screen provides **Quick Login Chips**:

- **Admin Account**:
  - Email: `admin@inventory.local`
  - Password: `Admin@123`
  - Permissions: Full Catalog Management, Reports, User Administration.
- **Staff Account**:
  - Email: `staff@inventory.local`
  - Password: `Staff@123`
  - Permissions: View Catalog, Goods Receipt (`Stock In`), Goods Dispatch (`Stock Out`), Movement History.
