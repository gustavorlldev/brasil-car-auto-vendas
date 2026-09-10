import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import { COMPANY } from '../constants/company';
import { GeoConsent, LocationVisit } from '../models/visit.model';
import { BrasilCarsVisitRow } from '../supabase/database.types';
import { supabase } from '../supabase/supabase.client';

const CONSENT_KEY = 'bcav_geo_consent';
const ADMIN_KEY = 'bcav_admin';
const ADMIN_PIN_KEY = 'bcav_admin_pin';
const LAST_CAPTURE_KEY = 'bcav_last_geo';
const MIN_INTERVAL_MS = 30 * 60 * 1000;
const DENIED_HINT =
  'A localização foi bloqueada. Toque no cadeado ao lado do endereço, permita a localização e tente de novo.';

@Injectable({ providedIn: 'root' })
export class VisitService {
  private readonly zone = inject(NgZone);
  private permissionWatchStarted = false;
  private lastPath = '/';

  readonly visits = signal<LocationVisit[]>([]);
  readonly consent = signal<GeoConsent>(this.readConsent());
  readonly capturing = signal(false);
  readonly loading = signal(false);
  readonly lastError = signal('');
  readonly loadError = signal('');
  readonly adminUnlocked = signal(this.readAdmin());

  readonly recent = computed(() => this.visits().slice(0, 50));
  readonly cities = computed(() => new Set(this.visits().map((v) => v.label)).size);

  constructor() {
    if (this.adminUnlocked()) {
      void this.refreshVisits();
    }
  }

  isBlocked(path: string): boolean {
    if (path.startsWith('/admin')) {
      return false;
    }
    return this.consent() !== 'accepted';
  }

  deny(message = DENIED_HINT): void {
    this.consent.set('denied');
    localStorage.removeItem(CONSENT_KEY);
    this.lastError.set(message);
  }

  requestNow(path: string): void {
    this.lastPath = (path || '/').split('?')[0] || '/';
    if (this.lastPath.startsWith('/admin')) {
      return;
    }

    if (!window.isSecureContext) {
      this.deny('Abra o site pelo endereço seguro (https) para o celular pedir a localização.');
      return;
    }

    if (!navigator.geolocation) {
      this.deny('Este navegador não informa localização. Sem esse acesso, o site não pode ser usado.');
      return;
    }

    if (this.capturing()) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.zone.run(() => {
          this.grantAccess();
          this.capturing.set(false);
          void this.saveVisit(this.lastPath, position);
        });
      },
      (error) => {
        this.zone.run(() => {
          this.capturing.set(false);
          if (this.isPermissionDenied(error)) {
            this.deny();
            return;
          }
          this.lastError.set('Não foi possível obter a localização. Toque em permitir de novo.');
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 0,
      },
    );
    this.capturing.set(true);
  }

  ensureAccess(path: string): void {
    this.lastPath = (path || '/').split('?')[0] || '/';
    if (this.lastPath.startsWith('/admin')) {
      return;
    }

    this.watchPermission();
    void this.resumeIfAlreadyAllowed();
  }

  async unlockAdmin(pin: string): Promise<boolean> {
    const trimmed = pin.trim();
    if (trimmed !== COMPANY.adminPin) {
      this.loadError.set('Senha incorreta.');
      return false;
    }

    sessionStorage.setItem(ADMIN_PIN_KEY, trimmed);
    const ok = await this.refreshVisits();
    if (!ok) {
      sessionStorage.removeItem(ADMIN_PIN_KEY);
      return false;
    }

    this.adminUnlocked.set(true);
    sessionStorage.setItem(ADMIN_KEY, '1');
    return true;
  }

  lockAdmin(): void {
    this.adminUnlocked.set(false);
    sessionStorage.removeItem(ADMIN_KEY);
    sessionStorage.removeItem(ADMIN_PIN_KEY);
    this.visits.set([]);
    this.loadError.set('');
  }

  async refreshVisits(): Promise<boolean> {
    const pin = sessionStorage.getItem(ADMIN_PIN_KEY) || '';
    if (!pin) {
      this.loadError.set('Entre no painel para ver as visitas.');
      return false;
    }

    this.loading.set(true);
    this.loadError.set('');

    const { data, error } = await supabase.rpc('brasil_cars_list_visits', { p_pin: pin });
    this.loading.set(false);

    if (error) {
      this.loadError.set('Não foi possível carregar as visitas no servidor.');
      return false;
    }

    this.visits.set((data ?? []).map((row) => this.mapVisit(row)));
    return true;
  }

  async clearVisits(): Promise<void> {
    const pin = sessionStorage.getItem(ADMIN_PIN_KEY) || '';
    if (!pin) {
      return;
    }

    this.loading.set(true);
    this.loadError.set('');
    const { error } = await supabase.rpc('brasil_cars_clear_visits', { p_pin: pin });
    this.loading.set(false);

    if (error) {
      this.loadError.set('Não foi possível limpar as visitas no servidor.');
      return;
    }

    this.visits.set([]);
  }

  private async resumeIfAlreadyAllowed(): Promise<void> {
    if (!window.isSecureContext) {
      this.deny('Abra o site pelo endereço seguro (https) para o celular pedir a localização.');
      return;
    }

    const state = await this.permissionState();
    if (state === 'granted') {
      this.grantAccess();
      void this.captureIfGranted();
      return;
    }

    const android = /Android/i.test(navigator.userAgent);
    if (android && this.consent() === 'accepted') {
      this.consent.set('unknown');
      localStorage.removeItem(CONSENT_KEY);
    }
  }

  private async captureIfGranted(): Promise<void> {
    if (!navigator.geolocation || this.capturing()) {
      return;
    }

    const last = Number(localStorage.getItem(LAST_CAPTURE_KEY) || '0');
    if (Date.now() - last < MIN_INTERVAL_MS) {
      return;
    }

    this.capturing.set(true);
    try {
      const position = await this.readPosition();
      this.grantAccess();
      await this.saveVisit(this.lastPath, position);
    } catch {
      this.grantAccess();
    } finally {
      this.capturing.set(false);
    }
  }

  private watchPermission(): void {
    if (this.permissionWatchStarted || !navigator.permissions?.query) {
      return;
    }

    this.permissionWatchStarted = true;
    void navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        status.addEventListener('change', () => {
          this.zone.run(() => {
            if (status.state === 'granted') {
              this.grantAccess();
              void this.captureIfGranted();
              return;
            }

            if (status.state === 'denied') {
              this.deny();
            }
          });
        });
      })
      .catch(() => undefined);
  }

  private async permissionState(): Promise<PermissionState | 'unknown'> {
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      return status.state;
    } catch {
      return 'unknown';
    }
  }

  private grantAccess(): void {
    this.consent.set('accepted');
    localStorage.setItem(CONSENT_KEY, 'accepted');
  }

  private async saveVisit(path: string, position: GeolocationPosition): Promise<void> {
    const lat = Number(position.coords.latitude.toFixed(5));
    const lng = Number(position.coords.longitude.toFixed(5));
    const place = await this.reverseGeocode(lat, lng);
    const visit = {
      lat,
      lng,
      accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
      city: place.city,
      state: place.state,
      country: place.country,
      label: [place.city, place.state].filter(Boolean).join(' / ') || 'Localização aproximada',
      path,
      km_from_store: this.kmFromStore(lat, lng),
    };

    const { error } = await supabase.from('brasil_cars_visits').insert(visit);
    if (error) {
      return;
    }

    localStorage.setItem(LAST_CAPTURE_KEY, String(Date.now()));
  }

  private mapVisit(row: BrasilCarsVisitRow): LocationVisit {
    return {
      id: row.id,
      lat: row.lat,
      lng: row.lng,
      accuracy: row.accuracy,
      city: row.city,
      state: row.state,
      country: row.country,
      label: row.label,
      path: row.path,
      at: row.at,
      kmFromStore: row.km_from_store == null ? null : Number(row.km_from_store),
    };
  }

  private readPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => this.zone.run(() => resolve(position)),
        (error) => this.zone.run(() => reject(error)),
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 60000,
        },
      );
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

  private readConsent(): GeoConsent {
    return localStorage.getItem(CONSENT_KEY) === 'accepted' ? 'accepted' : 'unknown';
  }

  private readAdmin(): boolean {
    return sessionStorage.getItem(ADMIN_KEY) === '1' && !!sessionStorage.getItem(ADMIN_PIN_KEY);
  }
}
