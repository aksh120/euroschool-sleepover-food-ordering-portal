import fs from 'fs';

async function main() {
  const url = 'https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=18.5987&lng=73.7684&restaurantId=772299';
  console.log('Fetching live Swiggy DAPI from:', url);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.swiggy.com/city/pune/mcdonalds-w-biz-wakad-rest772299',
        'Origin': 'https://www.swiggy.com',
        'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
    });

    console.log('HTTP Response Status:', res.status);
    const text = await res.text();
    console.log('Response length:', text.length);

    if (res.status === 200) {
      const data = JSON.parse(text);
      fs.writeFileSync('live_swiggy_772299.json', JSON.stringify(data, null, 2));
      console.log('Saved to live_swiggy_772299.json!');
    } else {
      console.log('Swiggy returned non-200 status:', res.status, text.slice(0, 200));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

main();
