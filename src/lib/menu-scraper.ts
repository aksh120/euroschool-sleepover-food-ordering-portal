/**
 * Best-effort menu scraping utility for Swiggy and Zomato
 * Target area: Euroschool Wakad ICSE, Pune (Pimpri-Chinchwad / Wakad 411057)
 */

export interface ScrapedMenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  veg_status: 'veg' | 'non-veg';
  platform: 'swiggy' | 'zomato';
  image_url?: string;
}

export async function scrapeMcDonaldsMenu(): Promise<{ items: ScrapedMenuItem[]; source: string; error?: string }> {
  try {
    // Perform fetch attempt to Swiggy endpoint for Wakad Pune McDonald's
    const swiggyUrl = 'https://www.swiggy.com/dapi/menu/v4/full?lat=18.5987&lng=73.7684&menuId=24430'; // Sample McDonald's Wakad coordinates
    
    const res = await fetch(swiggyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return {
        items: [],
        source: 'fallback',
        error: `Scraper anti-bot response (${res.status}). Using stored menu.`,
      };
    }

    const data = await res.json();
    const cards = data?.data?.cards || [];
    const scrapedItems: ScrapedMenuItem[] = [];

    // Parse items structure if present
    for (const card of cards) {
      const regularGroup = card?.groupedCard?.cardGroupMap?.REGULAR?.cards;
      if (regularGroup) {
        for (const catCard of regularGroup) {
          const itemCards = catCard?.card?.card?.itemCards;
          const categoryName = catCard?.card?.card?.title || 'Burgers';

          if (itemCards) {
            for (const itemObj of itemCards) {
              const info = itemObj?.card?.info;
              if (info) {
                scrapedItems.push({
                  name: info.name,
                  description: info.description,
                  price: (info.price || info.defaultPrice || 0) / 100,
                  category: categoryName,
                  veg_status: info.isVeg ? 'veg' : 'non-veg',
                  platform: 'swiggy',
                  image_url: info.imageId ? `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300/${info.imageId}` : undefined,
                });
              }
            }
          }
        }
      }
    }

    if (scrapedItems.length === 0) {
      return { items: [], source: 'fallback', error: 'No menu items extracted. Falling back to DB menu.' };
    }

    return { items: scrapedItems, source: 'Swiggy' };
  } catch (err: any) {
    return {
      items: [],
      source: 'fallback',
      error: `Scrape error: ${err.message || 'Connection refused'}. Falling back to DB menu.`,
    };
  }
}
