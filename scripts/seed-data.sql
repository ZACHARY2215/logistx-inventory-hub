-- LogistX Seed Data Script
-- Run this script in your Supabase SQL Editor to populate sample data

-- Insert additional categories
INSERT INTO public.categories (name, description) VALUES
  ('Software', 'Software licenses and digital products'),
  ('Hardware', 'Computer hardware and components'),
  ('Office Supplies', 'General office supplies and stationery'),
  ('Safety Equipment', 'Safety gear and protective equipment')
ON CONFLICT (name) DO NOTHING;

-- Insert additional suppliers
INSERT INTO public.suppliers (name, contact_email, contact_phone, address) VALUES
  ('Microsoft', 'business@microsoft.com', '1-800-642-7676', 'Redmond, WA'),
  ('Amazon Business', 'business@amazon.com', '1-800-201-7575', 'Seattle, WA'),
  ('Staples', 'business@staples.com', '1-800-333-3330', 'Framingham, MA'),
  ('3M', 'business@3m.com', '1-800-364-3577', 'St. Paul, MN')
ON CONFLICT (name) DO NOTHING;

-- Insert additional inventory items
INSERT INTO public.inventory_items (name, sku, category_id, supplier_id, quantity, min_quantity, price, description) 
SELECT 
  'Microsoft Office 365 Business', 
  'MSFT-O365-001', 
  (SELECT id FROM public.categories WHERE name = 'Software'), 
  (SELECT id FROM public.suppliers WHERE name = 'Microsoft'), 
  50, 10, 12.00, 
  'Monthly subscription for Office 365 Business'
UNION ALL SELECT 
  'Dell OptiPlex Desktop', 
  'DELL-OPT-002', 
  (SELECT id FROM public.categories WHERE name = 'Electronics'), 
  (SELECT id FROM public.suppliers WHERE name = 'Dell'), 
  15, 5, 899.99, 
  'Business desktop computer with Intel i5 processor'
UNION ALL SELECT 
  'Staples Copy Paper', 
  'STAP-PAPER-003', 
  (SELECT id FROM public.categories WHERE name = 'Office Supplies'), 
  (SELECT id FROM public.suppliers WHERE name = 'Staples'), 
  200, 50, 4.99, 
  'White copy paper, 8.5" x 11", 20 lb'
UNION ALL SELECT 
  '3M Safety Glasses', 
  '3M-SAFETY-004', 
  (SELECT id FROM public.categories WHERE name = 'Safety Equipment'), 
  (SELECT id FROM public.suppliers WHERE name = '3M'), 
  75, 25, 12.99, 
  'Clear safety glasses with side protection'
UNION ALL SELECT 
  'Samsung 32" Monitor', 
  'SAMS-MON-005', 
  (SELECT id FROM public.categories WHERE name = 'Computer Accessories'), 
  (SELECT id FROM public.suppliers WHERE name = 'Generic'), 
  30, 10, 249.99, 
  '32-inch LED monitor with 1080p resolution'
UNION ALL SELECT 
  'Ergonomic Keyboard', 
  'LOGIT-KB-006', 
  (SELECT id FROM public.categories WHERE name = 'Computer Accessories'), 
  (SELECT id FROM public.suppliers WHERE name = 'Logitech'), 
  40, 15, 79.99, 
  'Wireless ergonomic keyboard with wrist rest'
ON CONFLICT (sku) DO NOTHING;

-- Create sample transaction records
INSERT INTO public.inventory_transactions (item_id, user_id, transaction_type, quantity_change, previous_quantity, new_quantity, notes)
SELECT 
  (SELECT id FROM public.inventory_items WHERE sku = 'APPLE-MBP14-001'),
  (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'create',
  25,
  0,
  25,
  'Initial stock setup'
UNION ALL SELECT 
  (SELECT id FROM public.inventory_items WHERE sku = 'FURN-CHAIR-002'),
  (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'create',
  12,
  0,
  12,
  'Initial stock setup'
UNION ALL SELECT 
  (SELECT id FROM public.inventory_items WHERE sku = 'COMP-MOUSE-003'),
  (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'create',
  150,
  0,
  150,
  'Initial stock setup'
UNION ALL SELECT 
  (SELECT id FROM public.inventory_items WHERE sku = 'APPLE-IP15P-005'),
  (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'adjust',
  -2,
  5,
  3,
  'Stock adjustment - sold 2 units'
UNION ALL SELECT 
  (SELECT id FROM public.inventory_items WHERE sku = 'COMP-MON-006'),
  (SELECT user_id FROM public.profiles WHERE role = 'admin' LIMIT 1),
  'add',
  10,
  35,
  45,
  'Stock replenishment'
ON CONFLICT DO NOTHING;

-- Update some items to have low stock for testing alerts
UPDATE public.inventory_items 
SET quantity = 2 
WHERE sku = 'APPLE-IP15P-005';

UPDATE public.inventory_items 
SET quantity = 1 
WHERE sku = 'FURN-DESK-004';

-- Create a sample low stock item
INSERT INTO public.inventory_items (name, sku, category_id, supplier_id, quantity, min_quantity, price, description) 
SELECT 
  'Emergency Flashlight', 
  'EMERG-FLASH-007', 
  (SELECT id FROM public.categories WHERE name = 'Safety Equipment'), 
  (SELECT id FROM public.suppliers WHERE name = 'Generic'), 
  3, 10, 15.99, 
  'LED emergency flashlight with rechargeable battery'
ON CONFLICT (sku) DO NOTHING;

-- Verify the data
SELECT 
  'Categories' as table_name,
  COUNT(*) as count
FROM public.categories
UNION ALL
SELECT 
  'Suppliers' as table_name,
  COUNT(*) as count
FROM public.suppliers
UNION ALL
SELECT 
  'Inventory Items' as table_name,
  COUNT(*) as count
FROM public.inventory_items
UNION ALL
SELECT 
  'Low Stock Items' as table_name,
  COUNT(*) as count
FROM public.inventory_items
WHERE quantity <= min_quantity
UNION ALL
SELECT 
  'Transactions' as table_name,
  COUNT(*) as count
FROM public.inventory_transactions;

-- Display low stock items
SELECT 
  i.name,
  i.sku,
  c.name as category,
  s.name as supplier,
  i.quantity,
  i.min_quantity,
  i.price,
  (i.quantity * i.price) as total_value
FROM public.inventory_items i
LEFT JOIN public.categories c ON i.category_id = c.id
LEFT JOIN public.suppliers s ON i.supplier_id = s.id
WHERE i.quantity <= i.min_quantity
ORDER BY (i.quantity - i.min_quantity) ASC;
