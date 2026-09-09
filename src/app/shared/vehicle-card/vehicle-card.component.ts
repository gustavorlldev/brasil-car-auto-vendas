import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONDITION_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from '../../core/constants/catalog';
import { Vehicle } from '../../core/models/vehicle.model';
import { BrlPipe, KmPipe } from '../../core/pipes/format.pipes';
import { CompareService } from '../../core/services/compare.service';
import { FavoriteService } from '../../core/services/favorite.service';
import { VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-vehicle-card',
  imports: [RouterLink, BrlPipe, KmPipe],
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.scss',
  host: {
    '[class.is-list]': 'layout() === "list"',
  },
})
export class VehicleCardComponent {
  vehicle = input.required<Vehicle>();
  layout = input<'grid' | 'list'>('grid');

  readonly favorites = inject(FavoriteService);
  readonly compare = inject(CompareService);
  private readonly catalog = inject(VehicleService);

  readonly condition = computed(() => CONDITION_LABELS[this.vehicle().condition]);
  readonly fuel = computed(() => FUEL_LABELS[this.vehicle().fuel]);
  readonly transmission = computed(() => TRANSMISSION_LABELS[this.vehicle().transmission]);
  readonly installment = computed(() => {
    const car = this.vehicle();
    return this.catalog.simulateFinancing(car.price, Math.round(car.price * 0.2), 48).installment;
  });

  toggleFavorite(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favorites.toggle(this.vehicle().id);
  }

  toggleCompare(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.compare.toggle(this.vehicle().id);
  }
}
