const fs = require('fs');
const path = require('path');

const dest = path.join('public', 'cars-listing');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const jobs = [
  {
    key: 'strada',
    titles: ['Fiat Strada Volcano interior.jpg', 'Fiat Strada 2020 Volcano dashboard.jpg'],
    queries: ['Fiat Strada Volcano interior', 'Fiat Strada 2020 interior'],
    must: /strada/i,
    reject: /argo|mobi|pulse|toro|cronos/i,
  },
  {
    key: 'polo',
    titles: [
      '2018 Volkswagen Polo 1.6 MSi Trendline (Brazil, rear).jpg',
      'Volkswagen Polo Mk6 Highline interior.jpg',
    ],
    queries: ['Volkswagen Polo Brazil rear', 'Volkswagen Polo Highline interior'],
    must: /polo/i,
    reject: /virtus|nivus|t-cross|tcross|golf/i,
  },
  {
    key: 'onix',
    titles: ['Chevrolet Onix RS interior.jpg', 'Chevrolet Onix Turbo RS interior.jpg'],
    queries: ['Chevrolet Onix RS interior', 'Chevrolet Onix Turbo interior'],
    must: /onix/i,
    reject: /plus|tracker|montana|prisma/i,
  },
  {
    key: 'compass',
    titles: ['Jeep Compass 2018 interior.jpg', 'Jeep Compass Longitude dashboard.jpg'],
    queries: ['Jeep Compass 2018 interior', 'Jeep Compass dashboard Brazil'],
    must: /compass/i,
    reject: /renegade|commander|wrangler|limited/i,
  },
  {
    key: 'creta',
    titles: [
      '2021 Hyundai Creta 2.0 Ultimate (Brazil) interior 01.png',
      '2021 Hyundai Creta 2.0 Ultimate (Brazil) interior.png',
    ],
    queries: ['Hyundai Creta Brazil interior', '2021 Hyundai Creta Ultimate interior'],
    must: /creta/i,
    reject: /hb20|tucson|ix35/i,
  },
  {
    key: 'corolla',
    titles: ['Toyota Corolla 2.0 XEi interior.jpg', '2020 Toyota Corolla interior Brazil.jpg'],
    queries: ['Toyota Corolla XEi interior Brazil', 'Toyota Corolla E210 interior'],
    must: /corolla/i,
    reject: /cross|hybrid saloon|camry/i,
  },
  {
    key: 'corolla-cross',
    titles: ['Toyota Corolla Cross interior.jpg', '2022 Toyota Corolla Cross dashboard.jpg'],
    queries: ['Toyota Corolla Cross interior', 'Toyota Corolla Cross dashboard'],
    must: /corolla.cross|corolla cross/i,
    reject: /hybrid saloon|camry/i,
  },
  {
    key: 'saveiro',
    titles: ['Volkswagen Saveiro Cross interior.jpg', 'VW Saveiro Cross dashboard.jpg'],
    queries: ['Volkswagen Saveiro interior', 'VW Saveiro Cross interior'],
    must: /saveiro/i,
    reject: /saveiro.?amarok|amarok/i,
  },
  {
    key: 'kwid',
    titles: ['Renault Kwid Outsider (Brazil, interior).png', 'Renault Kwid Outsider interior.png'],
    queries: ['Renault Kwid Outsider interior', 'Renault Kwid interior Brazil'],
    must: /kwid/i,
    reject: /sandero|kwid.?e-tech|duster/i,
  },
  {
    key: 'kicks',
    titles: ['Nissan Kicks Advance interior.jpg', 'Nissan Kicks 2021 interior.jpg'],
    queries: ['Nissan Kicks interior Brazil', 'Nissan Kicks Advance interior'],
    must: /kicks/i,
    reject: /versa|sentra|march/i,
  },
  {
    key: 'city',
    titles: ['Honda City sedan interior.jpg', 'Honda City 7th generation interior.jpg'],
    queries: ['Honda City sedan interior Brazil', 'Honda City 2021 interior'],
    must: /city/i,
    reject: /malaysia|malaysia|civic|hr-v|hrv/i,
  },
  {
    key: 'cronos',
    titles: ['Fiat Cronos Drive interior.jpg', 'Fiat Cronos Precision interior.jpg'],
    queries: ['Fiat Cronos interior', 'Fiat Cronos Drive interior'],
    must: /cronos/i,
    reject: /argo|argo.?trekking|mobi/i,
  },
  {
    key: 'renegade',
    titles: ['Jeep Renegade Longitude interior.jpg', 'Jeep Renegade interior Brazil.jpg'],
    queries: ['Jeep Renegade interior Brazil', 'Jeep Renegade Longitude interior'],
    must: /renegade/i,
    reject: /compass|wrangler|commander/i,
  },
  {
    key: 'onix-plus',
    titles: [
      '2022 Chevrolet Onix Plus 1.0 Premier (interior).jpg',
      'Chevrolet Onix Plus Premier interior.jpg',
    ],
    queries: ['Chevrolet Onix Plus Premier interior', 'Chevrolet Onix Plus interior'],
    must: /onix.?plus|onix plus/i,
    reject: /tracker|montana/i,
  },
  {
    key: 'dolphin',
    titles: ['BYD Dolphin interior.jpg', 'BYD Dolphin Plus interior.jpg'],
    queries: ['BYD Dolphin Plus interior', 'BYD Dolphin dashboard'],
    must: /dolphin/i,
    reject: /atto|seal|yuan|song|han/i,
  },
  {
    key: 'versa',
    titles: ['2020 Nissan Versa SR interior.jpg', 'Nissan Versa 2020 interior.jpg'],
    queries: ['Nissan Versa SR interior', 'Nissan Versa 2020 interior'],
    must: /versa/i,
    reject: /n17|kicks|sentra|almera/i,
  },
  {
    key: 'toro',
    titles: ['Fiat Toro Freedom interior.jpg', 'Fiat Toro Volcano interior.jpg'],
    queries: ['Fiat Toro Freedom interior', 'Fiat Toro Volcano interior'],
    must: /toro/i,
    reject: /strada|pulse|argo/i,
  },
  {
    key: 'hb20',
    titles: ['2023 Hyundai HB20 1.0 T-GDi Platinum Plus (Brazil) interior 02.png'],
    queries: ['Hyundai HB20 interior Brazil', 'Hyundai HB20 dashboard'],
    must: /hb20/i,
    reject: /creta|tucson/i,
  },
];

const skip = /logo|icon|svg|diagram|drawing|cutaway|emblem|\.pdf|\.djvu|engine bay|motor|badge/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fileInfo(title) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent('File:' + title) +
    '&prop=imageinfo&iiprop=url|mime|size|dimensions&iiurlwidth=1600&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('api ' + res.status);
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info || page.missing !== undefined) return null;
  return {
    title,
    src: String(info.thumburl || info.url || '').replace(/[?].*$/, ''),
    w: info.width || 0,
  };
}

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime|size|dimensions&iiurlwidth=1600&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('search ' + res.status);
  const data = await res.json();
  return Object.values(data.query?.pages || {}).map((p) => {
    const info = p.imageinfo?.[0] || {};
    return {
      title: String(p.title || '').replace(/^File:/, ''),
      src: String(info.thumburl || info.url || '').replace(/[?].*$/, ''),
      w: info.width || 0,
    };
  });
}

async function download(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('dl ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 25000) throw new Error('tiny ' + buf.length);
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

function nextSlot(key) {
  let slot = 1;
  while (fs.existsSync(path.join(dest, `${key}-${slot}.jpg`))) slot += 1;
  return slot;
}

(async () => {
  fs.mkdirSync(dest, { recursive: true });
  const metaPath = path.join(dest, 'meta.json');
  const rows = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : [];
  const usedTitles = new Set(rows.map((m) => String(m.title || '').toLowerCase()));

  for (const job of jobs) {
    const wanted = 2;
    let added = 0;
    const candidates = [];

    for (const title of job.titles) {
      try {
        await sleep(2800);
        const info = await fileInfo(title);
        if (info?.src && info.w >= 700) candidates.push(info);
        else console.log(job.key, 'missing', title);
      } catch (e) {
        console.log(job.key, title, e.message);
      }
    }

    if (candidates.length < wanted) {
      for (const q of job.queries) {
        try {
          await sleep(3800);
          const found = (await search(q)).filter(
            (p) =>
              job.must.test(p.title) &&
              !job.reject.test(p.title) &&
              !skip.test(p.title) &&
              p.w >= 700 &&
              p.src &&
              !usedTitles.has(p.title.toLowerCase()),
          );
          for (const item of found) {
            if (!candidates.some((c) => c.title === item.title)) candidates.push(item);
          }
        } catch (e) {
          console.log(job.key, q, e.message);
        }
      }
    }

    for (const picked of candidates) {
      if (added >= wanted) break;
      if (usedTitles.has(picked.title.toLowerCase())) continue;
      const slot = nextSlot(job.key);
      const file = `${job.key}-${slot}.jpg`;
      const destPath = path.join(dest, file);
      try {
        const size = await download(picked.src, destPath);
        const skipPlate = /interior|dashboard|cockpit|cabin/i.test(picked.title);
        rows.push({ file, title: picked.title, skipPlate });
        usedTitles.add(picked.title.toLowerCase());
        added += 1;
        console.log(file, size, skipPlate ? 'interior' : 'extra', picked.title);
      } catch (e) {
        console.log(file, e.message);
      }
    }

    if (!added) console.log(job.key, 'NO EXTRA');
  }

  fs.writeFileSync(metaPath, JSON.stringify(rows, null, 2));
  console.log('extras-done');
})();
