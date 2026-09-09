import { Component, input } from '@angular/core';

@Component({
  selector: 'app-license-plate',
  templateUrl: './license-plate.component.html',
  styleUrl: './license-plate.component.scss',
})
export class LicensePlateComponent {
  plate = input.required<string>();
  store = input('BRASIL CARS');
  compact = input(false);
  overlay = input(false);
}
