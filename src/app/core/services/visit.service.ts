import { Injectable, NgZone, computed, inject, signal } from '@angular/core';
import { COMPANY } from '../constants/company';
import { GeoConsent, LocationVisit } from '../models/visit.model';
import { BrasilCarsVisitRow } from '../supabase/database.types';
import { supabase } from '../supabase/supabase.client';
import { collectDeviceDetails, collectNetworkDetails, parseNominatimPlace } from '../utils/visitor-context';

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
  private loadPromptStarted = false;
  private lastPath = '/';

  readonly visits = signal<LocationVisit[]>([]);
  readonly consent = signal<GeoConsent>(this.readConsent());
  readonly capturing = signal(false);
  readonly loading = signal(false);
  readonly lastError = signal('');
  readonly loadError = signal('');
  readonly adminUnlocked = signal(this.readAdmin());

  readonly recent = computed(() => this.visits().slice(0, 200));
  readonly cities = computed(() => new Set(this.visits().map((v) => v.city || v.label).filter(Boolean)).size);
  readonly phones = computed(() => this.visits().filter((v) => v.device === 'Celular').length);

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

    if (state === 'denied') {
      this.deny();
      return;
    }

    const android = /Android/i.test(navigator.userAgent);
    if (android && this.consent() === 'accepted') {
      this.consent.set('unknown');
      localStorage.removeItem(CONSENT_KEY);
    }

    this.promptOnLoad();
  }

  private promptOnLoad(): void {
    if (this.loadPromptStarted || this.consent() === 'accepted' || this.consent() === 'denied') {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    this.loadPromptStarted = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.zone.run(() => {
          this.grantAccess();
          void this.saveVisit(this.lastPath, position);
        });
      },
      () => undefined,
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 0,
      },
    );
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
    if ((path || '/').startsWith('/admin')) {
      return;
    }
    const lat = Number(position.coords.latitude.toFixed(5));
    const lng = Number(position.coords.longitude.toFixed(5));
    const [place, network] = await Promise.all([this.reverseGeocode(lat, lng), collectNetworkDetails()]);
    const device = collectDeviceDetails();
    const visit = {
      lat,
      lng,
      accuracy: position.coords.accuracy ? Math.round(position.coords.accuracy) : null,
      city: place.city,
      state: place.state,
      country: place.country,
      neighborhood: place.neighborhood,
      street: place.street,
      postcode: place.postcode,
      address: place.address,
      label: [place.city, place.state].filter(Boolean).join(' / ') || 'Localização aproximada',
      path,
      km_from_store: this.kmFromStore(lat, lng),
      device: device.device,
      os: device.os,
      browser: device.browser,
      language: device.language,
      timezone: device.timezone,
      screen: device.screen,
      referrer: device.referrer,
      page_url: device.pageUrl,
      ip: network.ip,
      isp: network.isp,
      ip_city: network.ipCity,
      ip_region: network.ipRegion,
      ip_country: network.ipCountry,
      user_agent: device.userAgent,
      connection: device.connection,
      platform: device.platform,
      languages: device.languages,
      cores: device.cores,
      memory: device.memory,
      altitude: Number.isFinite(position.coords.altitude) ? Number(position.coords.altitude?.toFixed(1)) : null,
      heading: Number.isFinite(position.coords.heading) ? Number(position.coords.heading?.toFixed(1)) : null,
      speed: Number.isFinite(position.coords.speed) ? Number(position.coords.speed?.toFixed(1)) : null,
    };

    const { error } = await supabase.from('brasil_cars_visits').insert(visit);
    if (error) {
      const { error: fallbackError } = await supabase.from('brasil_cars_visits').insert({
        lat: visit.lat,
        lng: visit.lng,
        accuracy: visit.accuracy,
        city: visit.city,
        state: visit.state,
        country: visit.country,
        label: visit.label,
        path: visit.path,
        km_from_store: visit.km_from_store,
      });
      if (fallbackError) {
        return;
      }
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
      neighborhood: row.neighborhood || '',
      street: row.street || '',
      postcode: row.postcode || '',
      address: row.address || '',
      label: row.label,
      path: row.path,
      at: row.at,
      kmFromStore: row.km_from_store == null ? null : Number(row.km_from_store),
      device: row.device || '',
      os: row.os || '',
      browser: row.browser || '',
      language: row.language || '',
      timezone: row.timezone || '',
      screen: row.screen || '',
      referrer: row.referrer || '',
      pageUrl: row.page_url || '',
      ip: row.ip || '',
      isp: row.isp || '',
      ipCity: row.ip_city || '',
      ipRegion: row.ip_region || '',
      ipCountry: row.ip_country || '',
      userAgent: row.user_agent || '',
      connection: row.connection || '',
      platform: row.platform || '',
      languages: row.languages || '',
      cores: row.cores || '',
      memory: row.memory || '',
      altitude: row.altitude == null ? null : Number(row.altitude),
      heading: row.heading == null ? null : Number(row.heading),
      speed: row.speed == null ? null : Number(row.speed),
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

  private async reverseGeocode(lat: number, lng: number) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        throw new Error('geo');
      }
      return parseNominatimPlace(await res.json());
    } catch {
      return parseNominatimPlace({});
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
