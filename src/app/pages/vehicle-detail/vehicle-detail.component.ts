import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BODY_LABELS, CONDITION_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from '../../core/constants/catalog';
import { COMPANY, COMPANY_WHATSAPP } from '../../core/constants/company';
import { BrlPipe, KmPipe, PhoneBrPipe } from '../../core/pipes/format.pipes';
import { CompareService } from '../../core/services/compare.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleCardComponent } from '../../shared/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-vehicle-detail',
  imports: [RouterLink, FormsModule, BrlPipe, KmPipe, PhoneBrPipe, VehicleCardComponent],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.scss',
})
export class VehicleDetailComponent {
  slug = input.required<string>();

  private readonly vehicles = inject(VehicleService);
  readonly favorites = inject(FavoriteService);
  readonly compare = inject(CompareService);
  readonly company = COMPANY;

  readonly labels = {
    fuel: FUEL_LABELS,
    transmission: TRANSMISSION_LABELS,
    body: BODY_LABELS,
    condition: CONDITION_LABELS,
  };

  activeImage = signal(0);
  downPayment = signal(0);
  months = signal(48);

  readonly vehicle = computed(() => this.vehicles.bySlug(this.slug()));
  readonly related = computed(() => {
    const v = this.vehicle();
    return v ? this.vehicles.related(v) : [];
  });
  readonly finance = computed(() => {
    const v = this.vehicle();
    if (!v) {
      return null;
    }
    const down = this.downPayment() || Math.round(v.price * 0.2);
    return this.vehicles.simulateFinancing(v.price, down, this.months());
  });
  readonly fipeDiff = computed(() => {
    const v = this.vehicle();
    if (!v?.fipePrice) {
      return null;
    }
    return v.price - v.fipePrice;
  });

  constructor() {
    effect(() => {
      this.slug();
      this.activeImage.set(0);
    });
  }

  setImage(index: number): void {
    this.activeImage.set(index);
  }

  prevImage(): void {
    const total = this.vehicle()?.images.length ?? 1;
    this.activeImage.update((i) => (i - 1 + total) % total);
  }

  nextImage(): void {
    const total = this.vehicle()?.images.length ?? 1;
    this.activeImage.update((i) => (i + 1) % total);
  }

  published(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  whatsapp(model: string): string {
    return COMPANY_WHATSAPP(model);
  }

  defaultDown(price: number): number {
    return this.downPayment() || Math.round(price * 0.2);
  }
}
