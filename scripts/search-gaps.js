const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const queries = [
  'Honda HR-V 2022 Brazil',
  'Honda HR-V EX Brazil',
  'Nissan Kicks 2022',
  'Nissan Kicks Advance',
  'Honda City 2022 sedan',
  'Honda City 7th',
  'Nissan Versa 2020 sedan',
  'Nissan Versa 2021 SV',
  'Chevrolet Tracker 2021',
  'Toyota Corolla Cross 2022',
  'Jeep Compass 2018',
  'Volkswagen Nivus Highline 2022',
  'Volkswagen Virtus Highline Brazil',
  'Honda HR-V interior',
];

const skip = /\.pdf|\.djvu|logo|icon|engine|svg/i;

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=dimensions&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  return Object.values(data.query?.pages || {})
    .map((p) => String(p.title || '').replace(/^File:/, ''))
    .filter((t) => !skip.test(t));
}

(async () => {
  for (const q of queries) {
    try {
      await new Promise((r) => setTimeout(r, 3200));
      const rows = await search(q);
      console.log('\n==', q);
      for (const t of rows.slice(0, 6)) console.log(' -', t);
    } catch (e) {
      console.log('ERR', q, e.message);
    }
  }
})();
