-- ==============================================================================
-- Script 03: Seed Realistic Inventory Sample Data
-- Project: Smart Inventory Management Mobile Application
-- Target Database: inventory_management
-- Safe Execution: Uses INSERT IGNORE / ON DUPLICATE KEY UPDATE for idempotent reruns.
-- ==============================================================================

USE `inventory_management`;

-- ------------------------------------------------------------------------------
-- 1. Seed Demo Users
-- Passwords:
--   admin@inventory.local / admin -> Admin@123
--   staff@inventory.local / staff -> Staff@123
-- Both hashed with Spring Security BCrypt (work factor 12).
-- ------------------------------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `role`, `is_active`)
VALUES
    (1, 'admin', 'admin@inventory.local', '$2a$12$EKLtZWDybiy1qlD7/2j1bObB8/0/3mznFu6N0OW9IGn7Ia6uRgimC', 'System Administrator', 'ROLE_ADMIN', TRUE),
    (2, 'staff', 'staff@inventory.local', '$2a$12$XloqiZPQESnSCHiwCjdEmOffqxogDQV.XifI4wek00qPDaUfekvfS', 'Warehouse Staff', 'ROLE_STAFF', TRUE)
ON DUPLICATE KEY UPDATE
    `password_hash` = VALUES(`password_hash`),
    `full_name`     = VALUES(`full_name`),
    `role`          = VALUES(`role`),
    `is_active`     = VALUES(`is_active`);

-- ------------------------------------------------------------------------------
-- 2. Seed Categories (10 Realistic Categories)
-- ------------------------------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `description`, `is_active`)
VALUES
    (1, 'Electronics', 'Consumer electronics, audio equipment, adapters and power units', TRUE),
    (2, 'Computer Accessories', 'Keyboards, mice, webcams, USB hubs, and storage drives', TRUE),
    (3, 'Office Supplies', 'Copier paper, desktop organizers, staplers, and calculators', TRUE),
    (4, 'Stationery', 'Ball pens, gel pens, ruled notebooks, sticky notes, and markers', TRUE),
    (5, 'Furniture', 'Ergonomic chairs, computer desks, filing cabinets, and display racks', TRUE),
    (6, 'Mobile Accessories', 'Cables, high-speed adapters, mounts, cases, and mobile storage', TRUE),
    (7, 'Home Appliances', 'Electric kettles, irons, water purifiers, and mixer grinders', TRUE),
    (8, 'Grocery and Pantry', 'Basmati rice, premium tea, coffee, sugar, and cooking oils', TRUE),
    (9, 'Cleaning Supplies', 'Floor disinfectants, surface cleaners, handwashes, and spin mops', TRUE),
    (10, 'Packaging Materials', 'Corrugated boxes, bubble wrap rolls, tapes, and courier bags', TRUE)
ON DUPLICATE KEY UPDATE
    `name`        = VALUES(`name`),
    `description` = VALUES(`description`),
    `is_active`   = VALUES(`is_active`);

-- ------------------------------------------------------------------------------
-- 3. Seed Suppliers (5 Realistic Suppliers)
-- ------------------------------------------------------------------------------
INSERT INTO `suppliers` (`id`, `company_name`, `contact_person`, `email`, `phone`, `address`, `is_active`)
VALUES
    (1, 'TechSource Distributors', 'Rajesh Sharma', 'rajesh@techsource.in', '+91-98200-11223', '42 Electronics City, Phase 1, Bengaluru, Karnataka 560100', TRUE),
    (2, 'Apex Office Supplies', 'Priya Patel', 'priya@apexoffice.in', '+91-98201-22334', '15 Nariman Point, Mumbai, Maharashtra 400021', TRUE),
    (3, 'Prime Packaging Co.', 'Vikram Malhotra', 'sales@primepackaging.in', '+91-98202-33445', '88 Okhla Industrial Area, Phase 3, New Delhi 110020', TRUE),
    (4, 'Global Consumer Goods', 'Sunita Menon', 'sunita@globalconsumer.in', '+91-98203-44556', '27 Mount Road, T. Nagar, Chennai, Tamil Nadu 600017', TRUE),
    (5, 'SmartTech Innovations', 'Amit Verma', 'amit@smarttech.in', '+91-98204-55667', '104 Hitec City, Madhapur, Hyderabad, Telangana 500081', TRUE)
ON DUPLICATE KEY UPDATE
    `company_name`   = VALUES(`company_name`),
    `contact_person` = VALUES(`contact_person`),
    `email`          = VALUES(`email`),
    `phone`          = VALUES(`phone`),
    `address`        = VALUES(`address`),
    `is_active`      = VALUES(`is_active`);

-- ------------------------------------------------------------------------------
-- 4. Seed Products (50 Realistic Products across 10 Categories)
-- Includes:
-- - In-Stock products (Healthy stock above reorder level)
-- - Low-Stock products (quantity <= min_reorder_level)
-- - Out-of-Stock products (quantity = 0)
-- ------------------------------------------------------------------------------
INSERT INTO `products` 
    (`id`, `sku`, `barcode`, `name`, `description`, `category_id`, `supplier_id`, `cost_price`, `selling_price`, `quantity_on_hand`, `min_reorder_level`, `location_shelf`, `is_active`, `version`)
VALUES
    -- 1. Electronics (Category 1)
    (1, 'ELE-MOU-001', '8901001001011', 'Logitech Wireless Mouse M185', '2.4GHz wireless optical mouse with plug-and-play nano USB receiver', 1, 1, 650.00, 999.00, 45, 10, 'Aisle 1, Shelf A-1', TRUE, 0),
    (2, 'ELE-DOC-002', '8901001001028', 'HP USB-C Multiport Docking Station', 'Dual HDMI, Ethernet, and 100W Power Delivery aluminum multiport hub', 1, 1, 4200.00, 6499.00, 14, 5, 'Aisle 1, Shelf A-2', TRUE, 0),
    (3, 'ELE-SPE-003', '8901001001035', 'boAt Stone 350 Bluetooth Speaker', '10W stereo sound, IPX7 water resistance, and 12-hour playback', 1, 5, 1100.00, 1699.00, 3, 8, 'Aisle 1, Shelf B-1', TRUE, 0),
    (4, 'ELE-HEA-004', '8901001001042', 'Sony WH-CH520 Wireless Headphones', 'On-ear Bluetooth headphones with DSEE sound enhancement and 50h battery', 1, 5, 2800.00, 4299.00, 0, 6, 'Aisle 1, Shelf B-2', TRUE, 0),
    (5, 'ELE-POW-005', '8901001001059', 'Mi 20000mAh Power Bank 3i', 'Triple output ports with 18W fast charging and smart power management', 1, 5, 1350.00, 2099.00, 28, 10, 'Aisle 1, Shelf C-1', TRUE, 0),

    -- 2. Computer Accessories (Category 2)
    (11, 'COM-KEY-001', '8901003003015', 'Dell Wired Keyboard KB216', 'Full-sized chiclet quiet keys desktop keyboard with numeric keypad', 2, 1, 450.00, 699.00, 40, 12, 'Aisle 3, Shelf D-1', TRUE, 0),
    (12, 'COM-PAD-002', '8901003003022', 'Redragon Extended Gaming Mouse Pad XL', 'Anti-fray stitched edge waterproof micro-textured surface mousepad', 2, 1, 290.00, 549.00, 2, 8, 'Aisle 3, Shelf D-2', TRUE, 0),
    (13, 'COM-CAM-003', '8901003003039', 'Logitech C270 HD Webcam 720p', 'Widescreen HD video calling with automatic light correction mic', 2, 1, 1650.00, 2495.00, 18, 5, 'Aisle 3, Shelf E-1', TRUE, 0),
    (14, 'COM-HUB-004', '8901003003046', 'TP-Link 4-Port USB 3.0 Ultra Slim Hub', '5Gbps data transfer portable splitter hub for laptop and desktop', 2, 1, 550.00, 899.00, 25, 8, 'Aisle 3, Shelf E-2', TRUE, 0),
    (15, 'COM-SSD-005', '8901003003053', 'Crucial BX500 500GB 2.5 Inch SATA SSD', 'Solid state internal drive boosting boot times and responsive computing', 2, 1, 2100.00, 3199.00, 0, 5, 'Aisle 3, Shelf F-1', TRUE, 0),

    -- 3. Office Supplies (Category 3)
    (16, 'OFF-PAP-001', '8901004004012', 'JK Copier Paper A4 75 GSM (Ream of 500)', 'High-brightness multipurpose laser copier and inkjet white paper', 3, 2, 240.00, 380.00, 120, 25, 'Pallet 1, Bay A', TRUE, 0),
    (17, 'OFF-STA-002', '8901004004029', 'Kangaro Heavy Duty Stapler HD-10D', 'All-metal construction compact desk stapler with reload indicator', 3, 2, 75.00, 130.00, 5, 15, 'Aisle 4, Bin 21', TRUE, 0),
    (18, 'OFF-PIN-003', '8901004004036', 'Kangaro Staple Pins No. 10 (Box of 20)', 'Rust-resistant galvanized steel precision staple wire packets', 3, 2, 80.00, 150.00, 65, 20, 'Aisle 4, Bin 22', TRUE, 0),
    (19, 'OFF-CAL-004', '8901004004043', 'Casio Desktop Calculator MJ-120D Plus', '12-digit dual powered business calculator with 300 steps check', 3, 2, 380.00, 595.00, 15, 6, 'Aisle 4, Shelf G-1', TRUE, 0),
    (20, 'OFF-ORG-005', '8901004004050', 'Mesh Metal Desktop Document Tray 3-Tier', 'Sliding pull-out metal mesh letter organizer for workspace filing', 3, 2, 320.00, 599.00, 0, 5, 'Aisle 4, Shelf G-2', TRUE, 0),

    -- 4. Stationery (Category 4)
    (21, 'STA-PEN-001', '8901005005019', 'Reynolds 045 Fine Carbure Ball Pen (Pack of 20)', 'Classic smooth smudge-free blue ink ballpoint everyday writing pen', 4, 2, 110.00, 180.00, 90, 20, 'Aisle 5, Bin 31', TRUE, 0),
    (22, 'STA-GEL-002', '8901005005026', 'Classmate Octane Gel Pen Set (Pack of 15)', 'Waterproof Japanese ink high-flow gel pen with comfortable grip', 4, 2, 95.00, 150.00, 4, 15, 'Aisle 5, Bin 32', TRUE, 0),
    (23, 'STA-NOT-003', '8901005005033', 'Classmate Spiral Bound Ruled Notebook A4 (300 Pgs)', 'Chlorine-free smooth paper spiral notebook with micro-perforated sheets', 4, 2, 125.00, 190.00, 75, 20, 'Aisle 5, Shelf H-1', TRUE, 0),
    (24, 'STA-STI-004', '8901005005040', 'Post-it Sticky Notes 3x3 Inch (Pack of 4)', 'Self-adhesive canary yellow repositionable note pads for reminders', 4, 2, 140.00, 230.00, 35, 10, 'Aisle 5, Bin 35', TRUE, 0),
    (25, 'STA-MAR-005', '8901005005057', 'Camlin Whiteboard Marker Assorted (Pack of 4)', 'Dry erase low-odor bullet tip refillable marker pens for presentations', 4, 2, 85.00, 140.00, 0, 12, 'Aisle 5, Bin 36', TRUE, 0),

    -- 5. Furniture (Category 5)
    (26, 'FUR-CHA-001', '8901006006016', 'Green Soul Ergonomic High-Back Office Chair', 'Breathable mesh back with adjustable lumbar support and 3D armrests', 5, 2, 6500.00, 9999.00, 12, 4, 'Warehouse Bay C-1', TRUE, 0),
    (27, 'FUR-DES-002', '8901006006023', 'Engineered Wood Computer Desk 4x2 Ft', 'Sturdy powder-coated steel frame modern writing workstation desk', 5, 2, 3200.00, 5499.00, 1, 3, 'Warehouse Bay C-2', TRUE, 0),
    (28, 'FUR-CAB-003', '8901006006030', 'Metal File Storage Cabinet 3-Drawer with Lock', 'Central locking system cold-rolled steel heavy filing cabinet', 5, 2, 4100.00, 6899.00, 6, 2, 'Warehouse Bay D-1', TRUE, 0),
    (29, 'FUR-BOO-004', '8901006006047', 'Open Metal Display Bookshelf 4-Tier', 'Industrial vintage standing shelf unit for binders and equipment', 5, 2, 2200.00, 3799.00, 8, 3, 'Warehouse Bay D-2', TRUE, 0),
    (30, 'FUR-STU-005', '8901006006054', 'Adjustable Footrest Cushion with Non-Slip Grip', 'High-density memory foam angled ergonomic footrest for desk workers', 5, 2, 450.00, 899.00, 0, 5, 'Warehouse Bay D-3', TRUE, 0),

    -- 6. Mobile Accessories (Category 6)
    (6, 'MOB-CAB-001', '8901002002018', 'Portronics USB-C Fast Charging Cable 65W', 'Braided 1.2-meter high durability fast charging and data sync cord', 6, 5, 180.00, 399.00, 85, 20, 'Aisle 2, Bin 10', TRUE, 0),
    (7, 'MOB-ADA-002', '8901002002025', 'Ambrane 20W Dual Port Fast Charger', 'Type-C PD and USB-A Quick Charge compact wall power adapter', 6, 5, 320.00, 599.00, 4, 15, 'Aisle 2, Bin 12', TRUE, 0),
    (8, 'MOB-HOL-003', '8901002002032', 'Spigen Magnetic Car Mount Mobile Holder', '360-degree rotation air vent dashboard magnetic smartphone mount', 6, 1, 450.00, 899.00, 32, 10, 'Aisle 2, Bin 14', TRUE, 0),
    (9, 'MOB-OTG-004', '8901002002049', 'SanDisk Ultra 64GB Dual Drive Type-C', 'High-speed USB 3.1 flash drive with reversible Type-C and Type-A plugs', 6, 1, 580.00, 849.00, 0, 10, 'Aisle 2, Bin 15', TRUE, 0),
    (10, 'MOB-CAS-005', '8901002002056', 'Shockproof Matte Armor Back Cover Case', 'Mil-grade drop protection translucent flexible bumper case', 6, 5, 120.00, 299.00, 50, 15, 'Aisle 2, Bin 18', TRUE, 0),

    -- 7. Home Appliances (Category 7)
    (31, 'HOM-KET-001', '8901007007013', 'Havells Aqua 9 1.5L Stainless Steel Electric Kettle', 'Auto shut-off boil-dry protection 1500W rapid water boiling kettle', 7, 4, 820.00, 1299.00, 22, 6, 'Aisle 6, Shelf J-1', TRUE, 0),
    (32, 'HOM-IRO-002', '8901007007020', 'Philips Dry Iron 1000W Classic HD1172', 'Non-stick linished soleplate uniform heating compact dry press iron', 7, 4, 640.00, 995.00, 3, 8, 'Aisle 6, Shelf J-2', TRUE, 0),
    (33, 'HOM-PUR-003', '8901007007037', 'Kent Ultra Storage 7L Water Purifier UV+UF', 'Double purification wall-mounted pure drinking water machine', 7, 4, 5800.00, 8499.00, 7, 3, 'Aisle 6, Shelf K-1', TRUE, 0),
    (34, 'HOM-MIX-004', '8901007007044', 'Bajaj Rex 500W Mixer Grinder with 3 Jars', 'Durable stainless steel blades multipurpose kitchen food processor', 7, 4, 1650.00, 2499.00, 15, 5, 'Aisle 6, Shelf K-2', TRUE, 0),
    (35, 'HOM-VAC-005', '8901007007051', 'Eureka Forbes Quick Clean DX Vacuum Cleaner', '1200W powerful suction deep cleaning portable bag canister cleaner', 7, 4, 2700.00, 3999.00, 0, 4, 'Aisle 6, Shelf L-1', TRUE, 0),

    -- 8. Grocery and Pantry (Category 8)
    (36, 'GRO-RIC-001', '8901008008010', 'Daawat Rozana Super Basmati Rice 5 Kg', 'Aged aromatic long grain pristine white Indian basmati grains', 8, 4, 320.00, 449.00, 60, 15, 'Pantry Rack P-1', TRUE, 0),
    (37, 'GRO-TEA-002', '8901008008027', 'Tata Tea Gold Premium Black Tea 1 Kg', 'Rich aroma CTC leaves blended with long tea leaves for freshness', 8, 4, 410.00, 560.00, 5, 12, 'Pantry Rack P-2', TRUE, 0),
    (38, 'GRO-COF-003', '8901008008034', 'Nescafe Classic Instant Coffee Jar 200g', '100% pure natural coffee beans medium dark roasted instant coffee', 8, 4, 340.00, 475.00, 35, 10, 'Pantry Rack P-3', TRUE, 0),
    (39, 'GRO-SUG-004', '8901008008041', 'Fortune Sulphur Free White Sugar 5 Kg', 'Pure crystalline hygienic refined white granulated sugar bag', 8, 4, 210.00, 280.00, 45, 10, 'Pantry Rack P-4', TRUE, 0),
    (40, 'GRO-OIL-005', '8901008008058', 'Saffola Gold Pro Healthy Blended Oil 5L Can', 'Pro-immunity dual seed antioxidant enriched heart cooking oil', 8, 4, 780.00, 999.00, 0, 8, 'Pantry Rack P-5', TRUE, 0),

    -- 9. Cleaning Supplies (Category 9)
    (41, 'CLE-FLO-001', '8901009009017', 'Lizol Disinfectant Floor Cleaner Citrus 2 L', '99.9% germ kill antibacterial surface sanitizing floor liquid', 9, 4, 260.00, 399.00, 40, 10, 'Aisle 7, Shelf M-1', TRUE, 0),
    (42, 'CLE-GLA-002', '8901009009024', 'Colin Glass & Surface Cleaner Spray 1 L (Pack of 2)', 'Streak-free shine multi-surface glass and mirror cleaning trigger bottle', 9, 4, 180.00, 280.00, 4, 12, 'Aisle 7, Shelf M-2', TRUE, 0),
    (43, 'CLE-HAN-003', '8901009009031', 'Dettol Original Germ Protection Handwash 1500ml Refill', 'Trusted antibacterial liquid soap refill pouch with pH balance', 9, 4, 190.00, 295.00, 55, 15, 'Aisle 7, Shelf N-1', TRUE, 0),
    (44, 'CLE-DIS-004', '8901009009048', 'Vim Lemon Dishwash Gel Super Saver 2 L', 'Concentrated grease removing lemon enzyme liquid utensil wash', 9, 4, 310.00, 450.00, 30, 8, 'Aisle 7, Shelf N-2', TRUE, 0),
    (45, 'CLE-MOP-005', '8901009009055', 'Scotch-Brite 2-in-1 Bucket Spin Mop Set', 'Microfiber 360-degree rapid wringing bucket floor cleaning mop kit', 9, 4, 890.00, 1399.00, 0, 5, 'Aisle 7, Shelf O-1', TRUE, 0),

    -- 10. Packaging Materials (Category 10)
    (46, 'PAC-BOX-001', '8901010010013', 'Corrugated Shipping Box 3-Ply Medium 10x8x6 (Pack of 25)', 'Eco-friendly kraft cardboard sturdy dispatch delivery packaging cartons', 10, 3, 350.00, 599.00, 50, 15, 'Packaging Bay W-1', TRUE, 0),
    (47, 'PAC-BUB-002', '8901010010020', 'Bubble Wrap Cushioning Roll 100 Meters x 14 Inch', 'Heavy duty air shock absorbing protective packaging bubble sheets', 10, 3, 420.00, 699.00, 3, 8, 'Packaging Bay W-2', TRUE, 0),
    (48, 'PAC-TAP-003', '8901010010037', 'Heavy Duty Transparent Packaging Tape 2 Inch x 65M (Pack of 6)', 'High-adhesion acrylic BOPP carton sealing transparent adhesive tape', 10, 3, 160.00, 280.00, 70, 20, 'Packaging Bay W-3', TRUE, 0),
    (49, 'PAC-STR-004', '8901010010044', 'Industrial Manual Stretch Film Wrap 500mm x 250m', 'High-tensile tear resistant pallet bundling cling wrapping film', 10, 3, 380.00, 620.00, 25, 6, 'Packaging Bay W-4', TRUE, 0),
    (50, 'PAC-BAG-005', '8901010010051', 'Self-Adhesive Courier Tamper Proof Bags (Pack of 100)', 'Waterproof tear-resistant plastic flyer mailing security courier envelopes', 10, 3, 240.00, 420.00, 0, 10, 'Packaging Bay W-5', TRUE, 0)
ON DUPLICATE KEY UPDATE
    `sku`               = VALUES(`sku`),
    `barcode`           = VALUES(`barcode`),
    `name`              = VALUES(`name`),
    `description`       = VALUES(`description`),
    `category_id`       = VALUES(`category_id`),
    `supplier_id`       = VALUES(`supplier_id`),
    `cost_price`        = VALUES(`cost_price`),
    `selling_price`     = VALUES(`selling_price`),
    `quantity_on_hand`  = VALUES(`quantity_on_hand`),
    `min_reorder_level` = VALUES(`min_reorder_level`),
    `location_shelf`    = VALUES(`location_shelf`),
    `is_active`         = VALUES(`is_active`);

-- ------------------------------------------------------------------------------
-- 5. Seed Historical Stock Transactions (Immutable Audit Trail)
-- Demonstrates Stock-In receiving and Stock-Out dispatching across categories
-- ------------------------------------------------------------------------------
INSERT INTO `stock_transactions`
    (`id`, `product_id`, `transaction_type`, `quantity`, `previous_quantity`, `new_quantity`, `unit_cost`, `reference_invoice`, `notes`, `performed_by_user_id`, `transaction_timestamp`)
VALUES
    -- Intake & dispatch for Logitech Mouse (Product 1)
    (1, 1, 'STOCK_IN', 50, 0, 50, 650.00, 'PO-2026-001', 'Initial consignment intake from TechSource Distributors', 1, '2026-10-18 09:00:00'),
    (2, 1, 'STOCK_OUT', 5, 50, 45, NULL, 'DISP-2026-101', 'Dispatched to retail display floor', 2, '2026-10-19 14:30:00'),

    -- Intake & dispatch for Docking Station (Product 2)
    (3, 2, 'STOCK_IN', 20, 0, 20, 4200.00, 'PO-2026-002', 'Received shipment container via freight courier', 1, '2026-10-18 10:15:00'),
    (4, 2, 'STOCK_OUT', 6, 20, 14, NULL, 'DISP-2026-102', 'Corporate client order fulfillment', 2, '2026-10-20 11:00:00'),

    -- Intake & dispatch leading to Low Stock on Speaker (Product 3: 3 units remaining <= 8)
    (5, 3, 'STOCK_IN', 15, 0, 15, 1100.00, 'PO-2026-003', 'Shipment intake from SmartTech Innovations', 1, '2026-10-17 08:30:00'),
    (6, 3, 'STOCK_OUT', 12, 15, 3, NULL, 'DISP-2026-103', 'Festival corporate gifts dispatch', 2, '2026-10-21 13:45:00'),

    -- Intake & total dispatch leading to Out of Stock on Headphones (Product 4: 0 units remaining)
    (7, 4, 'STOCK_IN', 10, 0, 10, 2800.00, 'PO-2026-004', 'Intake batch from SmartTech Innovations', 1, '2026-10-16 11:00:00'),
    (8, 4, 'STOCK_OUT', 10, 10, 0, NULL, 'DISP-2026-104', 'Bulk order dispatch - all units cleared', 2, '2026-10-22 16:20:00'),

    -- Intake & dispatch for Copier Paper (Product 16)
    (9, 16, 'STOCK_IN', 150, 0, 150, 240.00, 'PO-2026-005', 'Pallet intake from Apex Office Supplies', 1, '2026-10-17 12:00:00'),
    (10, 16, 'STOCK_OUT', 30, 150, 120, NULL, 'DISP-2026-105', 'Issued to administrative departments', 2, '2026-10-20 15:30:00'),

    -- Intake & dispatch for Ergonomic Chair (Product 26)
    (11, 26, 'STOCK_IN', 15, 0, 15, 6500.00, 'PO-2026-006', 'Office furniture consignment from Apex Office Supplies', 1, '2026-10-18 14:00:00'),
    (12, 26, 'STOCK_OUT', 3, 15, 12, NULL, 'DISP-2026-106', 'Executive suite workstation deployment', 2, '2026-10-21 10:15:00'),

    -- Intake for Rice (Product 36)
    (13, 36, 'STOCK_IN', 75, 0, 75, 320.00, 'PO-2026-007', 'Quarterly institutional pantry supply', 1, '2026-10-19 09:30:00'),
    (14, 36, 'STOCK_OUT', 15, 75, 60, NULL, 'DISP-2026-107', 'Cafeteria weekly ration allocation', 2, '2026-10-21 11:45:00'),

    -- Intake & dispatch for Shipping Boxes (Product 46)
    (15, 46, 'STOCK_IN', 100, 0, 100, 350.00, 'PO-2026-008', 'Carton delivery from Prime Packaging Co.', 1, '2026-10-18 16:00:00'),
    (16, 46, 'STOCK_OUT', 50, 100, 50, NULL, 'DISP-2026-108', 'Dispatched to e-commerce fulfillment floor', 2, '2026-10-22 17:00:00')
ON DUPLICATE KEY UPDATE
    `quantity`          = VALUES(`quantity`),
    `previous_quantity` = VALUES(`previous_quantity`),
    `new_quantity`      = VALUES(`new_quantity`),
    `notes`             = VALUES(`notes`);
