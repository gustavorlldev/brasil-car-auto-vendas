const fs = require('fs');
const path = require('path');

const dir = path.join('public', 'cars');
const ua = 'BrasilCarsCatalog/1.0 (educational dealership demo)';
const missing = [
  ['montana', 'Chevrolet_Montana'],
  ['dolphin', 'BYD_Dolphin'],
  ['versa', 'Nissan_Versa'],
  ['toro', 'Fiat_Toro'],
  ['fastback', 'Fiat_Fastback'],
  ['civic', 'Honda_Civic_(eleventh_generation)'],
  ['hilux', 'Toyota_Hilux'],
  ['tiggo5x', 'Caoa_Chery_Tiggo_5X'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) {
    throw new Error(`dl ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 40000) {
    throw new Error(`tiny ${buf.length}`);
  }
  fs.writeFileSync(dest, buf);
  return buf.length;
}

(async () => {
  for (const [key, title] of missing) {
    try {
      await sleep(2500);
      const hosts = ['https://pt.wikipedia.org', 'https://en.wikipedia.org'];
      let done = false;
      for (const host of hosts) {
        if (done) {
          break;
        }
        try {
          const res = await fetch(`${host}/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
            headers: { 'User-Agent': ua },
          });
          if (!res.ok) {
            console.log(key, host, res.status);
            continue;
          }
          const summary = await res.json();
          const url = summary.originalimage?.source || summary.thumbnail?.source;
          if (!url) {
            continue;
          }
          const size = await download(url, path.join(dir, `${key}-1.jpg`));
          console.log(key, size, host);
          done = true;
        } catch (e) {
          console.log(key, host, e.message);
        }
      }
    } catch (e) {
      console.log(key, e.message);
    }
  }
})();
