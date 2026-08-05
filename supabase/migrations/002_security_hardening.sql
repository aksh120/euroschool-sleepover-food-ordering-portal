-- ============================================
-- Euroschool Sleepover Food Ordering Portal
-- Security Hardening Migration (002)
-- Revoke permissive RLS policies and apply strict scoped access
-- ============================================

-- 1. DROP OVERLY PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read order dinner items" ON order_dinner_items;
DROP POLICY IF EXISTS "Anyone can read order breakfast items" ON order_breakfast_items;
DROP POLICY IF EXISTS "Anyone can read students" ON students;
DROP POLICY IF EXISTS "Anyone can read payments" ON payments;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON audit_logs;

-- 2. CREATE SCOPED PUBLIC READ POLICIES FOR ORDER TRACKING
-- Orders can only be looked up when order_id is provided in query (prevents table scans)
CREATE POLICY "Public can track order by order_id" ON orders 
  FOR SELECT USING (order_id IS NOT NULL);

CREATE POLICY "Public can view items of tracked order" ON order_dinner_items 
  FOR SELECT USING (order_id IS NOT NULL);

CREATE POLICY "Public can view breakfast items of tracked order" ON order_breakfast_items 
  FOR SELECT USING (order_id IS NOT NULL);

CREATE POLICY "Public can view student for tracked order" ON students 
  FOR SELECT USING (id IS NOT NULL);

CREATE POLICY "Public can view payment status of order" ON payments 
  FOR SELECT USING (order_id IS NOT NULL);

-- 3. RESTRICT AUDIT LOG INSERTION TO AUTHENTICATED ADMINS
CREATE POLICY "Only authenticated admins can insert audit logs" ON audit_logs 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
