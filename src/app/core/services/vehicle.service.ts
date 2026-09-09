import { Injectable, computed, signal } from '@angular/core';
import { VEHICLES } from '../data/vehicles.data';
import { FinancingResult, Vehicle, VehicleFilters } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly catalog = signal<Vehicle[]>(VEHICLES);

  readonly all = computed(() => this.catalog());
  readonly featured = computed(() => this.all().filter((v) => v.featured).slice(0, 8));
  readonly brands = computed(() =>
    [...new Set(this.all().map((v) => v.brand))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  );

  byId(id: string): Vehicle | undefined {
    return this.catalog().find((v) => v.id === id);
  }

  bySlug(slug: string): Vehicle | undefined {
    return this.catalog().find((v) => v.slug === slug);
  }

  related(vehicle: Vehicle, limit = 4): Vehicle[] {
    return this.all()
      .filter((v) => v.id !== vehicle.id && (v.brand === vehicle.brand || v.body === vehicle.body))
      .slice(0, limit);
  }

  search(filters: VehicleFilters): Vehicle[] {
    let list = this.all();
    const q = filters.q?.trim().toLowerCase();

    if (q) {
      list = list.filter((v) => `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(q));
    }
    if (filters.brand) {
      list = list.filter((v) => v.brand === filters.brand);
    }
    if (filters.model) {
      list = list.filter((v) => v.model.toLowerCase() === filters.model!.toLowerCase());
    }
    if (filters.body) {
      list = list.filter((v) => v.body === filters.body);
    }
    if (filters.fuel) {
      list = list.filter((v) => v.fuel === filters.fuel);
    }
    if (filters.transmission) {
      list = list.filter((v) => v.transmission === filters.transmission);
    }
    if (filters.condition) {
      list = list.filter((v) => v.condition === filters.condition);
    }
    if (filters.minPrice != null) {
      list = list.filter((v) => v.price >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
      list = list.filter((v) => v.price <= filters.maxPrice!);
    }
    if (filters.minYear != null) {
      list = list.filter((v) => v.modelYear >= filters.minYear!);
    }
    if (filters.maxYear != null) {
      list = list.filter((v) => v.modelYear <= filters.maxYear!);
    }
    if (filters.maxMileage != null) {
      list = list.filter((v) => v.mileage <= filters.maxMileage!);
    }

    switch (filters.sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'km-asc':
        return [...list].sort((a, b) => a.mileage - b.mileage);
      case 'year-desc':
        return [...list].sort((a, b) => b.modelYear - a.modelYear);
      default:
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }

  modelsByBrand(brand: string): string[] {
    return [...new Set(this.all().filter((v) => v.brand === brand).map((v) => v.model))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    );
  }

  simulateFinancing(price: number, downPayment: number, months: number, monthlyRate = 0.0149): FinancingResult {
    const principal = Math.max(price - downPayment, 0);
    if (principal === 0 || months <= 0) {
      return { installment: 0, total: downPayment, interestAmount: 0 };
    }
    const i = monthlyRate;
    const installment = (principal * i) / (1 - Math.pow(1 + i, -months));
    const total = installment * months + downPayment;
    return {
      installment,
      total,
      interestAmount: total - price,
    };
  }
}
