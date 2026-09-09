const fs = require('fs');
const path = require('path');

const dir = path.join('public', 'cars');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const files = [
  ['onix-hatch', 'Chevrolet Onix Turbo RS 2024.jpg'],
  ['virtus-1', 'VW Virtus MSI (Brazil, front view).png'],
  ['virtus-2', '2024 Volkswagen Virtus 1.6 MSi Trendline (facelift).jpg'],
  ['nivus-1', 'Volkswagen Nivus Highline (Brazil) front view 01.png'],
  ['kwid-1', 'Renault Kwid Outsider (Brazil, front).png'],
  ['kwid-2', '2018 Renault Kwid 1.0 SCe Iconic (Brazil), frontal view.jpg'],
  ['mobi-1', '2022 Fiat Mobi 1.0 Trekking.jpg'],
  ['tracker-1', 'Chevrolet Tracker 2021 (front).png'],
  ['cronos-1', '2024 Fiat Cronos 1.3 GSE Precision.jpg'],
  ['cronos-2', '2024 Fiat Cronos 1.3 GSE S-Design (front).jpg'],
  ['kicks-1', 'Nissan Kicks second generation Brazil.jpg'],
  ['hrv-1', '2022 Honda HR-V 1.8 EX (Brazil).jpg'],
  ['dolphin-1', 'BYD Dolphin Plus 2024 DVA.jpg'],
  ['saveiro-2', 'Volkswagen Saveiro Cross.jpg'],
  ['creta-1', '2024 Hyundai Creta 1.5 MPi SX(O) (India) front view.png'],
];

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
  return String(info.thumburl || info.url).replace(/[?].*$/, '');
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error('dl ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 40000) throw new Error('tiny ' + buf.length);
  fs.writeFileSync(dest, buf);
  return buf.length;
}

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  for (const [key, title] of files) {
    try {
      await sleep(2500);
      const src = await thumbUrl(title);
      const size = await download(src, path.join(dir, `${key}.jpg`));
      console.log(key, size);
    } catch (e) {
      console.log(key, e.message);
    }
  }
})();
