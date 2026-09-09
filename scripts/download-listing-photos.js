const fs = require('fs');
const path = require('path');

const dest = path.join('public', 'cars-listing');
const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const cars = {
  strada: [
    'Fiat Strada 2020 Volcano in Montevideo (front).jpg',
    'Fiat Strada 2020 Volcano in Montevideo (back).jpg',
    'Fiat Strada Mk6 Volcano in Uruguay - front.jpg',
  ],
  polo: [
    '2024 Volkswagen Polo 1.6 MSi Highline AT (Brazil).jpg',
    'Volkswagen Polo 1.6 MSi Highline 2023.jpg',
    '2018 Volkswagen Polo 1.6 MSi Trendline (Brazil, front).jpg',
  ],
  onix: [
    'Chevrolet Onix Turbo RS 2024 (53354238074).jpg',
    'Chevrolet Onix Mk2 RS 2020 in Maldonado - front.jpg',
    '2022 Chevrolet Onix RS 1.0 Turbo.jpg',
  ],
  hb20: [
    '2023 Hyundai HB20 1.0 T-GDi Platinum Plus (Brazil) front view.png',
    '2023 Hyundai HB20 1.0 T-GDi Platinum Plus (Brazil) rear view.png',
    '2023 Hyundai HB20 1.0 T-GDi Platinum Plus (Brazil) interior 01.png',
  ],
  argo: [
    'Fiat Argo 1.3 Trekking 2022.jpg',
    'Fiat Argo 1.3 Trekking 2020.jpg',
    'Fiat Argo 1.3 Trekking 2020 test drive.jpg',
  ],
  tcross: [
    'Volkswagen T-Cross 1.6 MSi Comfortline 2019 (Chile).jpg',
    'Volkswagen T-Cross (front view, Colombia).png',
    'Volkswagen T-Cross (rear view, Colombia).png',
  ],
  compass: [
    'Jeep Compass 2.4 Longitude 4x4 2018.jpg',
    'Chinese (GAC-FCA) Jeep Compass (MP) Longitude Yangtze Normal University 长江师范学院 (YZNU) 1of3.jpg',
    'Chinese (GAC-FCA) Jeep Compass (MP) Longitude Yangtze Normal University 长江师范学院 (YZNU) 2of3.jpg',
  ],
  creta: [
    '2021 Hyundai Creta 2.0 Ultimate (Brazil) front view.png',
    '2021 Hyundai Creta 2.0 Ultimate (Brazil) rear view.png',
  ],
  pulse: [
    '2022 Fiat Pulse Impetus T200 (Brazil) front view.png',
    '2022 Fiat Pulse Impetus T200 (Brazil) rear view.png',
    '2022 Fiat Pulse Impetus T200 (Brazil) interior.png',
  ],
  corolla: [
    '2023 Toyota Corolla 2.0 XEi (Brazil).jpg',
    'Toyota Corolla 2.0 XEi 2022.jpg',
    'Toyota Corolla 2.0 XEi 2022 (52311011473).jpg',
  ],
  'corolla-cross': [
    '2025 Toyota Corolla Cross 1.8 V HEV in Celestite Gray Metallic, front right.jpg',
    '2022 Toyota Corolla Cross L FWD, Front Left, 11-21-2021.jpg',
    'Toyota Corolla Cross Hybrid 1X7A6284.jpg',
  ],
  saveiro: [
    'Volkswagen Saveiro Mk8 Double Cab base black in Maldonado - front.jpg',
    'VW Saveiro 1.6 doble cabina 2020 front.jpg',
    'Volkswagen Saveiro Cross.jpg',
  ],
  tracker: [
    'Chevrolet Tracker 2021 (front).png',
    'Chevrolet Tracker 2021 (rear).png',
    'Chevrolet Tracker 2021 (interior).png',
  ],
  kwid: [
    'Renault Kwid Outsider (Brazil, front).png',
    'Renault Kwid Outsider (Brazil, rear).png',
    'Renault Kwid 1.0 Outsider 2022.jpg',
  ],
  mobi: [
    'Fiat Mobi 1.0 Like 2021.jpg',
    '2022 Fiat Mobi 1.0 Trekking.jpg',
    'Fiat Mobi 2017 1.0 Easy (front).jpg',
  ],
  hrv: [
    '2022 Honda HR-V 1.8 EX (Brazil).jpg',
    '2021 Honda HR-V 1.8 EX 2WD CVT.jpg',
    '2017 Honda HR-V Interior.jpg',
  ],
  kicks: [
    'Nissan Kicks second generation Brazil.jpg',
    'Nissan Kicks 1.6 Advance 2021 (52577131182).jpg',
    '2022 Nissan Kicks e-Power AUTECH (Rear).jpg',
  ],
  nivus: [
    'Volkswagen Nivus Highline (Brazil) front view 01.png',
    '2022 Volkswagen Nivus Highline 200 TSi (front).jpg',
    '2022 Volkswagen Nivus Highline 200 TSi (rear).jpg',
  ],
  virtus: [
    'VW Virtus MSI (Brazil, front view).png',
    '2024 Volkswagen Virtus 1.6 MSi Trendline (facelift).jpg',
    '2023 Volkswagen Virtus Topline rear 20230520.jpg',
  ],
  city: [
    '0 Honda City (7th generation) sedan.jpg',
    'Honda City (7th generation) sedan in Jambi City.jpg',
    'Honda City 2020.jpg',
  ],
  cronos: [
    '2024 Fiat Cronos 1.3 GSE Precision.jpg',
    '2022 Fiat Cronos 1.3 Drive GSE (front view).jpg',
    '2022 Fiat Cronos 1.3 Drive GSE (rear view).jpg',
  ],
  renegade: [
    'Brazilian Jeep Renegade.jpg',
    'Jeep Renegade 2.4 Longitude 2017 (34299903434).jpg',
    'Jeep Renegade 2.4 Longitude 4x4 2018 (40101551394).jpg',
  ],
  'onix-plus': [
    '2022 Chevrolet Onix Plus 1.0 Premier (front).jpg',
    '2022 Chevrolet Onix Plus 1.0 Premier (rear).jpg',
    '2022 Chevrolet Onix Plus 1.0 Premier (side).jpg',
  ],
  montana: [
    '2023 Chevrolet Montana Premier (Brazil) front view 01.jpg',
    '2023 Chevrolet Montana Premier (Brazil) rear view.jpg',
    'Chevrolet Montana Mk3 Premier 2023 in Maldonado.jpg',
  ],
  dolphin: [
    'BYD Dolphin Plus 2024 DVA.jpg',
    'BYD Dolphin (front) 24 September 2024.jpg',
    'BYD Dolphin (rear) 24 September 2024.jpg',
  ],
  versa: [
    '2020 Nissan Versa S 1.6l.jpg',
    '2020 Nissan Versa SR front NYIAS 2019.jpg',
    '2020 Nissan Versa SR rear NYIAS 2019.jpg',
  ],
  toro: [
    'Fiat Toro 2024 Volcano in Montevideo, Uruguay (front).jpg',
    '2021 Fiat Toro Freedom 1.8 4X2 - (1).jpg',
    '2021 Fiat Toro Freedom 1.8 4X2 - (2).jpg',
  ],
};

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
  fs.mkdirSync(dest, { recursive: true });
  const meta = [];
  for (const [key, titles] of Object.entries(cars)) {
    let n = 0;
    for (const title of titles) {
      try {
        await sleep(3800);
        const info = await thumbUrl(title);
        n += 1;
        const file = `${key}-${n}.jpg`;
        const size = await download(info.src, path.join(dest, file));
        meta.push({ file, title, skipPlate: info.skipPlate });
        console.log(file, size, info.skipPlate ? 'interior' : '');
      } catch (e) {
        console.log(key, title.slice(0, 60), e.message);
      }
    }
    if (n === 0) console.log(key, 'NONE');
  }
  fs.writeFileSync(path.join(dest, 'meta.json'), JSON.stringify(meta, null, 2));
  console.log('done', meta.length);
})();
