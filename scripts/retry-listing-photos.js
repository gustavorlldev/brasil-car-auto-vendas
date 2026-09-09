const fs = require('fs');
const path = require('path');

const dest = path.join('public', 'cars-raw');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';
const { cars } = require('./listing-photo-map');

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
  await sleep(25000);
  fs.mkdirSync(dest, { recursive: true });
  const metaPath = path.join(dest, 'meta.json');
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : [];
  const have = new Set(meta.map((m) => m.file));

  for (const [key, titles] of Object.entries(cars)) {
    let n = [1, 2, 3].filter((i) => fs.existsSync(path.join(dest, `${key}-${i}.jpg`))).length;
    if (n >= Math.min(3, titles.length)) {
      console.log(key, 'ok', n);
      continue;
    }
    for (const title of titles) {
      if (n >= 3) break;
      const already = meta.find((m) => m.title === title);
      if (already && fs.existsSync(path.join(dest, already.file))) continue;
      try {
        await sleep(4500);
        const info = await thumbUrl(title);
        n += 1;
        const file = `${key}-${n}.jpg`;
        if (fs.existsSync(path.join(dest, file)) && have.has(file)) {
          continue;
        }
        const size = await download(info.src, path.join(dest, file));
        meta.push({ file, title, skipPlate: info.skipPlate });
        console.log(file, size, info.skipPlate ? 'interior' : '');
      } catch (e) {
        console.log(key, title.slice(0, 55), e.message);
        await sleep(4000);
      }
    }
  }
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log('retry-done', meta.length);
})();
