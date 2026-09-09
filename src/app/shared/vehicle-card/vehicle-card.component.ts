import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BODY_LABELS, CONDITION_LABELS, FUEL_LABELS } from '../../core/constants/catalog';
import { Vehicle } from '../../core/models/vehicle.model';
import { BrlPipe, KmPipe } from '../../core/pipes/format.pipes';
import { CompareService } from '../../core/services/compare.service';
import { FavoriteService } from '../../core/services/favorite.service';
@Component({
  selector: 'app-vehicle-card',
  imports: [RouterLink, BrlPipe, KmPipe],
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.scss',
})
export class VehicleCardComponent {
  vehicle = input.required<Vehicle>();

  readonly favorites = inject(FavoriteService);
  readonly compare = inject(CompareService);

  readonly condition = computed(() => CONDITION_LABELS[this.vehicle().condition]);
  readonly fuel = computed(() => FUEL_LABELS[this.vehicle().fuel]);
  readonly body = computed(() => BODY_LABELS[this.vehicle().body]);

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
