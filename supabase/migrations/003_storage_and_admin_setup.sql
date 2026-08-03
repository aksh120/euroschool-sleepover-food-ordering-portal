-- ============================================
-- Euroschool Sleepover Food Ordering Portal
-- Storage Buckets & Admin Seeding Script
-- ============================================

-- ============================================
-- STORAGE BUCKETS SETUP
-- ============================================

-- Create Storage Buckets (if storage schema exists)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('payment-screenshots', 'payment-screenshots', true),
  ('menu-images', 'menu-images', true),
  ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for payment-screenshots
CREATE POLICY "Public can upload payment screenshots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots');

CREATE POLICY "Public can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- Storage Policies for menu-images
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Admins can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images');

-- Storage Policies for qr-codes
CREATE POLICY "Public can view qr codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

CREATE POLICY "Admins can upload qr codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes');

-- ============================================
-- ADMIN SEEDING INSTRUCTIONS & HELPER FUNCTION
-- ============================================
-- To create your first Admin user in Supabase:
-- 1. Create a user in Supabase Dashboard -> Authentication -> Users with email & password (e.g. admin@euroschool.com)
-- 2. Run the SQL snippet below replacing 'PASTE_USER_UUID_HERE' with the generated User UUID from Auth:

/*
INSERT INTO public.admin_users (id, email, role)
VALUES ('PASTE_USER_UUID_HERE', 'admin@euroschool.com', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
*/
