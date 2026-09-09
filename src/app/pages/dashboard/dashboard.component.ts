import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrlPipe } from '../../core/pipes/format.pipes';
import { AuthService } from '../../core/services/auth.service';
import { VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, BrlPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly auth = inject(AuthService);
  readonly vehicles = inject(VehicleService);

  readonly ads = computed(() => {
    const user = this.auth.user();
    return user ? this.vehicles.byOwner(user.id) : [];
  });
}
