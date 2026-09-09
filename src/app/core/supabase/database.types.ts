export type BrasilCarsVisitRow = {
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
  km_from_store: number | null;
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
          label: string;
          path: string;
          at?: string;
          km_from_store?: number | null;
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
