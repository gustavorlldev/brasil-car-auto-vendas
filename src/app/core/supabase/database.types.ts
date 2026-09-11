export type BrasilCarsVisitRow = {
  id: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  city: string;
  state: string;
  country: string;
  neighborhood: string;
  street: string;
  postcode: string;
  address: string;
  label: string;
  path: string;
  at: string;
  km_from_store: number | null;
  device: string;
  os: string;
  browser: string;
  language: string;
  timezone: string;
  screen: string;
  referrer: string;
  page_url: string;
  ip: string;
  isp: string;
  ip_city: string;
  ip_region: string;
  ip_country: string;
  user_agent: string;
  connection: string;
  platform: string;
  languages: string;
  cores: string;
  memory: string;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
};

export type Database = {
  public: {
    Tables: {
      brasil_cars_visits: {
        Row: BrasilCarsVisitRow;
        Insert: {
          id?: string;
          lat: number;
          lng: number;
          accuracy?: number | null;
          city?: string;
          state?: string;
          country?: string;
          neighborhood?: string;
          street?: string;
          postcode?: string;
          address?: string;
          label: string;
          path: string;
          at?: string;
          km_from_store?: number | null;
          device?: string;
          os?: string;
          browser?: string;
          language?: string;
          timezone?: string;
          screen?: string;
          referrer?: string;
          page_url?: string;
          ip?: string;
          isp?: string;
          ip_city?: string;
          ip_region?: string;
          ip_country?: string;
          user_agent?: string;
          connection?: string;
          platform?: string;
          languages?: string;
          cores?: string;
          memory?: string;
          altitude?: number | null;
          heading?: number | null;
          speed?: number | null;
        };
        Update: Partial<BrasilCarsVisitRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      brasil_cars_list_visits: {
        Args: { p_pin: string };
        Returns: BrasilCarsVisitRow[];
      };
      brasil_cars_clear_visits: {
        Args: { p_pin: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
