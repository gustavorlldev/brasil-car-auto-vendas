const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const queries = [
  'Chevrolet Onix RS',
  'Chevrolet Onix hatch São Paulo',
  'Jeep Compass Longitude',
  'Jeep Compass Sport Brazil',
  'Toyota Corolla XEi Brazil',
  'Toyota Corolla Cross XRE',
  'Volkswagen Saveiro Extreme',
  'Chevrolet Tracker Premier Brazil',
  'Renault Kwid Outsider',
  'Fiat Mobi Like',
  'Honda HR-V EXL Brazil',
  'Nissan Kicks Exclusive',
  'Volkswagen Nivus Highline',
  'Volkswagen Virtus Highline',
  'Honda City Touring Brazil',
  'Fiat Cronos Precision',
  'Jeep Renegade Longitude',
  'Chevrolet Onix Plus Premier',
  'Chevrolet Montana Premier',
  'BYD Dolphin Plus',
  'Nissan Versa Exclusive',
  'Fiat Toro Endurance',
  'Hyundai Creta Platinum Brazil',
];

const skip = /logo|icon|svg|diagram|drawing|cutaway|emblem|\.pdf|\.djvu/i;

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime|size|dimensions&iiurlwidth=1400&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  return pages
    .map((p) => {
      const info = p.imageinfo?.[0] || {};
      return {
        title: String(p.title || '').replace(/^File:/, ''),
        w: info.width,
        h: info.height,
      };
    })
    .filter((p) => !skip.test(p.title) && (p.w || 0) >= 800);
}

(async () => {
  for (const q of queries) {
    try {
      await new Promise((r) => setTimeout(r, 2500));
      const rows = await search(q);
      console.log('\n==', q);
      for (const r of rows.slice(0, 5)) {
        console.log(' -', r.title, r.w + 'x' + r.h);
      }
    } catch (e) {
      console.log('ERR', q, e.message);
    }
  }
})();
