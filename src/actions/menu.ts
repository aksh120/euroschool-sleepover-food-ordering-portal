'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath, unstable_cache } from 'next/cache';

const publicSupabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ============================================
// Public menu fetching (uses direct anon client for ISR cache)
// ============================================

export const getDinnerMenu = unstable_cache(
  async () => {
    const { data, error } = await publicSupabase
      .from('dinner_items')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error) return [];
    return data || [];
  },
  ['dinner-menu-public-cache'],
  { revalidate: 300, tags: ['dinner-menu'] }
);

export const getBreakfastMenu = unstable_cache(
  async () => {
    const { data, error } = await publicSupabase
      .from('breakfast_items')
      .select('*')
      .eq('available', true)
      .order('sort_order', { ascending: true });

    if (error) return [];
    return data || [];
  },
  ['breakfast-menu-public-cache'],
  { revalidate: 300, tags: ['breakfast-menu'] }
);

// ============================================
// Admin menu management (uses service role)
// ============================================

export async function getAdminDinnerMenu() {
  const adminClient = createAdminClient() as any;

  const { data, error } = await adminClient
    .from('dinner_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getAdminBreakfastMenu() {
  const adminClient = createAdminClient() as any;

  const { data, error } = await adminClient
    .from('breakfast_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function addDinnerItem(item: {
  name: string;
  description?: string;
  price: number;
  veg_status: 'veg' | 'non-veg';
  category?: string;
  available: boolean;
  image_url?: string;
}) {
  const adminClient = createAdminClient() as any;

  const { data: maxSort } = await adminClient
    .from('dinner_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const { error } = await adminClient.from('dinner_items').insert({
    ...item,
    category: item.category || 'General',
    description: item.description || null,
    image_url: item.image_url || null,
    restaurant_id: 'a1111111-1111-1111-1111-111111111111',
    sort_order: (maxSort?.sort_order || 0) + 1,
  });

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'dinner_item_added',
    entity: 'dinner_items',
    details: { name: item.name, price: item.price },
  });

  revalidatePath('/admin/menu/dinner');
  return { success: true };
}

export async function updateDinnerItem(
  id: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    veg_status?: 'veg' | 'non-veg';
    category?: string;
    available?: boolean;
    image_url?: string;
  }
) {
  const adminClient = createAdminClient() as any;

  const { error } = await adminClient
    .from('dinner_items')
    .update(updates)
    .eq('id', id);

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'dinner_item_updated',
    entity: 'dinner_items',
    entity_id: id,
    details: updates,
  });

  revalidatePath('/admin/menu/dinner');
  return { success: true };
}

export async function deleteDinnerItem(id: string) {
  const adminClient = createAdminClient() as any;

  const { error } = await adminClient
    .from('dinner_items')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'dinner_item_deleted',
    entity: 'dinner_items',
    entity_id: id,
  });

  revalidatePath('/admin/menu/dinner');
  return { success: true };
}

export async function addBreakfastItem(item: {
  name: string;
  description?: string;
  price: number;
  veg_status: 'veg' | 'non-veg';
  available: boolean;
  image_url?: string;
}) {
  const adminClient = createAdminClient() as any;

  const { data: maxSort } = await adminClient
    .from('breakfast_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const { error } = await adminClient.from('breakfast_items').insert({
    ...item,
    description: item.description || null,
    image_url: item.image_url || null,
    restaurant_id: 'b2222222-2222-2222-2222-222222222222',
    sort_order: (maxSort?.sort_order || 0) + 1,
  });

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'breakfast_item_added',
    entity: 'breakfast_items',
    details: { name: item.name, price: item.price },
  });

  revalidatePath('/admin/menu/breakfast');
  return { success: true };
}

export async function updateBreakfastItem(
  id: string,
  updates: {
    name?: string;
    description?: string;
    price?: number;
    veg_status?: 'veg' | 'non-veg';
    available?: boolean;
    image_url?: string;
  }
) {
  const adminClient = createAdminClient() as any;

  const { error } = await adminClient
    .from('breakfast_items')
    .update(updates)
    .eq('id', id);

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'breakfast_item_updated',
    entity: 'breakfast_items',
    entity_id: id,
    details: updates,
  });

  revalidatePath('/admin/menu/breakfast');
  return { success: true };
}

export async function deleteBreakfastItem(id: string) {
  const adminClient = createAdminClient() as any;

  const { error } = await adminClient
    .from('breakfast_items')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  await adminClient.from('audit_logs').insert({
    action: 'breakfast_item_deleted',
    entity: 'breakfast_items',
    entity_id: id,
  });

  revalidatePath('/admin/menu/breakfast');
  return { success: true };
}
