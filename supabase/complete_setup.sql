-- =========================================================
-- PROJECT CHEESECAKE SENIOR SLEEPOVER 2026 - COMPLETE DATABASE SETUP SCRIPT
-- Copy and run this entire file in your Supabase SQL Editor
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dinner', 'breakfast')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DINNER ITEMS (McDonald's Menu)
CREATE TABLE IF NOT EXISTS dinner_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'Other',
  veg_status TEXT NOT NULL CHECK (veg_status IN ('veg', 'non-veg')) DEFAULT 'veg',
  platform TEXT CHECK (platform IN ('swiggy', 'zomato', 'manual')),
  available BOOLEAN NOT NULL DEFAULT true,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BREAKFAST ITEMS
CREATE TABLE IF NOT EXISTS breakfast_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  veg_status TEXT NOT NULL CHECK (veg_status IN ('veg', 'non-veg')) DEFAULT 'veg',
  available BOOLEAN NOT NULL DEFAULT true,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  roll_number TEXT,
  house TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_name_class_section ON students(full_name, class, section);

-- 5. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  dinner_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  breakfast_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  admin_remarks TEXT,
  rejection_reason TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1;

-- 6. ORDER DINNER ITEMS (Junction)
CREATE TABLE IF NOT EXISTS order_dinner_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dinner_item_id UUID NOT NULL REFERENCES dinner_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  item_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDER BREAKFAST ITEMS (Junction)
CREATE TABLE IF NOT EXISTS order_breakfast_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  breakfast_item_id UUID NOT NULL REFERENCES breakfast_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  item_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  screenshot_url TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected', 'reupload_requested')) DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. QR CODES
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  upi_id TEXT,
  account_holder TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);

-- 12. ADMIN USERS
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
  next_val INT;
BEGIN
  next_val := nextval('order_id_seq');
  RETURN 'SLP-2026-' || LPAD(next_val::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinner_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE breakfast_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_dinner_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_breakfast_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- TABLE RLS POLICIES
DROP POLICY IF EXISTS "Public can read active restaurants" ON restaurants;
CREATE POLICY "Public can read active restaurants" ON restaurants FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can read available dinner items" ON dinner_items;
CREATE POLICY "Public can read available dinner items" ON dinner_items FOR SELECT USING (available = true);

DROP POLICY IF EXISTS "Public can read available breakfast items" ON breakfast_items;
CREATE POLICY "Public can read available breakfast items" ON breakfast_items FOR SELECT USING (available = true);

DROP POLICY IF EXISTS "Public can read settings" ON settings;
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read active QR codes" ON qr_codes;
CREATE POLICY "Public can read active QR codes" ON qr_codes FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can create students" ON students;
CREATE POLICY "Anyone can create students" ON students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can add dinner items to orders" ON order_dinner_items;
CREATE POLICY "Anyone can add dinner items to orders" ON order_dinner_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can add breakfast items to orders" ON order_breakfast_items;
CREATE POLICY "Anyone can add breakfast items to orders" ON order_breakfast_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can create payments" ON payments;
CREATE POLICY "Anyone can create payments" ON payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read order dinner items" ON order_dinner_items;
CREATE POLICY "Anyone can read order dinner items" ON order_dinner_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read order breakfast items" ON order_breakfast_items;
CREATE POLICY "Anyone can read order breakfast items" ON order_breakfast_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read students" ON students;
CREATE POLICY "Anyone can read students" ON students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read payments" ON payments;
CREATE POLICY "Anyone can read payments" ON payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update pending orders" ON orders;
CREATE POLICY "Anyone can update pending orders" ON orders FOR UPDATE USING (status = 'pending' AND is_locked = false);

-- STORAGE BUCKETS & POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('payment-screenshots', 'payment-screenshots', true),
  ('menu-images', 'menu-images', true),
  ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can upload payment screenshots" ON storage.objects;
CREATE POLICY "Public can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots');

DROP POLICY IF EXISTS "Public can view payment screenshots" ON storage.objects;
CREATE POLICY "Public can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- SEED DATA
INSERT INTO restaurants (id, name, type, is_active) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'McDonald''s', 'dinner', true),
  ('b2222222-2222-2222-2222-222222222222', 'Local Breakfast Vendor', 'breakfast', true)
ON CONFLICT DO NOTHING;

INSERT INTO settings (key, value, description) VALUES
  ('event_name', 'Project Cheesecake Senior Sleepover 2026', 'Name of the event'),
  ('event_date_start', '2026-08-21T17:00:00+05:30', 'Event start date and time'),
  ('event_date_end', '2026-08-22T10:00:00+05:30', 'Event end date and time'),
  ('reporting_time', '5:00 PM', 'Student reporting time'),
  ('ordering_deadline', '2026-08-20T23:59:59+05:30', 'Deadline for placing orders'),
  ('ordering_open', 'true', 'Whether ordering is currently open'),
  ('dinner_restaurant', 'McDonald''s', 'Dinner restaurant name'),
  ('breakfast_restaurant', 'Local Breakfast Vendor', 'Breakfast restaurant name')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- DEFAULT McDONALD'S DINNER ITEMS
INSERT INTO dinner_items (name, description, price, category, veg_status, platform, available, restaurant_id, sort_order) VALUES
  ('McAloo Tikki Burger', 'Crispy aloo tikki patty with fresh lettuce and tangy mayo', 62.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 1),
  ('McVeggie Burger', 'Veggie patty with lettuce, mayo, and cheese', 120.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 2),
  ('McSpicy Paneer Burger', 'Spicy paneer patty with habanero sauce and crispy lettuce', 180.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 3),
  ('Veg Maharaja Mac', 'Double veggie patty, cheese, lettuce, onions, and special sauce', 210.00, 'Burgers', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 4),
  ('McChicken Burger', 'Tender chicken patty with creamy mayo and shredded lettuce', 150.00, 'Burgers', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 5),
  ('Chicken Maharaja Mac', 'Double chicken patty with habanero sauce, onions, and lettuce', 250.00, 'Burgers', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 6),
  ('McSpicy Chicken Burger', 'Spicy crispy chicken patty with habanero sauce', 190.00, 'Burgers', 'non-veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 7),
  ('French Fries (Medium)', 'Golden crispy fries - medium portion', 119.00, 'Sides', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 8),
  ('Veg Pizza McPuff', 'Crispy pastry filled with spicy pizza-flavored veggies', 50.00, 'Sides', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 9),
  ('Coca-Cola (Medium)', 'Refreshing Coca-Cola', 85.00, 'Beverages', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 10),
  ('McFlurry Oreo', 'Vanilla soft serve with Oreo cookie crumbles', 130.00, 'Desserts', 'veg', 'manual', true, 'd1111111-1111-1111-1111-111111111111', 11)
ON CONFLICT (name) DO NOTHING;

-- DEFAULT BREAKFAST ITEMS
INSERT INTO breakfast_items (name, description, price, veg_status, available, restaurant_id, sort_order) VALUES
  ('Vada Pav', 'Classic Mumbai-style vada pav with chutneys', 30.00, 'veg', true, 'b2222222-2222-2222-2222-222222222222', 1),
  ('Samosa', 'Crispy triangular pastry filled with spiced potatoes and peas', 25.00, 'veg', true, 'b2222222-2222-2222-2222-222222222222', 2),
  ('Sandwich', 'Fresh vegetable sandwich with butter and chutney', 50.00, 'veg', true, 'b2222222-2222-2222-2222-222222222222', 3)
ON CONFLICT (name) DO NOTHING;
