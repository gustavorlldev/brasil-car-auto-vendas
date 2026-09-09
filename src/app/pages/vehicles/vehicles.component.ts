import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BODY_LABELS,
  BRANDS,
  CONDITION_LABELS,
  FUEL_LABELS,
  SORT_OPTIONS,
  TRANSMISSION_LABELS,
} from '../../core/constants/catalog';
import { BodyType, Condition, FuelType, Transmission, VehicleFilters } from '../../core/models/vehicle.model';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleCardComponent } from '../../shared/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-vehicles',
  imports: [FormsModule, VehicleCardComponent],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})
export class VehiclesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly catalog = inject(VehicleService);

  readonly brands = BRANDS;
  readonly fuels = Object.entries(FUEL_LABELS);
  readonly bodies = Object.entries(BODY_LABELS);
  readonly transmissions = Object.entries(TRANSMISSION_LABELS);
  readonly conditions = Object.entries(CONDITION_LABELS);
  readonly sorts = SORT_OPTIONS;

  filters = signal<VehicleFilters>({ sort: 'recent' });
  page = signal(1);
  readonly pageSize = 9;

  readonly results = computed(() => this.catalog.search(this.filters()));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.results().length / this.pageSize)));
  readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.results().slice(start, start + this.pageSize);
  });
  readonly models = computed(() =>
    this.filters().brand ? this.catalog.modelsByBrand(this.filters().brand!) : [],
  );

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.filters.set({
        q: params.get('q') || '',
        brand: params.get('brand') || '',
        model: params.get('model') || '',
        body: (params.get('body') as BodyType) || '',
        fuel: (params.get('fuel') as FuelType) || '',
        transmission: (params.get('transmission') as Transmission) || '',
        condition: (params.get('condition') as Condition) || '',
        minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : null,
        maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : null,
        minYear: params.get('minYear') ? Number(params.get('minYear')) : null,
        maxMileage: params.get('maxMileage') ? Number(params.get('maxMileage')) : null,
        sort: (params.get('sort') as VehicleFilters['sort']) || 'recent',
      });
      this.page.set(1);
    });
  }

  apply(): void {
    const f = this.filters();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: f.q || null,
        brand: f.brand || null,
        model: f.model || null,
        body: f.body || null,
        fuel: f.fuel || null,
        transmission: f.transmission || null,
        condition: f.condition || null,
        minPrice: f.minPrice || null,
        maxPrice: f.maxPrice || null,
        minYear: f.minYear || null,
        maxMileage: f.maxMileage || null,
        sort: f.sort || 'recent',
      },
    });
  }

  patch<K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]): void {
    this.filters.update((f) => ({ ...f, [key]: value, ...(key === 'brand' ? { model: '' } : {}) }));
    this.apply();
  }

  clear(): void {
    this.router.navigate(['/comprar']);
  }

  next(): void {
    this.page.update((p) => Math.min(this.totalPages(), p + 1));
  }

  prev(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }
}
