const fs = require('fs');
const path = require('path');

const dest = path.join('public', 'cars-listing');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const gaps = [
  ['pulse-1', '2023 Fiat Pulse Impetus (Colombia) front view 01.jpg', true],
  ['pulse-2', '2023 Fiat Pulse Impetus (Colombia) rear view.jpg', false],
  ['pulse-3', '2023 Fiat Pulse Impetus (Colombia) interior.jpg', true],
  ['tracker-2', 'Chevrolet Tracker 2021 (rear).png', false],
  ['tracker-3', 'Chevrolet Tracker 2021 (interior).png', true],
  ['kwid-2', 'Renault Kwid Outsider (Brazil, rear).png', false],
  ['kicks-3', '2022 Nissan Kicks e-Power AUTECH.jpg', false],
  ['nivus-1', '2022 Volkswagen Nivus 200 TSi Highline.jpg', false],
  ['city-2', 'Honda City SV 2020.jpg', false],
  ['mobi-3', 'Fiat Mobi Like 1.0 Fire flex.jpg', false],
  ['pulse-1b', '2022 Fiat Pulse Impetus T200 (Brazil) front view.png', false],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function thumbUrl(title) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent('File:' + title) +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1200&format=json';
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
  if (buf.length < 20000) throw new Error('tiny ' + buf.length);
  fs.writeFileSync(destPath, buf);
  return buf.length;
}

(async () => {
  await sleep(15000);
  for (const [file, title] of gaps) {
    const name = file.replace(/b$/, '') + '.jpg';
    const destPath = path.join(dest, name);
    if (fs.existsSync(destPath) && !file.startsWith('pulse') && file !== 'pulse-1b') {
      console.log(name, 'exists');
      continue;
    }
    if (file === 'pulse-1b' && fs.existsSync(path.join(dest, 'pulse-1.jpg'))) {
      console.log('pulse-1 already');
      continue;
    }
    try {
      await sleep(6000);
      const info = await thumbUrl(title);
      const size = await download(info.src, destPath);
      console.log(name, size, info.skipPlate ? 'interior' : title.slice(0, 40));
    } catch (e) {
      console.log(name, e.message);
      await sleep(5000);
    }
  }
  console.log('gaps-done');
})();
