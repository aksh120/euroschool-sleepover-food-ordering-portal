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

export async function uploadQRCode(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const adminClient = createAdminClient() as any;

  try {
    const file = formData.get('qr_file') as File | null;
    const upiId = (formData.get('upi_id') as string) || null;
    const accountHolder = (formData.get('account_holder') as string) || null;
    let imageUrl = (formData.get('existing_image_url') as string) || '';

    if (file && file.size > 0) {
      // Ensure 'qr-codes' bucket exists
      const { data: buckets } = await adminClient.storage.listBuckets();
      const hasBucket = buckets?.some((b: any) => b.name === 'qr-codes');
      if (!hasBucket) {
        await adminClient.storage.createBucket('qr-codes', { public: true });
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `qr_${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from('qr-codes')
        .upload(fileName, buffer, {
          contentType: file.type || 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('QR upload storage error:', uploadError);
        return { error: `Storage upload failed: ${uploadError.message}` };
      }

      const { data: publicUrlData } = adminClient.storage
        .from('qr-codes')
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrlData?.publicUrl || imageUrl;
    }

    await adminClient
      .from('qr_codes')
      .update({ is_active: false })
      .eq('is_active', true);

    const { error } = await adminClient.from('qr_codes').insert({
      image_url: imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      upi_id: upiId,
      account_holder: accountHolder,
      is_active: true,
    });

    if (error) return { error: error.message };

    await adminClient.from('audit_logs').insert({
      action: 'qr_code_updated',
      entity: 'qr_codes',
      details: { upiId, accountHolder, imageUrl },
    });

    revalidatePath('/admin/settings');
    revalidatePath('/order/payment');
    return { success: true };
  } catch (err: any) {
    console.error('uploadQRCode error:', err);
    return { error: err.message || 'Failed to update QR Code' };
  }
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
