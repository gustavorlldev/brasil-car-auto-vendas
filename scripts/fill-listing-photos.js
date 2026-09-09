const fs = require('fs');
const path = require('path');
const { cars } = require('./listing-photo-map');

const dest = path.join('public', 'cars-listing');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const force = new Set([
  'hb20',
  'argo',
  'pulse',
  'corolla',
  'tracker',
  'kwid',
  'mobi',
  'kicks',
  'nivus',
  'virtus',
  'city',
  'onix-plus',
  'montana',
  'toro',
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function thumbUrl(title) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent('File:' + title) +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1600&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('api ' + res.status);
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) throw new Error('missing');
  return {
    src: String(info.thumburl || info.url).replace(/[?].*$/, ''),
    skipPlate: /interior|cockpit|dashboard/i.test(title),
  };
}

async function download(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('dl ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 30000) throw new Error('tiny ' + buf.length);
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

(async () => {
  await sleep(20000);
  fs.mkdirSync(dest, { recursive: true });
  const metaPath = path.join(dest, 'meta.json');
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : [];

  for (const [key, titles] of Object.entries(cars)) {
    for (let i = 0; i < titles.length; i++) {
      const file = `${key}-${i + 1}.jpg`;
      const destPath = path.join(dest, file);
      if (fs.existsSync(destPath) && !force.has(key)) {
        continue;
      }
      const title = titles[i];
      try {
        await sleep(5000);
        const info = await thumbUrl(title);
        const size = await download(info.src, destPath);
        const row = meta.find((m) => m.file === file);
        if (row) {
          row.title = title;
          row.skipPlate = info.skipPlate;
        } else {
          meta.push({ file, title, skipPlate: info.skipPlate });
        }
        console.log(file, size, info.skipPlate ? 'interior' : '');
      } catch (e) {
        console.log(file, e.message);
        await sleep(6000);
      }
    }
  }
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log('fill-done');
})();
