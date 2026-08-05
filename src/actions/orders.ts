'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { orderSubmissionSchema } from '@/lib/validators';
import { requireAdmin } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

// ============================================
// Student-facing actions
// ============================================

export async function createOrder(data: {
  student: {
    full_name: string;
    class: string;
    section: string;
    phone: string;
    email: string;
    roll_number?: string;
    house?: string;
    honeypot?: string;
  };
  dinnerItems: { id: string; quantity: number; unit_price: number; item_name: string }[];
  breakfastItems: { id: string; quantity: number; unit_price: number; item_name: string }[];
  dinnerTotal: number;
  breakfastTotal: number;
  grandTotal: number;
}) {
  if (data.student.honeypot) {
    return { error: 'Request rejected' };
  }

  const result = orderSubmissionSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = createAdminClient() as any;

  const { data: settings } = await supabase
    .from('settings')
    .select('value, key')
    .in('key', ['ordering_deadline', 'ordering_open']);

  if (settings) {
    const deadlineSetting = (settings as any[]).find((s) => s.key === 'ordering_deadline');
    const openSetting = (settings as any[]).find((s) => s.key === 'ordering_open');

    if (openSetting?.value === 'false') {
      return { error: 'Ordering is currently closed' };
    }

    if (deadlineSetting && new Date(deadlineSetting.value) < new Date()) {
      return { error: 'The ordering deadline has passed' };
    }
  }

  let verifiedDinnerTotal = 0;
  let verifiedBreakfastTotal = 0;

  if (data.dinnerItems.length > 0) {
    const dinnerItemIds = data.dinnerItems.map((i) => i.id);
    const { data: dbDinnerItems, error: dinnerError } = await supabase
      .from('dinner_items')
      .select('id, price, name')
      .in('id', dinnerItemIds);

    if (dinnerError || !dbDinnerItems) {
      return { error: 'Failed to verify dinner prices' };
    }

    const dinnerPriceMap = new Map((dbDinnerItems as any[]).map((i) => [i.id, { price: Number(i.price), name: i.name }]));

    for (const item of data.dinnerItems) {
      const dbItem = dinnerPriceMap.get(item.id);
      if (!dbItem) {
        return { error: `Dinner item not found: ${item.item_name}` };
      }
      item.unit_price = dbItem.price;
      item.item_name = dbItem.name;
      verifiedDinnerTotal += dbItem.price * item.quantity;
    }
  }

  if (data.breakfastItems.length > 0) {
    const breakfastItemIds = data.breakfastItems.map((i) => i.id);
    const { data: dbBreakfastItems, error: breakfastError } = await supabase
      .from('breakfast_items')
      .select('id, price, name')
      .in('id', breakfastItemIds);

    if (breakfastError || !dbBreakfastItems) {
      return { error: 'Failed to verify breakfast prices' };
    }

    const breakfastPriceMap = new Map((dbBreakfastItems as any[]).map((i) => [i.id, { price: Number(i.price), name: i.name }]));

    for (const item of data.breakfastItems) {
      const dbItem = breakfastPriceMap.get(item.id);
      if (!dbItem) {
        return { error: `Breakfast item not found: ${item.item_name}` };
      }
      item.unit_price = dbItem.price;
      item.item_name = dbItem.name;
      verifiedBreakfastTotal += dbItem.price * item.quantity;
    }
  }

  const verifiedSubtotal = verifiedDinnerTotal + verifiedBreakfastTotal;
  const verifiedGst = Math.round(verifiedSubtotal * 0.05 * 100) / 100;
  const verifiedPackagingFee = verifiedSubtotal > 0 ? 10 : 0;
  const verifiedPlatformFee = verifiedSubtotal > 0 ? 14 : 0;
  const verifiedGrandTotal = Math.round((verifiedSubtotal + verifiedGst + verifiedPackagingFee + verifiedPlatformFee) * 100) / 100;

  const studentPayload: any = {
    full_name: data.student.full_name,
    class: data.student.class,
    section: data.student.section,
    phone: data.student.phone,
    roll_number: data.student.roll_number || null,
    house: data.student.house || null,
  };

  if (data.student.email) {
    studentPayload.email = data.student.email;
  }

  let { data: student, error: studentError } = await supabase
    .from('students')
    .insert(studentPayload)
    .select()
    .single();

  // If email column is not present in remote schema cache (PGRST204), retry insertion without email key
  if (studentError && (studentError.code === 'PGRST204' || studentError.message?.includes('email'))) {
    console.warn('email column not found in schema cache, retrying student insertion without email key...');
    delete studentPayload.email;
    const retry = await supabase
      .from('students')
      .insert(studentPayload)
      .select()
      .single();
    student = retry.data;
    studentError = retry.error;
  }

  if (studentError || !student) {
    console.error('Failed to save student:', studentError);
    return { error: 'Failed to save student information. Please try again.' };
  }

  const { data: orderIdResult } = await supabase.rpc('generate_order_id');
  const orderId = orderIdResult || `SLP-2026-${Date.now().toString().slice(-3)}`;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_id: orderId,
      student_id: student.id,
      status: 'pending',
      dinner_total: verifiedDinnerTotal,
      breakfast_total: verifiedBreakfastTotal,
      grand_total: verifiedGrandTotal,
      is_locked: false,
    })
    .select()
    .single();

  if (orderError || !order) {
    return { error: 'Failed to create order' };
  }

  if (data.dinnerItems.length > 0) {
    const { error: dinnerInsertError } = await supabase
      .from('order_dinner_items')
      .insert(
        data.dinnerItems.map((item) => ({
          order_id: order.id,
          dinner_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_name: item.item_name,
        }))
      );

    if (dinnerInsertError) {
      return { error: 'Failed to save dinner items' };
    }
  }

  if (data.breakfastItems.length > 0) {
    const { error: breakfastInsertError } = await supabase
      .from('order_breakfast_items')
      .insert(
        data.breakfastItems.map((item) => ({
          order_id: order.id,
          breakfast_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_name: item.item_name,
        }))
      );

    if (breakfastInsertError) {
      return { error: 'Failed to save breakfast items' };
    }
  }

  return { success: true, orderId: order.order_id, orderUuid: order.id };
}

export async function getOrderByOrderId(orderId: string) {
  const supabase = (await createClient()) as any;

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      student:students(*),
      order_dinner_items(*),
      order_breakfast_items(*),
      payments(*)
    `)
    .eq('order_id', orderId)
    .single();

  if (error || !order) {
    return null;
  }

  return order;
}

export async function searchOrders(query: string) {
  const supabase = (await createClient()) as any;

  const { data: byOrderId } = await supabase
    .from('orders')
    .select(`
      *,
      student:students(*)
    `)
    .ilike('order_id', `%${query}%`)
    .limit(10);

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .ilike('full_name', `%${query}%`)
    .limit(10);

  let byName: any[] = [];
  if (students && students.length > 0) {
    const studentIds = (students as any[]).map((s) => s.id);
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        student:students(*)
      `)
      .in('student_id', studentIds)
      .limit(10);

    byName = data || [];
  }

  const allOrders = [...(byOrderId || []), ...(byName || [])];
  const unique = Array.from(new Map(allOrders.map((o) => [o.id, o])).values());

  return unique;
}

export async function checkDuplicateOrder(fullName: string, className: string, section: string) {
  const supabase = (await createClient()) as any;

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name')
    .ilike('full_name', fullName)
    .eq('class', className)
    .eq('section', section);

  if (!students || (students as any[]).length === 0) return null;

  const studentIds = (students as any[]).map((s) => s.id);
  const { data: orders } = await supabase
    .from('orders')
    .select('order_id, status')
    .in('student_id', studentIds)
    .in('status', ['pending', 'approved']);

  return orders && (orders as any[]).length > 0 ? (orders as any[])[0] : null;
}

export async function getAdminOrders(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  const adminClient = createAdminClient() as any;
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const offset = (page - 1) * limit;

  let query = adminClient
    .from('orders')
    .select(`
      *,
      student:students(*),
      payments(*)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.ilike('order_id', `%${filters.search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return { orders: [], total: 0, error: error.message };
  }

  return { orders: (data || []) as any[], total: count || 0 };
}

export async function getAdminOrderDetail(orderId: string) {
  await requireAdmin();
  const adminClient = createAdminClient() as any;

  const { data, error } = await adminClient
    .from('orders')
    .select(`
      *,
      student:students(*),
      order_dinner_items(*),
      order_breakfast_items(*),
      payments(*)
    `)
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: 'approved' | 'rejected',
  remarks?: string,
  rejectionReason?: string
) {
  await requireAdmin();
  const adminClient = createAdminClient() as any;

  const updateData: Record<string, unknown> = { status };
  if (remarks) updateData.admin_remarks = remarks;
  if (rejectionReason) updateData.rejection_reason = rejectionReason;
  if (status === 'approved') updateData.is_locked = true;

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: `order_${status}`,
    entity: 'orders',
    entity_id: orderId,
    details: { remarks, rejectionReason },
  });

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function bulkUpdateOrderStatus(
  orderIds: string[],
  status: 'approved' | 'rejected',
  remarks?: string
) {
  await requireAdmin();
  const adminClient = createAdminClient() as any;

  const updateData: Record<string, unknown> = { status };
  if (remarks) updateData.admin_remarks = remarks;
  if (status === 'approved') updateData.is_locked = true;

  const { error } = await adminClient
    .from('orders')
    .update(updateData)
    .in('id', orderIds);

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: `bulk_order_${status}`,
    entity: 'orders',
    entity_id: orderIds.join(','),
    details: { count: orderIds.length, remarks },
  });

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  const adminClient = createAdminClient() as any;

  const { error } = await adminClient
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'order_deleted',
    entity: 'orders',
    entity_id: orderId,
  });

  revalidatePath('/admin/orders');
  return { success: true };
}

export async function getDashboardStats() {
  await requireAdmin();
  const adminClient = createAdminClient() as any;

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: approvedOrders },
    { count: rejectedOrders },
    { data: revenueData },
    { data: pendingRevenueData },
  ] = await Promise.all([
    adminClient.from('orders').select('*', { count: 'exact', head: true }),
    adminClient.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    adminClient.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    adminClient.from('orders').select('grand_total').eq('status', 'approved'),
    adminClient.from('orders').select('grand_total').eq('status', 'pending'),
  ]);

  const totalRevenue = (revenueData as any[])?.reduce((sum, o) => sum + Number(o.grand_total), 0) || 0;
  const pendingRevenue = (pendingRevenueData as any[])?.reduce((sum, o) => sum + Number(o.grand_total), 0) || 0;

  return {
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    approvedOrders: approvedOrders || 0,
    rejectedOrders: rejectedOrders || 0,
    totalRevenue,
    pendingRevenue,
  };
}

export async function getKitchenSummary() {
  await requireAdmin();
  const adminClient = createAdminClient() as any;

  const { data: approvedOrders } = await adminClient
    .from('orders')
    .select('id')
    .eq('status', 'approved');

  if (!approvedOrders || (approvedOrders as any[]).length === 0) {
    return { dinner: [], breakfast: [] };
  }

  const orderIds = (approvedOrders as any[]).map((o) => o.id);

  const { data: dinnerItems } = await adminClient
    .from('order_dinner_items')
    .select('item_name, quantity')
    .in('order_id', orderIds);

  const dinnerSummary = new Map<string, number>();
  (dinnerItems as any[])?.forEach((item) => {
    const current = dinnerSummary.get(item.item_name) || 0;
    dinnerSummary.set(item.item_name, current + item.quantity);
  });

  const { data: breakfastItems } = await adminClient
    .from('order_breakfast_items')
    .select('item_name, quantity')
    .in('order_id', orderIds);

  const breakfastSummary = new Map<string, number>();
  (breakfastItems as any[])?.forEach((item) => {
    const current = breakfastSummary.get(item.item_name) || 0;
    breakfastSummary.set(item.item_name, current + item.quantity);
  });

  return {
    dinner: Array.from(dinnerSummary.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity),
    breakfast: Array.from(breakfastSummary.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity),
  };
}
