export type FuelType = 'flex' | 'gasolina' | 'diesel' | 'hibrido' | 'eletrico';
export type Transmission = 'manual' | 'automatico' | 'cvt';
export type BodyType = 'hatch' | 'sedan' | 'suv' | 'pickup' | 'coupe' | 'minivan';
export type Condition = 'novo' | 'seminovo' | 'usado';

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  modelYear: number;
  price: number;
  fipePrice?: number;
  mileage: number;
  fuel: FuelType;
  transmission: Transmission;
  body: BodyType;
  color: string;
  doors: number;
  engine: string;
  horsepower: number;
  condition: Condition;
  description: string;
  features: string[];
  images: string[];
  featured?: boolean;
  createdAt: string;
  views: number;
  acceptsTrade?: boolean;
  singleOwner?: boolean;
  plate: string;
}

export interface VehicleFilters {
  q?: string;
  brand?: string;
  model?: string;
  body?: BodyType | '';
  fuel?: FuelType | '';
  transmission?: Transmission | '';
  condition?: Condition | '';
  minPrice?: number | null;
  maxPrice?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  maxMileage?: number | null;
  sort?: 'recent' | 'price-asc' | 'price-desc' | 'km-asc' | 'year-desc';
}

export interface FinancingResult {
  installment: number;
  total: number;
  interestAmount: number;
}
