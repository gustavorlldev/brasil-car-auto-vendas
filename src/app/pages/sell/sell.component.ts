import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  BODY_LABELS,
  BRANDS,
  CONDITION_LABELS,
  FUEL_LABELS,
  STATES,
  TRANSMISSION_LABELS,
} from '../../core/constants/catalog';
import { BodyType, Condition, FuelType, Transmission } from '../../core/models/vehicle.model';
import { AuthService } from '../../core/services/auth.service';
import { VehicleService } from '../../core/services/vehicle.service';

@Component({
  selector: 'app-sell',
  imports: [ReactiveFormsModule],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.scss',
})
export class SellComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly vehicles = inject(VehicleService);
  private readonly router = inject(Router);

  step = signal(1);
  brands = BRANDS;
  states = STATES;
  fuels = Object.entries(FUEL_LABELS);
  bodies = Object.entries(BODY_LABELS);
  transmissions = Object.entries(TRANSMISSION_LABELS);
  conditions = Object.entries(CONDITION_LABELS);

  constructor() {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({ city: user.city, state: user.state });
    }
  }

  form = this.fb.nonNullable.group({
    brand: ['', Validators.required],
    model: ['', Validators.required],
    version: ['', Validators.required],
    year: [2023, Validators.required],
    modelYear: [2023, Validators.required],
    price: [90000, [Validators.required, Validators.min(5000)]],
    mileage: [0, [Validators.required, Validators.min(0)]],
    fuel: ['flex' as FuelType, Validators.required],
    transmission: ['automatico' as Transmission, Validators.required],
    body: ['sedan' as BodyType, Validators.required],
    color: ['', Validators.required],
    doors: [4, Validators.required],
    engine: ['', Validators.required],
    horsepower: [120, Validators.required],
    condition: ['seminovo' as Condition, Validators.required],
    city: ['', Validators.required],
    state: ['SP', Validators.required],
    description: ['', [Validators.required, Validators.minLength(40)]],
    features: [''],
    image: ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80'],
    acceptsTrade: [true],
    singleOwner: [true],
  });

  next(): void {
    if (this.step() < 3) {
      this.step.update((s) => s + 1);
    }
  }

  prev(): void {
    if (this.step() > 1) {
      this.step.update((s) => s - 1);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.step.set(1);
      return;
    }
    const user = this.auth.user();
    if (!user) {
      return;
    }
    const value = this.form.getRawValue();
    const created = this.vehicles.publish({
      brand: value.brand,
      model: value.model,
      version: value.version,
      year: value.year,
      modelYear: value.modelYear,
      price: value.price,
      mileage: value.mileage,
      fuel: value.fuel,
      transmission: value.transmission,
      body: value.body,
      color: value.color,
      doors: value.doors,
      engine: value.engine,
      horsepower: value.horsepower,
      condition: value.condition,
      sellerType: user.role === 'revenda' ? 'revenda' : 'particular',
      sellerName: user.name,
      sellerPhone: user.phone,
      city: value.city,
      state: value.state,
      description: value.description,
      features: value.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      images: [value.image],
      acceptsTrade: value.acceptsTrade,
      singleOwner: value.singleOwner,
      ownerId: user.id,
    });
    this.router.navigate(['/veiculo', created.slug]);
  }
}
