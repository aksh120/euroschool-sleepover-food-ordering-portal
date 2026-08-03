import { NextResponse, type NextRequest } from 'next/server';
import { scrapeMcDonaldsMenu, parseSwiggyDapiPayload, type ScrapedMenuItem } from '@/lib/menu-scraper';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    let items: ScrapedMenuItem[] = [];
    let source = 'Swiggy Wakad DAPI';

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      // Body may be empty for automated refresh
    }

    if (body?.payload) {
      console.log('Received raw Swiggy DAPI payload in request body');
      items = parseSwiggyDapiPayload(body.payload);
      source = 'Live Swiggy Browser DAPI Import';
    } else {
      const result = await scrapeMcDonaldsMenu();
      if (result.items && result.items.length > 0) {
        items = result.items;
        source = result.source;
      } else {
        return NextResponse.json({
          success: false,
          message: result.error || 'Live scraping blocked by Cloudflare. Use JSON import below to sync payload.',
          source: 'database_fallback',
        });
      }
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No items parsed from payload. Verify valid Swiggy DAPI JSON structure.',
      });
    }

    const adminClient = createAdminClient() as any;

    let upsertedCount = 0;
    for (const item of items) {
      const { error } = await adminClient.from('dinner_items').upsert(
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

      if (!error) {
        upsertedCount++;
      }
    }

    await adminClient.from('audit_logs').insert({
      action: 'menu_refreshed_live',
      entity: 'dinner_items',
      details: { itemCount: upsertedCount, source },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${upsertedCount} live items from ${source}`,
      itemCount: upsertedCount,
      source,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Menu refresh failed' },
      { status: 500 }
    );
  }
}
