-- ==============================================================================
-- Script 01: Create Database & Set Character Encoding
-- Project: Smart Inventory Management Mobile Application
-- Database Target: MySQL 8.0+ / 8.4+
-- Target Database: inventory_management
-- ==============================================================================
-- 
-- INSTRUCTIONS FOR EXECUTION:
-- 1. Using MySQL Workbench:
--    - Connect to your local MySQL instance (localhost:3306).
--    - Open this script file (File -> Open SQL Script).
--    - Click the Execute/Lightning icon or press Ctrl + Shift + Enter.
-- 2. Using MySQL Command Line Client:
--    - Open PowerShell / Command Prompt.
--    - Run: mysql -u root -p < database/sql/01_create_database.sql
-- ==============================================================================

-- Create the database if it does not already exist
-- We use utf8mb4 for comprehensive Unicode support (including multilingual text and symbols)
-- and utf8mb4_unicode_ci for case-insensitive, linguistically accurate collation.
CREATE DATABASE IF NOT EXISTS `inventory_management`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Switch session context to the inventory_management database
USE `inventory_management`;

-- Display session verification
SELECT 
    DATABASE() AS current_database,
    @@character_set_database AS default_charset,
    @@collation_database AS default_collation;
