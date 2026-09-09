export type GeoConsent = 'unknown' | 'accepted' | 'denied';

export interface LocationVisit {
  id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  city: string;
  state: string;
  country: string;
  label: string;
  path: string;
  at: string;
  kmFromStore: number | null;
}
