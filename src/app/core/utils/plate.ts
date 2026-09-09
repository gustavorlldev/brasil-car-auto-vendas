export function makeFakePlate(seed: number): string {
  const digit = String((seed % 9) + 1);
  const series = 'ABCDEFGHJKLMNPRSTUVXYZ'[seed % 20];
  const last = String(seed % 100).padStart(2, '0');
  return `BCA${digit}${series}${last}`;
}
