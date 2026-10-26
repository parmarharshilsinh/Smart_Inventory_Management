-- ==============================================================================
-- Script 02: Create Tables, Constraints, Keys and Indexes
-- Project: Smart Inventory Management Mobile Application
-- Target Database: inventory_management
-- Engine: InnoDB (ACID compliant with row-level locking)
-- ==============================================================================

USE `inventory_management`;

-- ------------------------------------------------------------------------------
-- 1. Table: users
-- Description: Stores authenticated administrative and staff accounts.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'ROLE_STAFF',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `active` BOOLEAN GENERATED ALWAYS AS (`is_active`) VIRTUAL,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    CONSTRAINT `chk_user_role` CHECK (`role` IN ('ROLE_ADMIN', 'ROLE_STAFF')),
    CONSTRAINT `chk_password_not_empty` CHECK (CHAR_LENGTH(`password_hash`) >= 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Table: categories
-- Description: Product categorization tree for organization and reporting.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Table: suppliers
-- Description: Vendors and distributors supplying inventory stock.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `company_name` VARCHAR(150) NOT NULL,
    `name` VARCHAR(150) GENERATED ALWAYS AS (`company_name`) VIRTUAL,
    `contact_person` VARCHAR(100) NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(30) NULL,
    `address` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Table: products
-- Description: Inventory catalog items with SKU, pricing, barcodes, and stock levels.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sku` VARCHAR(50) NOT NULL UNIQUE,
    `barcode` VARCHAR(100) NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `category_id` BIGINT NOT NULL,
    `supplier_id` BIGINT NULL,
    `cost_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `selling_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    `quantity_on_hand` INT NOT NULL DEFAULT 0,
    `quantity` INT GENERATED ALWAYS AS (`quantity_on_hand`) VIRTUAL,
    `min_reorder_level` INT NOT NULL DEFAULT 10,
    `min_stock_level` INT GENERATED ALWAYS AS (`min_reorder_level`) VIRTUAL,
    `location_shelf` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `version` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    -- Foreign Key Constraints (Preserves history: RESTRICT deletion if child exists)
    CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) 
        REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `fk_product_supplier` FOREIGN KEY (`supplier_id`) 
        REFERENCES `suppliers` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,

    -- Business Rule Integrity Constraints
    CONSTRAINT `chk_product_cost_price` CHECK (`cost_price` >= 0),
    CONSTRAINT `chk_product_selling_price` CHECK (`selling_price` >= 0),
    CONSTRAINT `chk_product_quantity` CHECK (`quantity_on_hand` >= 0),
    CONSTRAINT `chk_product_min_reorder` CHECK (`min_reorder_level` >= 0),

    -- Performance Indexes for search, barcode scanning and joins
    INDEX `idx_product_sku` (`sku`),
    INDEX `idx_product_barcode` (`barcode`),
    INDEX `idx_product_category` (`category_id`),
    INDEX `idx_product_supplier` (`supplier_id`),
    INDEX `idx_product_name` (`name`),
    INDEX `idx_product_low_stock` (`quantity_on_hand`, `min_reorder_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Table: stock_transactions
-- Description: Immutable audit ledger recording all Stock-In, Stock-Out, and adjustments.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_transactions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT NOT NULL,
    `transaction_type` VARCHAR(20) NOT NULL,
    `quantity` INT NOT NULL,
    `previous_quantity` INT NOT NULL,
    `new_quantity` INT NOT NULL,
    `unit_cost` DECIMAL(10,2) NULL,
    `reference_invoice` VARCHAR(100) NULL,
    `reason` VARCHAR(100) GENERATED ALWAYS AS (`reference_invoice`) VIRTUAL,
    `notes` TEXT NULL,
    `note` TEXT GENERATED ALWAYS AS (`notes`) VIRTUAL,
    `performed_by_user_id` BIGINT NOT NULL,
    `created_by` BIGINT GENERATED ALWAYS AS (`performed_by_user_id`) VIRTUAL,
    `transaction_timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `created_at` DATETIME(6) GENERATED ALWAYS AS (`transaction_timestamp`) VIRTUAL,

    -- Foreign Key Constraints (RESTRICT ensures historical records are never orphaned)
    CONSTRAINT `fk_transaction_product` FOREIGN KEY (`product_id`) 
        REFERENCES `products` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `fk_transaction_user` FOREIGN KEY (`performed_by_user_id`) 
        REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,

    -- Business Rule Integrity Constraints
    CONSTRAINT `chk_transaction_type` CHECK (`transaction_type` IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT')),
    CONSTRAINT `chk_transaction_quantity` CHECK (`quantity` > 0),
    CONSTRAINT `chk_transaction_prev_qty` CHECK (`previous_quantity` >= 0),
    CONSTRAINT `chk_transaction_new_qty` CHECK (`new_quantity` >= 0),

    -- Performance Indexes for product lookup, user audit and date filtering
    INDEX `idx_trx_product` (`product_id`),
    INDEX `idx_trx_user` (`performed_by_user_id`),
    INDEX `idx_trx_timestamp` (`transaction_timestamp`),
    INDEX `idx_trx_created_at` (`product_id`, `transaction_timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
