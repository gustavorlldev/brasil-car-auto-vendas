import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../core/services/favorite.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleCardComponent } from '../../shared/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, VehicleCardComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent {
  private readonly favorites = inject(FavoriteService);
  private readonly vehicles = inject(VehicleService);

  readonly list = computed(() =>
    this.favorites.list()
      .map((id) => this.vehicles.byId(id))
      .filter((v): v is NonNullable<typeof v> => !!v),
  );
}
