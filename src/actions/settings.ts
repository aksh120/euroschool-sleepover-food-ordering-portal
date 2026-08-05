'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth-guard';
import { revalidatePath, unstable_cache } from 'next/cache';

const publicSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================
// Public settings (uses direct anon client for ISR cache)
// ============================================

export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const { data, error } = await publicSupabase
      .from('settings')
      .select('*');

    if (error) return {};

    const settings: Record<string, string> = {};
    (data as any[])?.forEach((s) => {
      settings[s.key] = s.value;
    });

    return settings;
  },
  ['public-settings-cache'],
  { revalidate: 300, tags: ['settings'] }
);

export const getActiveQRCode = unstable_cache(
  async (): Promise<any> => {
    const { data, error } = await publicSupabase
      .from('qr_codes')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (error) return null;
    return data;
  },
  ['active-qr-code-cache'],
  { revalidate: 300, tags: ['qr_codes'] }
);

// ============================================
// Admin settings management
// ============================================

export async function updateSettings(updates: Record<string, string>): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin();
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

export async function uploadQRCode(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin();
    const file = formData.get('qr_file') as File | null;
    const upiId = formData.get('upi_id') as string | null;
    const accountHolder = formData.get('account_holder') as string | null;
    const existingImageUrl = formData.get('existing_image_url') as string | null;

    const adminClient = createAdminClient() as any;

    let imageUrl = existingImageUrl || null;

    if (file && file.size > 0) {
      // Ensure storage bucket exists
      const { data: buckets } = await adminClient.storage.listBuckets();
      const qrBucketExists = buckets?.some((b: any) => b.name === 'qr-codes');

      if (!qrBucketExists) {
        await adminClient.storage.createBucket('qr-codes', {
          public: true,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        });
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `qr-code-${Date.now()}.${fileExt}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const { error: uploadError } = await adminClient.storage
        .from('qr-codes')
        .upload(fileName, buffer, {
          contentType: file.type || 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: `Failed to upload QR Image: ${uploadError.message}` };
      }

      const { data: publicUrlData } = adminClient.storage
        .from('qr-codes')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // Deactivate old active QR codes
    await adminClient
      .from('qr_codes')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new active QR code row
    const { error: dbError } = await adminClient.from('qr_codes').insert({
      image_url: imageUrl || '',
      upi_id: upiId || null,
      account_holder: accountHolder || null,
      is_active: true,
    });

    if (dbError) {
      console.error('DB insert error:', dbError);
      return { error: `Failed to save payment details: ${dbError.message}` };
    }

    await adminClient.from('audit_logs').insert({
      action: 'qr_code_updated',
      entity: 'qr_codes',
      details: { upi_id: upiId, account_holder: accountHolder, image_url: imageUrl },
    });

    revalidatePath('/admin/settings');
    revalidatePath('/order/payment');
    return { success: true };
  } catch (err: any) {
    console.error('uploadQRCode exception:', err);
    return { error: err.message || 'An unexpected error occurred while uploading QR Code.' };
  }
}

export async function getAuditLogs(page = 1, limit = 50): Promise<{ logs: any[]; total: number }> {
  await requireAdmin();
  const adminClient = createAdminClient() as any;
  const offset = (page - 1) * limit;

  const { data, count, error } = await adminClient
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { logs: [], total: 0 };
  return { logs: data || [], total: count || 0 };
}
