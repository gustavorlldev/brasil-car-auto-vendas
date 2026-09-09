const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const queries = [
  'Volkswagen Virtus Brazil',
  'Volkswagen Nivus Brazil',
  'Volkswagen Saveiro Brazil pickup',
  'Renault Kwid Brazil',
  'Fiat Mobi Brazil',
  'Chevrolet Tracker Brazil',
  'Fiat Cronos sedan',
  'Fiat Toro Brazil pickup',
  'Nissan Kicks Brazil',
  'Honda HR-V Brazil',
  'Hyundai Creta Brazil SUV',
  'Jeep Compass 2022 Brazil',
  'Toyota Corolla XEi Brazil',
  'Toyota Corolla Cross Brazil',
  'Nissan Versa Brazil',
  'Fiat Strada Volcano Brazil',
  'Hyundai HB20X Brazil',
  'Volkswagen T-Cross Brazil 2022',
];

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  return Object.values(data.query?.pages || {}).map((p) => p.title);
}

(async () => {
  for (const q of queries) {
    try {
      await new Promise((r) => setTimeout(r, 2200));
      const rows = await search(q);
      console.log('\n==', q);
      rows.forEach((t) => console.log(' -', t));
    } catch (e) {
      console.log(q, e.message);
    }
  }
})();
