'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// ============================================
// Student-facing payment actions
// ============================================

export async function submitPayment(orderUuid: string, screenshotUrl: string, transactionId?: string) {
  const supabase = (await createClient()) as any;

  const { error } = await supabase.from('payments').insert({
    order_id: orderUuid,
    screenshot_url: screenshotUrl,
    transaction_id: transactionId || null,
    status: 'pending',
  });

  if (error) return { error: 'Failed to submit payment' };

  return { success: true };
}

// ============================================
// Admin payment verification actions
// ============================================

export async function getPendingPayments(): Promise<any[]> {
  const adminClient = createAdminClient() as any;

  const { data, error } = await adminClient
    .from('payments')
    .select(`
      *,
      order:orders(
        *,
        student:students(*),
        order_dinner_items(*),
        order_breakfast_items(*)
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) return [];
  return (data || []) as any[];
}

export async function verifyPayment(paymentId: string, action: 'verified' | 'rejected' | 'reupload_requested', remarks?: string) {
  const adminClient = createAdminClient() as any;

  const updateData: Record<string, unknown> = {
    status: action,
    verified_at: new Date().toISOString(),
  };
  if (remarks) updateData.remarks = remarks;

  const { error } = await adminClient
    .from('payments')
    .update(updateData)
    .eq('id', paymentId);

  if (error) return { error: error.message };

  if (action === 'verified') {
    const { data: payment } = await adminClient
      .from('payments')
      .select('order_id')
      .eq('id', paymentId)
      .single();

    if (payment) {
      await adminClient
        .from('orders')
        .update({ status: 'approved', is_locked: true })
        .eq('id', payment.order_id);
    }
  }

  await adminClient.from('audit_logs').insert({
    action: `payment_${action}`,
    entity: 'payments',
    entity_id: paymentId,
    details: { remarks },
  });

  revalidatePath('/admin/payments');
  revalidatePath('/admin/orders');
  return { success: true };
}
