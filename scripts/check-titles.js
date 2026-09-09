const ua = 'BrasilCars/1.0 (dealership catalog; educational use)';

const titles = [
  '2022 Honda HR-V 1.8 EX (Brazil).jpg',
  'Honda HR-V EX 2023 (front).jpg',
  '2023 Honda HR-V EXL (Brazil).jpg',
  'Honda HR-V 2022 Touring (Brazil).jpg',
  'Nissan Kicks second generation Brazil.jpg',
  'Nissan Kicks 2021 Exclusive (Brazil).jpg',
  'Nissan Kicks 2022 Advance (Chile).jpg',
  '2021 Nissan Kicks Exclusive (Mexico).jpg',
  '0 Honda City (7th generation) sedan.jpg',
  '2022 Honda City Touring (Brazil).jpg',
  'Honda City 2022 (Brazil) front.jpg',
  'Honda City Hatchback 2022 (Brazil).jpg',
  '2020 Nissan Versa Exclusive (Mexico).jpg',
  '2021 Nissan Versa Exclusive.jpg',
  'Nissan Versa 2020 Advance (Mexico).jpg',
  '2020 Nissan Versa SV Front.jpg',
  'Chevrolet Tracker 2021 (front).png',
  'Chevrolet Tracker 2021 (rear).png',
  'Chevrolet Tracker 2020 Premier (Brazil).jpg',
  'Chevrolet Tracker Premier 2021 Brazil.jpg',
  '2021 Hyundai Creta 2.0 Ultimate (Brazil) front view.png',
  '2021 Hyundai Creta 2.0 Ultimate (Brazil) rear view.png',
  '2021 Hyundai Creta 2.0 Ultimate (Brazil) interior.png',
  '2022 Hyundai Creta Platinum (Brazil).jpg',
  '2025 Toyota Corolla Cross 1.8 V HEV in Celestite Gray Metallic, front right.jpg',
  'Toyota Corolla Cross 2022 (Brazil).jpg',
  'Toyota Corolla Cross XRE 2022.jpg',
  '2022 Toyota Corolla Cross XRE (Brazil).jpg',
  'Jeep Compass 2.4 Longitude 4x4 2018.jpg',
  'Jeep Compass 2022 Longitude (Brazil).jpg',
  'Jeep Compass Sport 2022 (Brazil).jpg',
  'Brazilian Jeep Renegade.jpg',
  'Fiat Toro 2024 Volcano in Montevideo, Uruguay (front).jpg',
  'Fiat Toro 2022 1.8 Freedom in Punta del Este (front).jpg',
  '2021 Fiat Toro Freedom 1.8 4X2 - (1).jpg',
  '2021 Fiat Toro Freedom 1.8 4X2 - (2).jpg',
  'VW Virtus MSI (Brazil, front view).png',
  'Volkswagen Nivus Highline (Brazil) front view 01.png',
  'Volkswagen Nivus 2020 Highline (front).jpg',
];

async function check(batch) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&titles=' +
    encodeURIComponent(batch.map((t) => 'File:' + t).join('|')) +
    '&prop=imageinfo&iiprop=url|size|dimensions&iiurlwidth=200&format=json';
  const res = await fetch(url, { headers: { 'User-Agent': ua } });
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  for (const page of Object.values(data.query?.pages || {})) {
    const ok = page.imageinfo?.[0];
    console.log((ok ? 'OK ' : 'NO ') + String(page.title || '').replace(/^File:/, ''));
  }
}

(async () => {
  for (let i = 0; i < titles.length; i += 12) {
    await new Promise((r) => setTimeout(r, 2000));
    await check(titles.slice(i, i + 12));
  }
})();
