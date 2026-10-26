# Mobile User Interface & Interaction Design Specification
# Smart Inventory Management Mobile Application

---

## 1. UI Design Principles & Design System

The application interface is engineered specifically for warehouse mobility, fast visual scanning, and high operational reliability:

- **Clutter-Free Information Density:** Key metrics (stock on hand, location, SKU, profit margins) are organized into structured, high-contrast cards.
- **Unified Design Tokens (`src/theme/`):**
  - **Colors:** Slate primary (`#2563EB`), surface white (`#FFFFFF`), light background (`#F8FAFC`), deep text (`#0F172A`), and semantic pills (Green `#10B981` for in-stock, Amber `#F59E0B` for low-stock, Red `#EF4444` for out-of-stock).
  - **Typography:** Scaled native system font stack with strict hierarchy: `h1` (28px), `h2` (22px), `h3` (18px), `subtitle` (15px), `body` (14px), `caption` (12px), `statNumber` (26px bold).
  - **Elevation:** Multi-tiered drop shadows (`sm`, `md`, `lg`) providing visual depth on cards, action buttons, and modal dialogs.
- **Ergonomics & Touch Hitboxes:** All interactive chips, buttons, and list rows maintain a minimum 44×44px bounding box.
- **Keyboard & Screen Responsiveness:** Uses `SafeAreaView` and `KeyboardAvoidingView` to prevent software keyboards from obscuring inputs.

---

## 2. Navigation Architecture

```mermaid
graph TD
    Root[Root Navigation Stack] --> Auth[Auth Stack (Unauthenticated)]
    Root --> Main[Main Bottom Tab Navigator (Authenticated)]

    subgraph AuthStack ["Authentication Stack"]
        Auth --> Login["LoginScreen"]
        Auth --> Register["RegisterScreen"]
    end

    subgraph AppTabs ["Main Bottom Tab Navigator"]
        Main --> Tab1["DashboardTab"]
        Main --> Tab2["ProductsTab"]
        Main --> Tab3["StockOpsTab"]
        Main --> Tab4["AlertsTab"]
        Main --> Tab5["ProfileTab"]
    end

    subgraph StackScreens ["Detail & Workflow Modals"]
        Tab1 --> LowStockAlerts["LowStockAlertsScreen"]
        Tab1 --> Reports["ReportsScreen"]
        
        Tab2 --> ProductDetail["ProductDetailScreen"]
        Tab2 --> AddProduct["AddProductScreen (Admin Only)"]
        Tab2 --> EditProduct["EditProductScreen (Admin Only)"]
        
        Tab3 --> StockIn["StockInScreen (Goods Receipt)"]
        Tab3 --> StockOut["StockOutScreen (Goods Dispatch)"]
        Tab3 --> StockHistory["StockHistoryScreen (Movement Ledger)"]
        
        Tab5 --> Categories["CategoryListScreen (Admin Only)"]
        Tab5 --> Suppliers["SupplierListScreen (Admin Only)"]
        Tab5 --> UserManagement["UserManagementScreen (Admin Only)"]
    end
```

---

## 3. Screen Inventory & Component Breakdown

### 1. Login Screen (`src/screens/auth/LoginScreen.js`)
- **Visual Branding:** App logo, enterprise typography, and system tagline.
- **Input Controls:** Validated email and password fields with password reveal/obscure toggle.
- **Quick-Fill Demo Helper:** Direct one-tap buttons to pre-populate Admin (`admin@inventory.local`) or Staff (`staff@inventory.local`) credentials.
- **Error Handling:** Inline field errors for invalid emails or passwords; network error banner if server is unreachable.

### 2. Dashboard Screen (`src/screens/dashboard/DashboardScreen.js`)
- **Live Metric Cards:**
  - **Total Inventory Valuation:** Computed from actual cost prices with formatted currency (`$`).
  - **Total Units on Hand:** Aggregate sum of active warehouse inventory.
  - **Low Stock Warning Card:** Dynamic warning card highlighted in amber when items are below reorder threshold.
  - **Managed Catalog Count:** Total active SKUs.
- **Role-Aware Greeting:** Personalized welcome banner reflecting the user's name and security role (`ADMIN` or `STAFF`).
- **Quick Actions Bar:** Direct shortcuts to Goods Receipt, Goods Dispatch, Catalog, and Reports.
- **Recent Movements Log:** Real-time feed of the last 4 stock movements with direction arrows, units, and timestamps.
- **Pull-to-Refresh:** Pulling down triggers an asynchronous reload from the backend API.

### 3. Product Catalog Screen (`src/screens/products/ProductListScreen.js`)
- **Global Search:** Immediate, debounced search across product name, SKU, and barcode.
- **Category Filter Chips:** Horizontal scrolling pill bar to filter by category or view all.
- **Stock Status Chips:** Toggle between `All`, `In Stock`, `Low Stock`, and `Out of Stock`.
- **Multi-Criteria Sorting Modal:**
  - Sort by Product Name (A to Z)
  - Sort by Product Name (Z to A)
  - Sort by Stock Quantity (High to Low)
  - Sort by Stock Quantity (Low to High)
  - Sort by Selling Price (High to Low)
  - Sort by Selling Price (Low to High)
- **Inline Action Shortcuts:** Direct "In" and "Out" transaction buttons on each product card for accelerated floor logging.

### 4. Product Detail Screen (`src/screens/products/ProductDetailScreen.js`)
- **Financial Breakdown:** Calculates real-time estimated profit margins (`(selling - cost) / cost * 100`) and total SKU asset valuation.
- **Stock Health Badge:** Color-coded status badge with on-hand quantity and minimum threshold.
- **Shelf Location Indicator:** Warehouse bin/aisle location tag for floor workers.
- **Item Movement Log:** Embedded transaction audit trail specific to the selected product.
- **Safe Deletion:** Admin-only delete action protected by an explicit confirmation dialog.

### 5. Stock In / Goods Receipt Screen (`src/screens/stock/StockInScreen.js`)
- **Target Item Picker:** Selects product showing current on-hand quantity.
- **Real-Time Balance Preview:** Dynamic calculation: `Current Balance (14) → Adding (+10) → Projected Balance (24)`.
- **Delivery Documentation:** Inputs for supplier invoice numbers and shipment notes.
- **Post-Transaction Dialog:** Instant confirmation with a direct navigation link to movement history.

### 6. Stock Out / Goods Dispatch Screen (`src/screens/stock/StockOutScreen.js`)
- **Over-Consumption Guard:** Validates entered quantity against available on-hand stock and prevents negative inventory.
- **Dispatch Reason Categorization:** Standard dropdown options: Customer Order, Department Requisition, Damaged/Expired Goods, Audit Correction, Sample.
- **Remaining Balance Preview:** Real-time visual indicator of post-dispatch balance.

### 7. Low Stock Alerts Screen (`src/screens/alerts/LowStockAlertsScreen.js`)
- **Deficit Calculation:** Displays exactly how many units are needed to return inventory to safe reorder thresholds.
- **Visual Threshold Bar:** Dynamic progress bar showing current inventory vs minimum reorder level.
- **One-Tap Restock:** Direct shortcut to pre-fill the Goods Receipt screen for the deficient item.

### 8. Stock Movement History (`src/screens/stock/StockHistoryScreen.js`)
- **Movement Type Filter:** Filter tabs for All, Stock In, and Stock Out movements.
- **Ledger Search:** Search transactions by product title, SKU, invoice number, or staff member.
- **Detailed Audit Trail:** Displays exact timestamps, deltas, previous and new balances, and invoice numbers.
