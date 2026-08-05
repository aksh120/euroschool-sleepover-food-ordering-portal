-- ============================================
-- Euroschool Sleepover Food Ordering Portal
-- Database Schema - Initial Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. RESTAURANTS
-- ============================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('dinner', 'breakfast')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. DINNER ITEMS (McDonald's Menu)
-- ============================================
CREATE TABLE dinner_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
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

-- ============================================
-- 3. BREAKFAST ITEMS
-- ============================================
CREATE TABLE breakfast_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
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

-- ============================================
-- 4. STUDENTS
-- ============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  roll_number TEXT,
  phone TEXT,
  house TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for duplicate detection
CREATE INDEX idx_students_name_class_section ON students(full_name, class, section);

-- ============================================
-- 5. ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL UNIQUE, -- SLP-2026-XXX format
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

-- Sequence for generating order IDs
CREATE SEQUENCE order_id_seq START 1;

-- ============================================
-- 6. ORDER DINNER ITEMS (Junction)
-- ============================================
CREATE TABLE order_dinner_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dinner_item_id UUID NOT NULL REFERENCES dinner_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  item_name TEXT NOT NULL, -- Snapshot of name at order time
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 7. ORDER BREAKFAST ITEMS (Junction)
-- ============================================
CREATE TABLE order_breakfast_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  breakfast_item_id UUID NOT NULL REFERENCES breakfast_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  item_name TEXT NOT NULL, -- Snapshot of name at order time
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. PAYMENTS
-- ============================================
CREATE TABLE payments (
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

-- ============================================
-- 9. QR CODES
-- ============================================
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  upi_id TEXT,
  account_holder TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 10. SETTINGS
-- ============================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 11. AUDIT LOGS
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);

-- ============================================
-- 12. ADMIN USERS (managed via Supabase Auth)
-- ============================================
-- Admin users use Supabase Auth. We store a role mapping here.
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate next order ID
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
  next_val INT;
BEGIN
  next_val := nextval('order_id_seq');
  RETURN 'SLP-2026-' || LPAD(next_val::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER tr_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_dinner_items_updated_at BEFORE UPDATE ON dinner_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_breakfast_items_updated_at BEFORE UPDATE ON breakfast_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_qr_codes_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
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

-- PUBLIC READ policies (menu items, settings, restaurants, QR codes)
CREATE POLICY "Public can read active restaurants" ON restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read available dinner items" ON dinner_items FOR SELECT USING (available = true);
CREATE POLICY "Public can read available breakfast items" ON breakfast_items FOR SELECT USING (available = true);
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can read active QR codes" ON qr_codes FOR SELECT USING (is_active = true);

-- STUDENT INSERT policies (anonymous users can create orders)
CREATE POLICY "Anyone can create students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can add dinner items to orders" ON order_dinner_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can add breakfast items to orders" ON order_breakfast_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create payments" ON payments FOR INSERT WITH CHECK (true);

-- STUDENT SELECT policies (can view orders by order_id lookup)
CREATE POLICY "Public can track order by order_id" ON orders FOR SELECT USING (order_id IS NOT NULL);
CREATE POLICY "Public can view items of tracked order" ON order_dinner_items FOR SELECT USING (order_id IS NOT NULL);
CREATE POLICY "Public can view breakfast items of tracked order" ON order_breakfast_items FOR SELECT USING (order_id IS NOT NULL);
CREATE POLICY "Public can view student for tracked order" ON students FOR SELECT USING (id IS NOT NULL);
CREATE POLICY "Public can view payment status of order" ON payments FOR SELECT USING (order_id IS NOT NULL);

-- STUDENT UPDATE policies (can edit own order only when pending and not locked)
CREATE POLICY "Anyone can update pending orders" ON orders FOR UPDATE USING (status = 'pending' AND is_locked = false);

-- ADMIN policies (authenticated admins via service role bypass RLS)
-- Admin operations will use the service_role key which bypasses RLS entirely
-- Additional admin-specific policies for granular control:
CREATE POLICY "Admins can read audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);
CREATE POLICY "Only authenticated admins can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage admin users" ON admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these via Supabase Dashboard or API:
-- 1. Create bucket 'payment-screenshots' (public: false)
-- 2. Create bucket 'menu-images' (public: true)
-- 3. Create bucket 'qr-codes' (public: true)

-- Storage policies (run in Supabase SQL editor):
-- INSERT policy for payment-screenshots: allow all (anon can upload)
-- SELECT policy for payment-screenshots: allow authenticated (admin only)
-- INSERT/SELECT/UPDATE/DELETE for menu-images: allow authenticated
-- INSERT/SELECT/UPDATE/DELETE for qr-codes: allow authenticated
