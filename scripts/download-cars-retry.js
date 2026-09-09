const fs = require('fs');
const path = require('path');

const dir = path.join('public', 'cars');
const ua = 'BrasilCarsCatalog/1.0 (educational dealership demo)';
const missing = [
  ['argo', 'Fiat_Argo'],
  ['tcross', 'Volkswagen_T-Cross'],
  ['compass', 'Jeep_Compass'],
  ['creta', 'Hyundai_Creta'],
  ['pulse', 'Fiat_Pulse'],
  ['corolla', 'Toyota_Corolla'],
  ['tracker', 'Chevrolet_Tracker'],
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
  ['civic', 'Honda_Civic'],
  ['hilux', 'Toyota_Hilux'],
  ['tiggo5x', 'Chery_Tiggo_5x'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': ua, Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(String(res.status));
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

async function summaryUrls(host, title) {
  const summary = await getJson(`${host}/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
  const urls = [];
  if (summary.originalimage?.source) {
    urls.push(summary.originalimage.source);
  }
  if (summary.thumbnail?.source) {
    urls.push(summary.thumbnail.source);
  }
  return urls;
}

(async () => {
  for (const [key, title] of missing) {
    if (fs.existsSync(path.join(dir, `${key}-1.jpg`))) {
      console.log(key, 'skip');
      continue;
    }
    try {
      await sleep(1200);
      let urls = [];
      try {
        urls = await summaryUrls('https://pt.wikipedia.org', title);
      } catch {
        urls = await summaryUrls('https://en.wikipedia.org', title);
      }
      let n = 0;
      for (const url of [...new Set(urls)].slice(0, 2)) {
        n += 1;
        try {
          const size = await download(url, path.join(dir, `${key}-${n}.jpg`));
          console.log(key, n, size);
        } catch (e) {
          console.log(key, n, e.message);
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
