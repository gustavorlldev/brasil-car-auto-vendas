const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const queries = [
  'Chevrolet Onix hatch Brazil',
  'Chevrolet Onix RS São Paulo',
  'Volkswagen Polo Highline Brazil',
  'Fiat Strada Volcano',
  'Hyundai HB20 Brazil 2023',
  'Fiat Argo Trekking',
  'Volkswagen T-Cross Brazil',
  'Jeep Compass Brazil',
  'Hyundai Creta Brazil',
  'Fiat Pulse Impetus',
  'Toyota Corolla sedan Brazil',
  'Toyota Corolla Cross Brazil',
  'Volkswagen Saveiro Cross',
  'Chevrolet Tracker Brazil',
  'Renault Kwid Brazil',
  'Fiat Mobi Trekking',
  'Honda HR-V Brazil',
  'Nissan Kicks Brazil',
  'Volkswagen Nivus Highline',
  'Volkswagen Virtus Brazil',
  'Honda City sedan Brazil',
  'Fiat Cronos Precision',
  'Jeep Renegade Brazil',
  'Chevrolet Onix Plus Premier',
  'Chevrolet Montana Premier Brazil',
  'BYD Dolphin Plus Brazil',
  'Nissan Versa Brazil',
  'Fiat Toro Volcano',
];

const skip = /logo|icon|svg|diagram|drawing|cutaway|emblem|badge|engine bay|blueprint/i;

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|size|dimensions&iiurlwidth=1400&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  return pages
    .map((p) => {
      const info = p.imageinfo?.[0] || {};
      return {
        title: String(p.title || '').replace(/^File:/, ''),
        mime: info.mime,
        w: info.width,
        h: info.height,
      };
    })
    .filter((p) => !skip.test(p.title) && p.w >= 900);
}

(async () => {
  for (const q of queries) {
    try {
      await new Promise((r) => setTimeout(r, 700));
      const rows = await search(q);
      console.log('\n==', q);
      for (const r of rows.slice(0, 6)) {
        console.log(' -', r.title, r.w + 'x' + r.h);
      }
    } catch (e) {
      console.log('ERR', q, e.message);
    }
  }
})();
