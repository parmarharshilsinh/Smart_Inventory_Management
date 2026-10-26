-- ==============================================================================
-- Script 04: Verification & Diagnostic Queries
-- Project: Smart Inventory Management Mobile Application
-- Target Database: inventory_management
-- Read-Only: Safe execution in all environments
-- ==============================================================================

USE `inventory_management`;

-- ------------------------------------------------------------------------------
-- 1. Verify Table Existence and Structure
-- ------------------------------------------------------------------------------
SELECT 
    table_name AS `Table Name`,
    table_rows AS `Approx Row Count`,
    engine AS `Storage Engine`,
    table_collation AS `Collation`
FROM information_schema.tables
WHERE table_schema = 'inventory_management'
ORDER BY table_name;

-- ------------------------------------------------------------------------------
-- 2. Verify Overall Inventory Metrics & Valuation (Dashboard KPI Alignment)
-- ------------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_products,
    COALESCE(SUM(quantity_on_hand), 0) AS total_stock_units,
    COALESCE(SUM(quantity_on_hand * cost_price), 0.00) AS total_inventory_valuation,
    COALESCE(SUM(quantity_on_hand * selling_price), 0.00) AS total_retail_valuation,
    COUNT(CASE WHEN quantity_on_hand <= min_reorder_level AND quantity_on_hand > 0 THEN 1 END) AS low_stock_alerts_count,
    COUNT(CASE WHEN quantity_on_hand = 0 THEN 1 END) AS out_of_stock_count
FROM `products`
WHERE is_active = TRUE;

-- ------------------------------------------------------------------------------
-- 3. Query Low-Stock Products (At or Below Min Reorder Threshold)
-- ------------------------------------------------------------------------------
SELECT 
    p.id,
    p.sku,
    p.name AS product_name,
    c.name AS category_name,
    p.quantity_on_hand,
    p.min_reorder_level,
    (p.min_reorder_level - p.quantity_on_hand) AS units_needed,
    p.location_shelf,
    COALESCE(s.company_name, 'No Supplier Assigned') AS preferred_supplier
FROM `products` p
JOIN `categories` c ON p.category_id = c.id
LEFT JOIN `suppliers` s ON p.supplier_id = s.id
WHERE p.is_active = TRUE 
  AND p.quantity_on_hand <= p.min_reorder_level
ORDER BY p.quantity_on_hand ASC;

-- ------------------------------------------------------------------------------
-- 4. Query Out-of-Stock Products (Critical Replenishment Required)
-- ------------------------------------------------------------------------------
SELECT 
    p.id,
    p.sku,
    p.name,
    c.name AS category,
    p.cost_price,
    p.selling_price,
    p.min_reorder_level,
    s.company_name AS supplier_name,
    s.phone AS supplier_phone
FROM `products` p
JOIN `categories` c ON p.category_id = c.id
LEFT JOIN `suppliers` s ON p.supplier_id = s.id
WHERE p.is_active = TRUE 
  AND p.quantity_on_hand = 0;

-- ------------------------------------------------------------------------------
-- 5. Category Breakdown & Stock Allocation
-- ------------------------------------------------------------------------------
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(p.id) AS product_count,
    COALESCE(SUM(p.quantity_on_hand), 0) AS total_units,
    COALESCE(SUM(p.quantity_on_hand * p.cost_price), 0.00) AS category_valuation,
    ROUND(
        COALESCE(SUM(p.quantity_on_hand * p.cost_price), 0.00) / 
        NULLIF((SELECT SUM(quantity_on_hand * cost_price) FROM products WHERE is_active = TRUE), 0) * 100, 
        2
    ) AS percentage_of_total_valuation
FROM `categories` c
LEFT JOIN `products` p ON c.id = p.category_id AND p.is_active = TRUE
GROUP BY c.id, c.name
ORDER BY category_valuation DESC;

-- ------------------------------------------------------------------------------
-- 6. Stock Transaction Audit Trail (Joined with Product and Responsible User)
-- ------------------------------------------------------------------------------
SELECT 
    t.id AS transaction_id,
    t.transaction_timestamp,
    t.transaction_type,
    p.sku,
    p.name AS product_name,
    t.quantity AS delta_qty,
    t.previous_quantity AS prev_qty,
    t.new_quantity AS post_qty,
    t.unit_cost,
    t.reference_invoice,
    t.notes,
    u.username AS transacted_by,
    u.role AS user_role
FROM `stock_transactions` t
JOIN `products` p ON t.product_id = p.id
JOIN `users` u ON t.performed_by_user_id = u.id
ORDER BY t.transaction_timestamp DESC;

-- ------------------------------------------------------------------------------
-- 7. Diagnostic Checks: Verify No Anomalies Exist
-- Expected Result: ALL checks should return 0 rows
-- ------------------------------------------------------------------------------

-- Check 7a: Duplicate SKUs (Should be 0)
SELECT sku, COUNT(*) AS occurrences
FROM `products`
GROUP BY sku
HAVING COUNT(*) > 1;

-- Check 7b: Duplicate User Emails (Should be 0)
SELECT email, COUNT(*) AS occurrences
FROM `users`
GROUP BY email
HAVING COUNT(*) > 1;

-- Check 7c: Negative Quantities on Hand (Should be 0)
SELECT id, sku, name, quantity_on_hand
FROM `products`
WHERE quantity_on_hand < 0;

-- Check 7d: Products with Missing / Orphaned Categories (Should be 0)
SELECT p.id, p.sku, p.name, p.category_id
FROM `products` p
LEFT JOIN `categories` c ON p.category_id = c.id
WHERE c.id IS NULL;

-- Check 7e: Transaction Arithmetic Consistency Audit (Should be 0)
-- For STOCK_IN: new_quantity must equal previous_quantity + quantity
-- For STOCK_OUT: new_quantity must equal previous_quantity - quantity
SELECT 
    id AS problematic_transaction_id,
    transaction_type,
    quantity,
    previous_quantity,
    new_quantity,
    CASE 
        WHEN transaction_type = 'STOCK_IN' AND new_quantity != (previous_quantity + quantity) THEN 'STOCK_IN calculation error'
        WHEN transaction_type = 'STOCK_OUT' AND new_quantity != (previous_quantity - quantity) THEN 'STOCK_OUT calculation error'
        ELSE 'OK'
    END AS error_reason
FROM `stock_transactions`
WHERE (transaction_type = 'STOCK_IN' AND new_quantity != (previous_quantity + quantity))
   OR (transaction_type = 'STOCK_OUT' AND new_quantity != (previous_quantity - quantity));
