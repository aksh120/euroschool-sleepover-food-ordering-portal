/**
 * Swiggy & Zomato Menu Scraper & Parser Utility
 * Target Restaurant: McDonald's W-Biz Wakad, Pune (ID: 772299)
 * API URL: https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=18.5987&lng=73.7684&restaurantId=772299
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

/**
 * Extracts and normalizes menu items from Swiggy DAPI JSON payload
 */
export function parseSwiggyDapiPayload(data: any): ScrapedMenuItem[] {
  const items: ScrapedMenuItem[] = [];
  const cards = data?.data?.cards || [];

  function extractItemCards(cardList: any[], categoryName = 'Burgers') {
    for (const catCard of cardList) {
      const title = catCard?.card?.card?.title || categoryName;
      const itemCards = catCard?.card?.card?.itemCards;
      const categories = catCard?.card?.card?.categories;

      if (itemCards && Array.isArray(itemCards)) {
        for (const itemObj of itemCards) {
          const info = itemObj?.card?.info;
          if (info && info.name && (info.price !== undefined || info.defaultPrice !== undefined)) {
            const rawName = info.name.replace(/[®™]/g, '').trim();
            const rawPrice = ((info.price !== undefined ? info.price : info.defaultPrice) || 0) / 100;
            const imageId = info.imageId || info.cloudinaryImageId || info.mediaId || '';

            items.push({
              name: rawName,
              description: info.description || '',
              price: rawPrice,
              category: title,
              veg_status: info.isVeg ? 'veg' : 'non-veg',
              platform: 'swiggy',
              image_url: imageId
                ? (imageId.startsWith('http') ? imageId : `https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/${imageId}`)
                : undefined,
            });
          }
        }
      }

      if (categories && Array.isArray(categories)) {
        extractItemCards(categories, title);
      }
    }
  }

  for (const card of cards) {
    const regularCards = card?.groupedCard?.cardGroupMap?.REGULAR?.cards;
    if (regularCards) {
      extractItemCards(regularCards);
    }
  }

  return items;
}

/**
 * Fetch live Swiggy DAPI for McDonald's Wakad (ID: 772299)
 */
export async function scrapeMcDonaldsMenu(): Promise<{ items: ScrapedMenuItem[]; source: string; error?: string }> {
  try {
    const swiggyUrl = 'https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=18.5987&lng=73.7684&restaurantId=772299';

    const res = await fetch(swiggyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.swiggy.com/city/pune/mcdonalds-w-biz-wakad-rest772299',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        items: [],
        source: 'fallback',
        error: `Swiggy API responded with status ${res.status}. Use JSON import to sync live payload.`,
      };
    }

    const data = await res.json();
    const items = parseSwiggyDapiPayload(data);

    if (items.length === 0) {
      return { items: [], source: 'fallback', error: 'No menu items extracted from API payload.' };
    }

    return { items, source: 'Swiggy Wakad DAPI' };
  } catch (err: any) {
    return {
      items: [],
      source: 'fallback',
      error: `Connection error: ${err.message || 'Failed to connect to Swiggy API'}.`,
    };
  }
}
