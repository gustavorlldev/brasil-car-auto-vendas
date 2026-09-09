import { BodyType, Condition, FuelType, Transmission } from '../models/vehicle.model';

export const BRANDS = [
  'BMW',
  'BYD',
  'Chevrolet',
  'Fiat',
  'Honda',
  'Hyundai',
  'Jeep',
  'Nissan',
  'Renault',
  'Toyota',
  'Volkswagen',
] as const;

export const FUEL_LABELS: Record<FuelType, string> = {
  flex: 'Flex',
  gasolina: 'Gasolina',
  diesel: 'Diesel',
  hibrido: 'Híbrido',
  eletrico: 'Elétrico',
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: 'Manual',
  automatico: 'Automático',
  cvt: 'CVT',
};

export const BODY_LABELS: Record<BodyType, string> = {
  hatch: 'Hatch',
  sedan: 'Sedã',
  suv: 'SUV',
  pickup: 'Picape',
  coupe: 'Cupê',
  minivan: 'Minivan',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  novo: '0 km',
  seminovo: 'Seminovo',
  usado: 'Usado',
};

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'km-asc', label: 'Menor km' },
  { value: 'year-desc', label: 'Mais novos' },
] as const;
