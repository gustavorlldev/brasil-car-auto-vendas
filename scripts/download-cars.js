const fs = require('fs');
const path = require('path');

const dir = path.join('public', 'cars');
const ua = 'BrasilCarsCatalog/1.0 (educational dealership demo)';
const items = [
  ['strada', 'Fiat_Strada'],
  ['polo', 'Volkswagen_Polo'],
  ['onix', 'Chevrolet_Onix'],
  ['hb20', 'Hyundai_HB20'],
  ['argo', 'Fiat_Argo'],
  ['tcross', 'Volkswagen_T-Cross'],
  ['compass', 'Jeep_Compass'],
  ['creta', 'Hyundai_Creta'],
  ['pulse', 'Fiat_Pulse'],
  ['corolla', 'Toyota_Corolla'],
  ['corolla-cross', 'Toyota_Corolla_Cross'],
  ['saveiro', 'Volkswagen_Saveiro'],
  ['tracker', 'Chevrolet_Tracker'],
  ['kwid', 'Renault_Kwid'],
  ['mobi', 'Fiat_Mobi'],
  ['hrv', 'Honda_HR-V'],
  ['kicks', 'Nissan_Kicks'],
  ['nivus', 'Volkswagen_Nivus'],
  ['virtus', 'Volkswagen_Virtus'],
  ['city', 'Honda_City'],
  ['cronos', 'Fiat_Cronos'],
  ['renegade', 'Jeep_Renegade'],
  ['montana', 'Chevrolet_Montana'],
  ['dolphin', 'BYD_Dolphin'],
  ['versa', 'Nissan_Versa'],
  ['toro', 'Fiat_Toro'],
  ['fastback', 'Fiat_Fastback'],
  ['onix-plus', 'Chevrolet_Onix'],
  ['civic', 'Honda_Civic'],
  ['hilux', 'Toyota_Hilux'],
  ['tiggo5x', 'Chery_Tiggo_5x'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`${res.status} ${url}`);
  }
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) {
    throw new Error(`dl ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) {
    throw new Error(`tiny ${buf.length}`);
  }
  fs.writeFileSync(dest, buf);
  return buf.length;
}

(async () => {
  for (const [key, title] of items) {
    try {
      await sleep(400);
      const summary = await getJson(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      );
      const urls = [];
      if (summary.originalimage?.source) {
        urls.push(summary.originalimage.source);
      } else if (summary.thumbnail?.source) {
        urls.push(summary.thumbnail.source);
      }
      await sleep(200);
      try {
        const media = await getJson(
          `https://en.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(title)}`,
        );
        for (const item of media.items || []) {
          if (item.type !== 'image') {
            continue;
          }
          const src = item.srcset?.[item.srcset.length - 1]?.src || item.src;
          if (!src || /logo|icon|\.svg/i.test(src)) {
            continue;
          }
          const abs = src.startsWith('http') ? src : `https:${src}`;
          if (!urls.includes(abs)) {
            urls.push(abs);
          }
          if (urls.length >= 2) {
            break;
          }
        }
      } catch {
        /* ignore media list errors */
      }
      const unique = [...new Set(urls)].slice(0, 2);
      let n = 0;
      for (const url of unique) {
        n += 1;
        const dest = path.join(dir, `${key}-${n}.jpg`);
        try {
          const size = await download(url, dest);
          console.log(key, n, size);
        } catch (e) {
          console.log(key, n, 'fail', e.message);
          n -= 1;
        }
      }
      if (!n) {
        console.log(key, 'NONE');
      }
    } catch (e) {
      console.log(key, 'ERR', e.message);
    }
  }
})();
