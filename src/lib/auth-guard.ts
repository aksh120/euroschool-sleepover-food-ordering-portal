import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function requireAdmin() {
  const supabase = (await createClient()) as any;
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const adminClient = createAdminClient() as any;
  const { data: adminUser, error: adminError } = await adminClient
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (adminError || !adminUser) {
    throw new Error('Forbidden: Admin privilege required');
  }

  return { user, adminUser };
}
