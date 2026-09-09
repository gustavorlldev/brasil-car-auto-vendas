import { Injectable, computed, signal } from '@angular/core';
import { COMPANY } from '../constants/company';
import { GeoConsent, LocationVisit } from '../models/visit.model';

const VISITS_KEY = 'bcav_visits';
const CONSENT_KEY = 'bcav_geo_consent';
const ADMIN_KEY = 'bcav_admin';
const CHANNEL = 'brasil-cars-visits';
const MIN_INTERVAL_MS = 30 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class VisitService {
  private readonly channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);

  readonly visits = signal<LocationVisit[]>(this.readVisits());
  readonly consent = signal<GeoConsent>(this.readConsent());
  readonly capturing = signal(false);
  readonly lastError = signal('');
  readonly adminUnlocked = signal(this.readAdmin());

  readonly recent = computed(() => this.visits().slice(0, 50));
  readonly cities = computed(() => new Set(this.visits().map((v) => v.label)).size);

  constructor() {
    this.channel?.addEventListener('message', () => this.visits.set(this.readVisits()));
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === VISITS_KEY) {
          this.visits.set(this.readVisits());
        }
      });
    }
  }

  shouldAsk(path: string): boolean {
    if (path.startsWith('/admin')) {
      return false;
    }
    return this.consent() === 'unknown' && !this.capturing();
  }

  deny(): void {
    this.consent.set('denied');
    localStorage.setItem(CONSENT_KEY, 'denied');
  }

  async accept(path: string): Promise<void> {
    this.consent.set('accepted');
    localStorage.setItem(CONSENT_KEY, 'accepted');
    await this.tryCapture(path);
  }

  unlockAdmin(pin: string): boolean {
    const ok = pin.trim() === COMPANY.adminPin;
    this.adminUnlocked.set(ok);
    if (ok) {
      sessionStorage.setItem(ADMIN_KEY, '1');
    }
    return ok;
  }

  lockAdmin(): void {
    this.adminUnlocked.set(false);
    sessionStorage.removeItem(ADMIN_KEY);
  }

  clearVisits(): void {
    localStorage.removeItem(VISITS_KEY);
    this.visits.set([]);
    this.channel?.postMessage('clear');
  }

  async tryCapture(path: string): Promise<void> {
    if (!navigator.geolocation) {
      this.lastError.set('Este navegador não informa localização.');
      return;
    }

    if (this.capturing()) {
      return;
    }

    const latest = this.visits()[0];
    if (latest && Date.now() - new Date(latest.at).getTime() < MIN_INTERVAL_MS) {
      return;
    }

    this.capturing.set(true);
    this.lastError.set('');

    try {
      const position = await this.readPosition();
      const lat = Number(position.coords.latitude.toFixed(5));
      const lng = Number(position.coords.longitude.toFixed(5));
      const place = await this.reverseGeocode(lat, lng);
      const visit: LocationVisit = {
        id: crypto.randomUUID(),
        lat,
        lng,
        accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
        city: place.city,
        state: place.state,
        country: place.country,
        label: [place.city, place.state].filter(Boolean).join(' / ') || 'Localização aproximada',
        path,
        at: new Date().toISOString(),
        kmFromStore: this.kmFromStore(lat, lng),
      };
      const next = [visit, ...this.visits()].slice(0, 200);
      localStorage.setItem(VISITS_KEY, JSON.stringify(next));
      this.visits.set(next);
      this.channel?.postMessage('visit');
    } catch (error) {
      this.lastError.set('Não foi possível obter a localização.');
      if (this.isPermissionDenied(error)) {
        this.deny();
      }
    } finally {
      this.capturing.set(false);
    }
  }

  private readPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 120000,
      });
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<{ city: string; state: string; country: string }> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12&addressdetails=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        throw new Error('geo');
      }
      const data = (await res.json()) as {
        address?: {
          city?: string;
          town?: string;
          village?: string;
          municipality?: string;
          state?: string;
          country?: string;
        };
      };
      const a = data.address || {};
      return {
        city: a.city || a.town || a.village || a.municipality || '',
        state: a.state || '',
        country: a.country || '',
      };
    } catch {
      return { city: '', state: '', country: '' };
    }
  }

  private kmFromStore(lat: number, lng: number): number {
    const r = 6371;
    const dLat = this.rad(lat - COMPANY.lat);
    const dLng = this.rad(lng - COMPANY.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.rad(COMPANY.lat)) * Math.cos(this.rad(lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * r * Math.asin(Math.sqrt(a)) * 10) / 10;
  }

  private rad(value: number): number {
    return (value * Math.PI) / 180;
  }

  private isPermissionDenied(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && Number((error as { code: number }).code) === 1;
  }

  private readVisits(): LocationVisit[] {
    try {
      const raw = localStorage.getItem(VISITS_KEY);
      return raw ? (JSON.parse(raw) as LocationVisit[]) : [];
    } catch {
      return [];
    }
  }

  private readConsent(): GeoConsent {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw === 'accepted' || raw === 'denied' ? raw : 'unknown';
  }

  private readAdmin(): boolean {
    return sessionStorage.getItem(ADMIN_KEY) === '1';
  }
}
