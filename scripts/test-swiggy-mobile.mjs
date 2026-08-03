import fs from 'fs';

async function testMobileAPI() {
  const url = 'https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=18.5987&lng=73.7684&restaurantId=772299';
  console.log('Testing mobile user-agent for Swiggy DAPI...');

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Swiggy/4.38.0 (Android 14; Pixel 8)',
        'Accept': 'application/json',
        'Accept-Language': 'en-IN',
      },
    });

    console.log('Mobile User Agent Status:', res.status);
    const text = await res.text();
    console.log('Response length:', text.length);

    if (res.status === 200 && text.length > 0) {
      fs.writeFileSync('live_swiggy_mobile.json', text);
      console.log('SUCCESS! Saved live_swiggy_mobile.json');
    }
  } catch (err) {
    console.error(err);
  }
}

testMobileAPI();
