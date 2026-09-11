export type PlaceDetails = {
  city: string;
  state: string;
  country: string;
  neighborhood: string;
  street: string;
  postcode: string;
  address: string;
};

export type NetworkDetails = {
  ip: string;
  isp: string;
  ipCity: string;
  ipRegion: string;
  ipCountry: string;
};

export type DeviceDetails = {
  device: string;
  os: string;
  browser: string;
  language: string;
  languages: string;
  timezone: string;
  screen: string;
  referrer: string;
  pageUrl: string;
  userAgent: string;
  connection: string;
  platform: string;
  cores: string;
  memory: string;
};

const clip = (value: string, max: number): string => value.trim().slice(0, max);

const text = (data: Record<string, unknown>, key: string): string => String(data[key] ?? '');

export function collectDeviceDetails(): DeviceDetails {
  const ua = navigator.userAgent;
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
    deviceMemory?: number;
  };
  return {
    device: detectDevice(ua),
    os: detectOs(ua),
    browser: detectBrowser(ua),
    language: clip(navigator.language || '', 40),
    languages: clip((navigator.languages || []).join(', '), 80),
    timezone: clip(Intl.DateTimeFormat().resolvedOptions().timeZone || '', 80),
    screen: `${window.screen.width}x${window.screen.height}@${Math.round(window.devicePixelRatio || 1)}x`,
    referrer: clip(document.referrer || '', 500),
    pageUrl: clip(window.location.href || '', 500),
    userAgent: clip(ua, 500),
    connection: clip(nav.connection?.effectiveType || '', 40),
    platform: clip(navigator.platform || '', 80),
    cores: navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : '',
    memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : '',
  };
}

export async function collectNetworkDetails(): Promise<NetworkDetails> {
  const empty: NetworkDetails = { ip: '', isp: '', ipCity: '', ipRegion: '', ipCountry: '' };
  try {
    const data = await fetchJson('https://ipapi.co/json/', 5000);
    if (data && typeof data === 'object' && data['error'] == null) {
      return {
        ip: clip(text(data, 'ip'), 64),
        isp: clip(text(data, 'org') || text(data, 'asn'), 160),
        ipCity: clip(text(data, 'city'), 120),
        ipRegion: clip(text(data, 'region'), 120),
        ipCountry: clip(text(data, 'country_name') || text(data, 'country'), 80),
      };
    }
  } catch {
    // fall through to ipify
  }

  try {
    const data = await fetchJson('https://api.ipify.org?format=json', 4000);
    return { ...empty, ip: clip(text(data, 'ip'), 64) };
  } catch {
    return empty;
  }
}

export function parseNominatimPlace(data: {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    suburb?: string;
    neighbourhood?: string;
    city_district?: string;
    road?: string;
    pedestrian?: string;
    postcode?: string;
  };
}): PlaceDetails {
  const a = data.address || {};
  return {
    city: clip(a.city || a.town || a.village || a.municipality || '', 120),
    state: clip(a.state || '', 120),
    country: clip(a.country || '', 80),
    neighborhood: clip(a.suburb || a.neighbourhood || a.city_district || '', 120),
    street: clip(a.road || a.pedestrian || '', 160),
    postcode: clip(a.postcode || '', 20),
    address: clip(data.display_name || '', 400),
  };
}

function detectDevice(ua: string): string {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) {
    return 'Celular';
  }
  return 'Computador';
}

function detectOs(ua: string): string {
  if (/Windows NT 10/i.test(ua)) return 'Windows 10/11';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Outro';
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return 'Opera';
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet';
  return 'Outro';
}

async function fetchJson(url: string, timeoutMs: number): Promise<Record<string, unknown>> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) {
      throw new Error('net');
    }
    return (await res.json()) as Record<string, unknown>;
  } finally {
    window.clearTimeout(timer);
  }
}
