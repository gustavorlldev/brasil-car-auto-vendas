const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const queries = [
  ['onix', 'Chevrolet Onix Brazil'],
  ['onix2', 'Chevrolet Onix São Paulo'],
  ['strada', 'Fiat Strada Brazil'],
  ['hb20', 'Hyundai HB20 Brazil'],
  ['polo', 'Volkswagen Polo Brazil hatchback'],
  ['argo', 'Fiat Argo Brazil'],
  ['tcross', 'Volkswagen T-Cross Brazil'],
  ['compass', 'Jeep Compass Brazil'],
  ['creta', 'Hyundai Creta Brazil'],
  ['pulse', 'Fiat Pulse Brazil'],
  ['corolla', 'Toyota Corolla Brazil sedan'],
  ['corolla-cross', 'Toyota Corolla Cross Brazil'],
  ['saveiro', 'Volkswagen Saveiro Brazil'],
  ['tracker', 'Chevrolet Tracker Brazil'],
  ['kwid', 'Renault Kwid Brazil'],
  ['mobi', 'Fiat Mobi Brazil'],
  ['hrv', 'Honda HR-V Brazil'],
  ['kicks', 'Nissan Kicks Brazil'],
  ['nivus', 'Volkswagen Nivus Brazil'],
  ['virtus', 'Volkswagen Virtus Brazil'],
  ['city', 'Honda City Brazil'],
  ['cronos', 'Fiat Cronos Brazil'],
  ['renegade', 'Jeep Renegade Brazil'],
  ['montana', 'Chevrolet Montana Brazil'],
  ['dolphin', 'BYD Dolphin Brazil'],
  ['versa', 'Nissan Versa Brazil'],
  ['toro', 'Fiat Toro Brazil'],
  ['onix-plus', 'Chevrolet Onix Plus Brazil'],
];

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=6&prop=imageinfo|categories&iiprop=url|size|mime&iiurlwidth=1200&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  return pages.map((p) => ({
    title: p.title,
    cats: (p.categories || []).map((c) => c.title).join(' | '),
    w: p.imageinfo?.[0]?.width,
    size: p.imageinfo?.[0]?.size,
  }));
}

(async () => {
  for (const [key, q] of queries) {
    try {
      await new Promise((r) => setTimeout(r, 1200));
      const rows = await search(q);
      console.log('\n==', key, q);
      for (const r of rows.slice(0, 4)) {
        console.log(' -', r.title, r.w, r.size);
      }
    } catch (e) {
      console.log(key, e.message);
    }
  }
})();
