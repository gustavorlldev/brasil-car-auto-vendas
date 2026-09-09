const fs = require('fs');
const path = require('path');

const dest = path.join('public', 'cars-listing');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const extras = {
  strada: ['Fiat Strada Volcano interior', 'Fiat Strada 2020 interior'],
  polo: ['Volkswagen Polo Highline interior Brazil', 'Volkswagen Polo Mk6 interior'],
  onix: ['Chevrolet Onix RS interior', 'Chevrolet Onix Turbo interior'],
  argo: ['Fiat Argo Trekking interior', 'Fiat Argo 1.3 interior'],
  tcross: ['Volkswagen T-Cross interior', 'Volkswagen T-Cross Comfortline interior'],
  compass: ['Jeep Compass Longitude interior', 'Jeep Compass dashboard'],
  creta: ['2021 Hyundai Creta 2.0 Ultimate (Brazil) interior'],
  corolla: ['Toyota Corolla XEi interior Brazil', 'Toyota Corolla E210 interior'],
  'corolla-cross': ['Toyota Corolla Cross interior', 'Toyota Corolla Cross dashboard'],
  saveiro: ['Volkswagen Saveiro interior', 'VW Saveiro Cross interior'],
  kwid: ['Renault Kwid Outsider interior', 'Renault Kwid interior Brazil'],
  mobi: ['Fiat Mobi interior', 'Fiat Mobi Like interior'],
  kicks: ['Nissan Kicks interior Brazil', 'Nissan Kicks Advance interior'],
  nivus: ['Volkswagen Nivus Highline interior', 'Volkswagen Nivus interior'],
  virtus: ['Volkswagen Virtus interior', 'VW Virtus Highline interior'],
  city: ['Honda City sedan interior', 'Honda City Touring interior'],
  cronos: ['Fiat Cronos interior', 'Fiat Cronos Drive interior'],
  renegade: ['Jeep Renegade interior Brazil', 'Jeep Renegade Longitude interior'],
  'onix-plus': ['Chevrolet Onix Plus Premier interior', 'Chevrolet Onix Plus interior'],
  montana: ['Chevrolet Montana Premier interior', 'Chevrolet Montana 2023 interior'],
  dolphin: ['BYD Dolphin interior', 'BYD Dolphin Plus interior'],
  versa: ['Nissan Versa interior', 'Nissan Versa SR interior'],
  toro: ['Fiat Toro interior', 'Fiat Toro Freedom interior'],
};

const skip = /logo|icon|svg|diagram|drawing|cutaway|emblem|\.pdf|\.djvu|engine bay|motor/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|mime|size|dimensions&iiurlwidth=1600&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('search ' + res.status);
  const data = await res.json();
  return Object.values(data.query?.pages || {})
    .map((p) => {
      const info = p.imageinfo?.[0] || {};
      return {
        title: String(p.title || '').replace(/^File:/, ''),
        src: String(info.thumburl || info.url || '').replace(/[?].*$/, ''),
        w: info.width || 0,
      };
    })
    .filter((p) => /interior|dashboard|cockpit|cabin/i.test(p.title) && !skip.test(p.title) && p.w >= 700 && p.src);
}

async function download(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('dl ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25000) throw new Error('tiny ' + buf.length);
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

(async () => {
  fs.mkdirSync(dest, { recursive: true });
  const metaPath = path.join(dest, 'meta.json');
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : [];

  for (const [key, queries] of Object.entries(extras)) {
    let slot = 1;
    while (fs.existsSync(path.join(dest, `${key}-${slot}.jpg`))) slot += 1;
    const file = `${key}-${slot}.jpg`;
    const destPath = path.join(dest, file);
    if (fs.existsSync(destPath)) {
      console.log(file, 'exists');
      continue;
    }
    let picked = null;
    for (const q of queries) {
      try {
        await sleep(4200);
        const rows = await search(q);
        picked = rows[0];
        if (picked) break;
      } catch (e) {
        console.log(key, q, e.message);
      }
    }
    if (!picked) {
      console.log(key, 'NO INTERIOR');
      continue;
    }
    try {
      const size = await download(picked.src, destPath);
      meta.push({ file, title: picked.title, skipPlate: true });
      console.log(file, size, picked.title);
    } catch (e) {
      console.log(file, e.message);
    }
  }

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log('done');
})();
