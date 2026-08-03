import { NextResponse } from 'next/server';
import { scrapeMcDonaldsMenu } from '@/lib/menu-scraper';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const { items, source, error } = await scrapeMcDonaldsMenu();

    if (error || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: error || 'Live scraping blocked by provider. Fallback menu active.',
        source: 'database_fallback',
      });
    }

    const adminClient = createAdminClient() as any;

    for (const item of items) {
      await adminClient.from('dinner_items').upsert(
        {
          name: item.name,
          description: item.description || null,
          price: item.price,
          category: item.category,
          veg_status: item.veg_status,
          platform: item.platform,
          image_url: item.image_url || null,
          available: true,
        },
        { onConflict: 'name' }
      );
    }

    await adminClient.from('audit_logs').insert({
      action: 'menu_refreshed_live',
      entity: 'dinner_items',
      details: { itemCount: items.length, source },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${items.length} items from ${source}`,
      source,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Menu refresh failed' },
      { status: 500 }
    );
  }
}
