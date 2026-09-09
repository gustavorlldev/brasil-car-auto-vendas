const fs = require('fs');
const path = require('path');

const dir = path.join('public', 'cars');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const files = [
  ['strada-1', 'Fiat Strada 2020 Volcano in Montevideo (front).jpg'],
  ['strada-2', 'Fiat Strada 2020 Volcano in Montevideo (back).jpg'],
  ['saveiro-1', 'Volkswagen Saveiro Mk8 Double Cab base black in Maldonado - front.jpg'],
  ['saveiro-2', 'VW Saveiro 1.6 doble cabina 2020 front.jpg'],
  ['kwid-1', 'Renault Kwid 1.0 Outsider 2024 (53459301692).jpg'],
  ['kwid-2', '2018 Renault Kwid 1.0 SCe Iconic (Brazil), frontal view.jpg'],
  ['virtus-1', 'Volkswagen Virtus 1.6 MSi Comfortline 2018 (45432103972).jpg'],
  ['virtus-2', '2023 Volkswagen Virtus Topline front 20230520 (cropped).jpg'],
  ['hb20-1', '2023 Hyundai HB20 1.0 T-GDi Platinum Plus (Brazil) front view.png'],
  ['pulse-1', '2023 Fiat Pulse Impetus (Colombia) front view 01.jpg'],
  ['montana-1', '2023 Chevrolet Montana LTZ front.jpg'],
  ['toro-1', 'Fiat Toro 2024 Volcano in Montevideo, Uruguay (front).jpg'],
  ['toro-2', 'Fiat Toro 2022 1.8 Freedom in Punta del Este (front).jpg'],
  ['cronos-1', '2025 Fiat Cronos 1.3 GSE Precision, facelift - 03.jpg'],
  ['tracker-1', 'Chevrolet Tracker 2021 (front).png'],
  ['city-1', '0 Honda City (7th generation) sedan.jpg'],
  ['corolla-cross-1', '2025 Toyota Corolla Cross 1.8 V HEV in Celestite Gray Metallic, front right.jpg'],
  ['nivus-1', 'Volkswagen Nivus 2020 Highline (front).jpg'],
  ['mobi-1', 'Fiat Mobi 2017 1.0 Easy (front).jpg'],
  ['argo-2', 'Fiat Argo 2017b (cropped).jpg'],
  ['onix-plus-1', 'Chevrolet Onix Plus 2020 Premier (front).jpg'],
  ['renegade-1', 'Jeep Renegade 4xe 1X7A6026.jpg'],
  ['hrv-1', 'Honda HR-V Hybrid Auto Zuerich 2021 IMG 0618.jpg'],
  ['compass-1', 'Jeep Compass (MP) PHEV Facelift 1X7A0140.jpg'],
  ['creta-1', '2024 Hyundai Creta 1.5 MPi SX(O) (India) front view.png'],
  ['dolphin-1', '2021 BYD Dolphin EV (front).jpg'],
  ['polo-2', 'Volkswagen Polo VI GTI (2021) 1X7A0344.jpg'],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function thumbUrl(title) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent('File:' + title) +
    '&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=1600&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) {
    throw new Error('api ' + res.status);
  }
  const data = await res.json();
  const page = Object.values(data.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) {
    throw new Error('missing');
  }
  return info.thumburl || info.url;
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) {
    throw new Error('dl ' + res.status);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 40000) {
    throw new Error('tiny ' + buf.length);
  }
  fs.writeFileSync(dest, buf);
  return buf.length;
}

(async () => {
  fs.mkdirSync(dir, { recursive: true });
  for (const [key, title] of files) {
    try {
      await sleep(1800);
      const src = await thumbUrl(title);
      const size = await download(urlClean(src), path.join(dir, `${key}.jpg`));
      console.log(key, size);
    } catch (e) {
      console.log(key, e.message);
    }
  }
})();

function urlClean(src) {
  return String(src).replace(/[?].*$/, '');
}
