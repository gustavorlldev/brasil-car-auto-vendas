import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BRANDS } from '../../core/constants/catalog';
import { COMPANY, COMPANY_WHATSAPP } from '../../core/constants/company';
import { Vehicle } from '../../core/models/vehicle.model';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleCardComponent } from '../../shared/vehicle-card/vehicle-card.component';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, VehicleCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly router = inject(Router);
  readonly vehicles = inject(VehicleService);
  readonly company = COMPANY;
  readonly whatsapp = COMPANY_WHATSAPP('estoque da loja');
  brands = BRANDS;
  q = '';
  brand = '';
  maxPrice: number | null = null;

  categories = [
    { label: '0 km', query: { condition: 'novo' }, image: '/cars/onix-1.jpg' },
    { label: 'SUVs', query: { body: 'suv' }, image: '/cars/tcross-1.jpg' },
    { label: 'Picapes', query: { body: 'pickup' }, image: '/cars/strada-1.jpg' },
    { label: 'Hatches', query: { body: 'hatch' }, image: '/cars/polo-1.jpg' },
    { label: 'Até R$ 100 mil', query: { maxPrice: 100000 }, image: '/cars/mobi-1.jpg' },
    { label: 'Sedãs', query: { body: 'sedan' }, image: '/cars/corolla-1.jpg' },
  ];

  steps = [
    { n: '01', title: 'Escolha no estoque', text: 'Filtre o pátio da Brasil Cars por marca, preço, km e carroceria.' },
    { n: '02', title: 'Compare e simule', text: 'Salve favoritos, compare até 3 carros e veja a parcela no simulador.' },
    { n: '03', title: 'Feche com a loja', text: 'Chame no WhatsApp, agende test-drive e retire na nossa loja em Blumenau.' },
  ];

  testimonials = [
    { name: 'Ana Beatriz', city: 'Blumenau, SC', text: 'Comprei um HB20 na Brasil Cars. Atendimento claro e carro entregue revisado.' },
    { name: 'Marcos Pires', city: 'Indaial, SC', text: 'Troquei meu usado numa Strada da loja. Processo rápido e documentação resolvida.' },
    { name: 'Juliana Costa', city: 'Pomerode, SC', text: 'O simulador e o test-drive me ajudaram a fechar o T-Cross certo para a família.' },
  ];

  search(): void {
    this.router.navigate(['/comprar'], {
      queryParams: {
        q: this.q || null,
        brand: this.brand || null,
        maxPrice: this.maxPrice || null,
      },
    });
  }

  featured(): Vehicle[] {
    return this.vehicles.featured();
  }
}
