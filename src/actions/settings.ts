'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// ============================================
// Public settings (uses anon client with RLS)
// ============================================

export async function getSettings(): Promise<Record<string, string>> {
  const supabase = (await createClient()) as any;

  const { data, error } = await supabase
    .from('settings')
    .select('*');

  if (error) return {};

  const settings: Record<string, string> = {};
  (data as any[])?.forEach((s) => {
    settings[s.key] = s.value;
  });

  return settings;
}

export async function getActiveQRCode(): Promise<any> {
  const supabase = (await createClient()) as any;

  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

// ============================================
// Admin settings management
// ============================================

export async function updateSettings(updates: Record<string, string>): Promise<{ success?: boolean; error?: string }> {
  const adminClient = createAdminClient() as any;

  const promises = Object.entries(updates).map(([key, value]) =>
    adminClient
      .from('settings')
      .upsert({ key, value, description: null }, { onConflict: 'key' })
  );

  await Promise.all(promises);

  await adminClient.from('audit_logs').insert({
    action: 'settings_updated',
    entity: 'settings',
    details: updates,
  });

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function uploadQRCode(imageUrl: string, upiId?: string, accountHolder?: string): Promise<{ success?: boolean; error?: string }> {
  const adminClient = createAdminClient() as any;

  await adminClient
    .from('qr_codes')
    .update({ is_active: false })
    .eq('is_active', true);

  const { error } = await adminClient.from('qr_codes').insert({
    image_url: imageUrl,
    upi_id: upiId || null,
    account_holder: accountHolder || null,
    is_active: true,
  });

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'qr_code_updated',
    entity: 'qr_codes',
    details: { upiId, accountHolder },
  });

  revalidatePath('/admin/settings');
  return { success: true };
}

// ============================================
// Audit Logs
// ============================================

export async function getAuditLogs(page: number = 1, limit: number = 50): Promise<{ logs: any[]; total: number }> {
  const adminClient = createAdminClient() as any;
  const offset = (page - 1) * limit;

  const { data, error, count } = await adminClient
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { logs: [], total: 0 };
  return { logs: (data || []) as any[], total: count || 0 };
}
