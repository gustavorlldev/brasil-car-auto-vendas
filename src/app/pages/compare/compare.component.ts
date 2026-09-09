import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BODY_LABELS, CONDITION_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from '../../core/constants/catalog';
import { BrlPipe, KmPipe } from '../../core/pipes/format.pipes';
import { CompareService } from '../../core/services/compare.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { LicensePlateComponent } from '../../shared/license-plate/license-plate.component';

@Component({
  selector: 'app-compare',
  imports: [RouterLink, BrlPipe, KmPipe, LicensePlateComponent],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss',
})
export class CompareComponent {
  private readonly compare = inject(CompareService);
  private readonly vehicles = inject(VehicleService);

  readonly labels = { fuel: FUEL_LABELS, transmission: TRANSMISSION_LABELS, body: BODY_LABELS, condition: CONDITION_LABELS };

  readonly cars = computed(() =>
    this.compare.list()
      .map((id) => this.vehicles.byId(id))
      .filter((v): v is NonNullable<typeof v> => !!v),
  );

  remove(id: string): void {
    this.compare.toggle(id);
  }
}
