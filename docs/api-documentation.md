# REST API Specification & Contract
## Smart Inventory Management Mobile Application

---

## 1. Architecture & General Conventions

- **Base URL**: `http://<SERVER_HOST>:8080/api/v1`
- **Default Local Development URL**: `http://localhost:8080/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: HTTP Bearer Token header: `Authorization: Bearer <JWT_TOKEN>`
- **Date/Time Standard**: ISO-8601 (`YYYY-MM-DDTHH:mm:ssZ`)

### Standard HTTP Status Codes

| Status Code | Reason Phrase | Semantic Meaning |
| :--- | :--- | :--- |
| `200 OK` | OK | Successful GET, PUT, or transaction operation |
| `201 Created` | Created | Successful entity creation |
| `204 No Content` | No Content | Successful deletion without payload |
| `400 Bad Request` | Bad Request | Validation errors, insufficient stock, malformed JSON |
| `401 Unauthorized` | Unauthorized | Missing, invalid, or expired authorization token |
| `403 Forbidden` | Forbidden | Authenticated user lacks required role (e.g. Staff accessing Admin route) |
| `404 Not Found` | Not Found | Target resource not found |
| `409 Conflict` | Conflict | Duplicate SKU, username, or email |
| `500 Internal Error` | Internal Server Error | Unexpected server-side failure (internal details hidden) |

### Standard Error Response Format

All error responses from the backend adhere strictly to this JSON format:

```json
{
  "timestamp": "2026-10-21T18:20:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for one or more fields",
  "path": "/api/v1/products",
  "fieldErrors": {
    "sku": "Product SKU cannot be blank",
    "sellingPrice": "Selling price must be greater than or equal to 0"
  }
}
```

---

## 2. System Health

### `GET /health`
- **Role Required**: None (Public)
- **Description**: Verifies backend server availability and database connectivity.
- **Success Response (`200 OK`)**:
```json
{
  "status": "UP",
  "application": "smart-inventory-backend",
  "timestamp": "2026-10-21T18:20:00.123Z"
}
```

---

## 3. Authentication APIs (`/api/v1/auth`)

### 3.1. User Registration
- **HTTP Method**: `POST /auth/register`
- **Role Required**: None (Public)
  - *Security Policy*: New public registrations default to `ROLE_STAFF`. Only authenticated users holding `ROLE_ADMIN` can promote accounts to `ROLE_ADMIN`.
- **Validation Rules**:
  - `username`: 3-50 characters, alphanumeric, required, unique
  - `email`: Valid email format, required, unique
  - `password`: Minimum 6 characters, required
  - `fullName`: Required, 2-100 characters
- **Request JSON**:
```json
{
  "username": "john_doe",
  "email": "john@inventory.local",
  "password": "SecretPassword@123",
  "fullName": "John Doe",
  "role": "ROLE_STAFF"
}
```
- **Success Response (`201 Created`)**:
```json
{
  "id": 5,
  "username": "john_doe",
  "email": "john@inventory.local",
  "fullName": "John Doe",
  "role": "ROLE_STAFF",
  "active": true,
  "createdAt": "2026-10-21T18:20:00Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Field validation error
  - `409 Conflict`: Username or email already registered

### 3.2. User Login
- **HTTP Method**: `POST /auth/login`
- **Role Required**: None (Public)
- **Description**: Authenticates user by username OR email and issues an HMAC-SHA512 JWT token.
- **Request JSON**:
```json
{
  "identifier": "admin@inventory.local",
  "password": "AdminPassword@123"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "admin",
  "email": "admin@inventory.local",
  "fullName": "System Administrator",
  "roles": [
    "ROLE_ADMIN"
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Invalid credentials or deactivated account

### 3.3. Current User Profile
- **HTTP Method**: `GET /auth/me`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Success Response (`200 OK`)**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@inventory.local",
  "fullName": "System Administrator",
  "role": "ROLE_ADMIN",
  "active": true,
  "createdAt": "2026-10-21T10:00:00Z"
}
```

---

## 4. Product APIs (`/api/v1/products`)

### 4.1. List Products (Paginated & Filtered)
- **HTTP Method**: `GET /products`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Query Parameters**:
  - `page` (int, default: 0): Zero-based page index
  - `size` (int, default: 20): Page size
  - `sortBy` (string, default: `id`): Sort column (`name`, `sku`, `sellingPrice`, `quantityOnHand`)
  - `direction` (string, default: `DESC`): `ASC` or `DESC`
  - `search` (string, optional): Matches SKU or product name (case-insensitive)
  - `categoryId` (long, optional): Filter by category
  - `supplierId` (long, optional): Filter by supplier
  - `lowStockOnly` (boolean, optional): Filter for items where `quantityOnHand <= minReorderLevel`
- **Success Response (`200 OK`)**:
```json
{
  "content": [
    {
      "id": 1,
      "sku": "SKU-ELEC-001",
      "barcode": "8901234567890",
      "name": "Wireless Mouse",
      "description": "Ergonomic 2.4GHz mouse",
      "costPrice": 12.50,
      "sellingPrice": 24.99,
      "quantityOnHand": 35,
      "minReorderLevel": 10,
      "locationShelf": "Aisle 3, Shelf B",
      "lowStock": false,
      "outOfStock": false,
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "supplier": {
        "id": 2,
        "name": "LogiTech Supply Co."
      },
      "createdAt": "2026-10-21T10:00:00Z",
      "updatedAt": "2026-10-21T15:30:00Z"
    }
  ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### 4.2. Get Product by ID
- **HTTP Method**: `GET /products/{id}`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Success Response (`200 OK`)**: Full product DTO.
- **Error Response**: `404 Not Found` if product does not exist.

### 4.3. Lookup Product by Barcode
- **HTTP Method**: `GET /products/barcode/{barcode}`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Description**: High-speed lookup endpoint used by the mobile barcode scanner camera.
- **Success Response (`200 OK`)**: Full product DTO matching the barcode.
- **Error Response**: `404 Not Found` if no product is associated with the barcode.

### 4.4. Get Low-Stock Products
- **HTTP Method**: `GET /products/low-stock`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Description**: Retrieves all products whose on-hand quantity is less than or equal to their configured minimum reorder level.
- **Success Response (`200 OK`)**: Array of low-stock product DTOs.
```json
[
  {
    "id": 1,
    "sku": "SKU-ELEC-001",
    "name": "Wireless Mouse",
    "quantityOnHand": 3,
    "minReorderLevel": 10,
    "lowStock": true,
    "outOfStock": false
  }
]
```

### 4.5. Create Product
- **HTTP Method**: `POST /products`
- **Role Required**: `ROLE_ADMIN`
- **Validation Rules**:
  - `name`: Required, non-blank
  - `sku`: Required, unique
  - `costPrice`: Required, `>= 0.00`
  - `sellingPrice`: Required, `>= 0.00`
  - `initialQuantity`: Optional, `>= 0`, default 0
  - `minReorderLevel`: Optional, `>= 0`, default 10
  - `categoryId`: Required, must reference existing Category
  - `supplierId`: Optional, must reference existing Supplier if provided
- **Request JSON**:
```json
{
  "name": "Mechanical Keyboard",
  "sku": "SKU-KEYB-RGB",
  "barcode": "8909876543210",
  "description": "RGB Backlit tactile switches",
  "categoryId": 1,
  "supplierId": 2,
  "costPrice": 45.00,
  "sellingPrice": 89.99,
  "initialQuantity": 20,
  "minReorderLevel": 5,
  "locationShelf": "Aisle 1, Bin 12"
}
```
- **Success Response (`201 Created`)**: Created product DTO.
- **Error Responses**:
  - `400 Bad Request`: Validation failure
  - `403 Forbidden`: User is not an administrator
  - `409 Conflict`: SKU already exists

### 4.6. Update Product
- **HTTP Method**: `PUT /products/{id}`
- **Role Required**: `ROLE_ADMIN`
- **Note**: Product updates explicitly exclude stock quantity override to maintain ledger consistency. Stock adjustments must be recorded through `/transactions`.
- **Request JSON**:
```json
{
  "name": "Mechanical Keyboard v2",
  "barcode": "8909876543210",
  "description": "Updated hot-swappable switches",
  "categoryId": 1,
  "supplierId": 2,
  "costPrice": 42.00,
  "sellingPrice": 84.99,
  "minReorderLevel": 8,
  "locationShelf": "Aisle 1, Bin 14"
}
```
- **Success Response (`200 OK`)**: Updated product DTO.

### 4.7. Delete Product
- **HTTP Method**: `DELETE /products/{id}`
- **Role Required**: `ROLE_ADMIN`
- **Constraint**: Deleting a product that has existing stock transactions is blocked to prevent breaking audit integrity.
- **Success Response (`204 No Content`)**
- **Error Responses**:
  - `400 Bad Request`: Cannot delete product with existing stock transaction history
  - `404 Not Found`: Product not found

---

## 5. Category APIs (`/api/v1/categories`)

### 5.1. List Categories
- **HTTP Method**: `GET /categories`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Success Response (`200 OK`)**: Array of category objects.

### 5.2. Get Category by ID
- **HTTP Method**: `GET /categories/{id}`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`

### 5.3. Create Category
- **HTTP Method**: `POST /categories`
- **Role Required**: `ROLE_ADMIN`
- **Request JSON**:
```json
{
  "name": "Storage Devices",
  "description": "SSDs, HDDs, and USB flash drives"
}
```
- **Success Response (`201 Created`)**

### 5.4. Update Category
- **HTTP Method**: `PUT /categories/{id}`
- **Role Required**: `ROLE_ADMIN`

### 5.5. Delete Category
- **HTTP Method**: `DELETE /categories/{id}`
- **Role Required**: `ROLE_ADMIN`
- **Constraint**: Deletion is blocked if active products reference this category.
- **Success Response (`204 No Content`)**

---

## 6. Supplier APIs (`/api/v1/suppliers`)

### 6.1. List Suppliers
- **HTTP Method**: `GET /suppliers`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`

### 6.2. Create Supplier
- **HTTP Method**: `POST /suppliers`
- **Role Required**: `ROLE_ADMIN`
- **Request JSON**:
```json
{
  "name": "Apex Electronics Ltd.",
  "contactPerson": "Alice Smith",
  "email": "alice@apexelectronics.com",
  "phone": "+1-555-0199",
  "address": "456 Industrial Parkway, Austin, TX"
}
```
- **Success Response (`201 Created`)**

### 6.3. Update Supplier
- **HTTP Method**: `PUT /suppliers/{id}`
- **Role Required**: `ROLE_ADMIN`

### 6.4. Delete Supplier
- **HTTP Method**: `DELETE /suppliers/{id}`
- **Role Required**: `ROLE_ADMIN`
- **Constraint**: Deletion is blocked if active products reference this supplier.

---

## 7. Stock Operations APIs (`/api/v1/transactions`)

All stock mutations execute inside an atomic database transaction using pessimistic write locking (`LockModeType.PESSIMISTIC_WRITE`) on the target product row to prevent race conditions or negative balances under concurrent access.

### 7.1. Stock-In (Receive Inventory)
- **HTTP Method**: `POST /transactions/stock-in`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Validation Rules**:
  - `productId`: Required, must exist
  - `quantity`: Required, positive integer (`>= 1`)
  - `unitCost`: Optional, `>= 0.00`
  - `referenceInvoice`: Optional string (e.g. Purchase Order or Delivery Note)
  - `notes`: Optional memo
- **Request JSON**:
```json
{
  "productId": 1,
  "quantity": 50,
  "unitCost": 12.00,
  "referenceInvoice": "PO-2026-8841",
  "notes": "Received 50 units in good condition"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "id": 101,
  "productId": 1,
  "productName": "Wireless Mouse",
  "productSku": "SKU-ELEC-001",
  "type": "STOCK_IN",
  "quantity": 50,
  "previousQuantity": 35,
  "newQuantity": 85,
  "unitPrice": 12.00,
  "referenceInvoice": "PO-2026-8841",
  "notes": "Received 50 units in good condition",
  "performedBy": "staff",
  "createdAt": "2026-10-21T18:20:00Z"
}
```

### 7.2. Stock-Out (Issue / Dispatch Inventory)
- **HTTP Method**: `POST /transactions/stock-out`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Validation Rules**:
  - `productId`: Required, must exist
  - `quantity`: Required, positive integer (`>= 1`)
  - `quantity` must NOT exceed current `quantityOnHand`
- **Request JSON**:
```json
{
  "productId": 1,
  "quantity": 10,
  "referenceInvoice": "DISP-2026-004",
  "notes": "Dispatched for Store Floor"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "id": 102,
  "productId": 1,
  "productName": "Wireless Mouse",
  "productSku": "SKU-ELEC-001",
  "type": "STOCK_OUT",
  "quantity": 10,
  "previousQuantity": 85,
  "newQuantity": 75,
  "referenceInvoice": "DISP-2026-004",
  "notes": "Dispatched for Store Floor",
  "performedBy": "staff",
  "createdAt": "2026-10-21T18:25:00Z"
}
```
- **Error Response (`400 Bad Request`)**:
```json
{
  "timestamp": "2026-10-21T18:25:00Z",
  "status": 400,
  "error": "Insufficient Stock",
  "message": "Insufficient stock for 'Wireless Mouse'. Available: 5, Requested: 10",
  "path": "/api/v1/transactions/stock-out"
}
```

### 7.3. Stock Transaction Audit History (Filtered)
- **HTTP Method**: `GET /transactions`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Query Parameters**:
  - `page` (int, default: 0)
  - `size` (int, default: 20)
  - `type` (optional): `STOCK_IN`, `STOCK_OUT`, or `ADJUSTMENT`
  - `startDate` (optional, ISO string): Filter from date
  - `endDate` (optional, ISO string): Filter to date
- **Success Response (`200 OK`)**: Paginated array of immutable ledger records.

### 7.4. Product-Specific Transaction History
- **HTTP Method**: `GET /transactions/product/{productId}`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Success Response (`200 OK`)**: Chronological ledger of all movements for the specified product.

---

## 8. Dashboard & Reporting APIs (`/api/v1/dashboard`)

### 8.1. Summary KPIs
- **HTTP Method**: `GET /dashboard/summary`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Aggregation Logic**:
  - `totalProducts`: Total active product count
  - `totalStockUnits`: Cumulative stock across all products (`SUM(quantity_on_hand)`)
  - `inventoryValuation`: Sum of `quantity_on_hand * cost_price`
  - `lowStockCount`: Count where `quantity_on_hand <= min_reorder_level AND quantity_on_hand > 0`
  - `outOfStockCount`: Count where `quantity_on_hand == 0`
- **Success Response (`200 OK`)**:
```json
{
  "totalProducts": 142,
  "totalStockUnits": 3840,
  "inventoryValuation": 48250.00,
  "lowStockCount": 6,
  "outOfStockCount": 2,
  "recentTransactionsToday": 18
}
```

### 8.2. Low-Stock Alerts
- **HTTP Method**: `GET /dashboard/low-stock`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Success Response (`200 OK`)**: List of products requiring replenishment (`quantity_on_hand <= min_reorder_level`).

### 8.3. Category Distribution Analytics
- **HTTP Method**: `GET /dashboard/category-distribution`
- **Role Required**: `ROLE_ADMIN` or `ROLE_STAFF`
- **Success Response (`200 OK`)**:
```json
[
  {
    "categoryId": 1,
    "categoryName": "Electronics",
    "productCount": 45,
    "totalUnits": 1200,
    "totalValuation": 22500.00,
    "percentageOfTotal": 46.63
  },
  {
    "categoryId": 2,
    "categoryName": "Office Supplies",
    "productCount": 97,
    "totalUnits": 2640,
    "totalValuation": 25750.00,
    "percentageOfTotal": 53.37
  }
]
```

---

## 9. Security & Role Permissions Matrix

| API Group | Endpoint | Method | Public | Staff | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **System** | `/health` | GET |  |  |  |
| **Auth** | `/auth/login` | POST |  |  |  |
| | `/auth/register` | POST |  |  |  |
| | `/auth/me` | GET |  |  |  |
| **Products** | `/products` | GET |  |  |  |
| | `/products/{id}` | GET |  |  |  |
| | `/products/barcode/{barcode}` | GET |  |  |  |
| | `/products` | POST |  |  |  |
| | `/products/{id}` | PUT |  |  |  |
| | `/products/{id}` | DELETE |  |  |  |
| **Categories** | `/categories` | GET |  |  |  |
| | `/categories/{id}` | GET |  |  |  |
| | `/categories` | POST |  |  |  |
| | `/categories/{id}` | PUT |  |  |  |
| | `/categories/{id}` | DELETE |  |  |  |
| **Suppliers** | `/suppliers` | GET |  |  |  |
| | `/suppliers/{id}` | GET |  |  |  |
| | `/suppliers` | POST |  |  |  |
| | `/suppliers/{id}` | PUT |  |  |  |
| | `/suppliers/{id}` | DELETE |  |  |  |
| **Stock** | `/transactions/stock-in` | POST |  |  |  |
| | `/transactions/stock-out` | POST |  |  |  |
| | `/transactions` | GET |  |  |  |
| | `/transactions/product/{id}` | GET |  |  |  |
| **Dashboard** | `/dashboard/summary` | GET |  |  |  |
| | `/dashboard/low-stock` | GET |  |  |  |
| | `/dashboard/category-distribution`| GET |  |  |  |
