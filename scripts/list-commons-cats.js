const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const cats = [
  'Honda HR-V',
  'Nissan Kicks',
  'Volkswagen Nivus',
  'Volkswagen Virtus',
  'Honda City (7th generation)',
  'Fiat Cronos',
  'Nissan Versa',
  'Fiat Toro',
  'Hyundai Creta',
  'Chevrolet Tracker (2019)',
  'Toyota Corolla Cross',
  'Jeep Compass (MP)',
  'Chevrolet Onix',
  'Volkswagen Polo VI',
];

async function members(title) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=' +
    encodeURIComponent('Category:' + title) +
    '&cmtype=file&cmlimit=15&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  return (data.query?.categorymembers || []).map((m) => m.title.replace(/^File:/, ''));
}

(async () => {
  for (const c of cats) {
    try {
      await new Promise((r) => setTimeout(r, 2800));
      const rows = await members(c);
      console.log('\n==', c);
      for (const t of rows.slice(0, 10)) console.log(' -', t);
    } catch (e) {
      console.log('ERR', c, e.message);
    }
  }
})();
