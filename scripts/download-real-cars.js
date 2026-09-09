const fs = require('fs');
const path = require('path');

const dir = path.join('public', 'cars');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const items = [
  ['strada', 'Fiat Strada pickup'],
  ['polo', 'Volkswagen Polo hatchback 2022'],
  ['onix', 'Chevrolet Onix hatch 2020'],
  ['hb20', 'Hyundai HB20 2023'],
  ['argo', 'Fiat Argo 2020'],
  ['tcross', 'Volkswagen T-Cross 2020'],
  ['compass', 'Jeep Compass 2022'],
  ['creta', 'Hyundai Creta 2022'],
  ['pulse', 'Fiat Pulse 2022'],
  ['corolla', 'Toyota Corolla sedan 2020'],
  ['corolla-cross', 'Toyota Corolla Cross 2022'],
  ['saveiro', 'Volkswagen Saveiro pickup'],
  ['tracker', 'Chevrolet Tracker 2021'],
  ['kwid', 'Renault Kwid 2020'],
  ['mobi', 'Fiat Mobi 2018'],
  ['hrv', 'Honda HR-V 2022'],
  ['kicks', 'Nissan Kicks 2021'],
  ['nivus', 'Volkswagen Nivus 2021'],
  ['virtus', 'Volkswagen Virtus 2020'],
  ['city', 'Honda City sedan 2022'],
  ['cronos', 'Fiat Cronos 2019'],
  ['renegade', 'Jeep Renegade 2020'],
  ['montana', 'Chevrolet Montana pickup 2023'],
  ['dolphin', 'BYD Dolphin 2023'],
  ['versa', 'Nissan Versa 2021'],
  ['toro', 'Fiat Toro pickup 2020'],
  ['onix-plus', 'Chevrolet Onix Plus sedan'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const skip = /logo|icon|svg|interior|engine|badge|diagram|drawing|cutaway|steering|dashboard|wheel only|emblem/i;

async function search(q) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
    encodeURIComponent(q) +
    '&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url|mime|size|dimensions&iiurlwidth=1600&format=json&origin=*';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) {
    throw new Error(String(res.status));
  }
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  const urls = [];
  for (const p of pages) {
    const title = p.title || '';
    if (skip.test(title)) {
      continue;
    }
    const info = p.imageinfo?.[0];
    if (!info) {
      continue;
    }
    if (info.mime && !String(info.mime).includes('jpeg') && !String(info.mime).includes('png')) {
      continue;
    }
    if ((info.width || 0) < 800 && (info.size || 0) < 80000) {
      continue;
    }
    const src = info.thumburl || info.url;
    if (src) {
      urls.push(src);
    }
    if (urls.length >= 2) {
      break;
    }
  }
  return urls;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) {
    throw new Error('dl ' + res.status);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 60000) {
    throw new Error('tiny ' + buf.length);
  }
  fs.writeFileSync(dest, buf);
  return buf.length;
}

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  for (const [key, q] of items) {
    try {
      await sleep(900);
      const urls = await search(q);
      if (!urls.length) {
        console.log(key, 'NONE');
        continue;
      }
      let n = 0;
      for (const url of urls) {
        n += 1;
        try {
          const size = await download(url, path.join(dir, `${key}-${n}.jpg`));
          console.log(key, n, size);
        } catch (e) {
          console.log(key, n, e.message);
          n -= 1;
        }
      }
    } catch (e) {
      console.log(key, 'ERR', e.message);
    }
  }
})();
