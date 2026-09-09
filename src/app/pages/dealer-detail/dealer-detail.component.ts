import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealerService } from '../../core/services/dealer.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleCardComponent } from '../../shared/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-dealer-detail',
  imports: [RouterLink, VehicleCardComponent],
  templateUrl: './dealer-detail.component.html',
  styleUrl: './dealer-detail.component.scss',
})
export class DealerDetailComponent {
  slug = input.required<string>();
  private readonly dealers = inject(DealerService);
  private readonly vehicles = inject(VehicleService);

  readonly dealer = computed(() => this.dealers.bySlug(this.slug()));
  readonly stock = computed(() => {
    const dealer = this.dealer();
    return dealer ? this.vehicles.byDealer(dealer.id) : [];
  });
}
