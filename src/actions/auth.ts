'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { loginSchema } from '@/lib/validators';

export async function signIn(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const result = loginSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = (await createClient()) as any;

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: 'Invalid email or password' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Authentication failed' };
  }

  // Use service role admin client to bypass RLS when checking admin table
  const adminSupabase = createAdminClient();
  const { data: adminUser } = await adminSupabase
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    await supabase.auth.signOut();
    return { error: 'You do not have admin access' };
  }

  redirect('/admin/dashboard');
}

export async function signOut() {
  const supabase = (await createClient()) as any;
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function getSession() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
