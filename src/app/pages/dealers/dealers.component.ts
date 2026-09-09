import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DealerService } from '../../core/services/dealer.service';
import { VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-dealers',
  imports: [RouterLink],
  templateUrl: './dealers.component.html',
  styleUrl: './dealers.component.scss',
})
export class DealersComponent {
  readonly dealers = inject(DealerService);
  readonly vehicles = inject(VehicleService);

  count(id: string): number {
    return this.vehicles.byDealer(id).length;
  }
}
