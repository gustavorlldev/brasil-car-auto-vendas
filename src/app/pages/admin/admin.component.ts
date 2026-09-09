import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { COMPANY } from '../../core/constants/company';
import { LocationVisit } from '../../core/models/visit.model';
import { VisitService } from '../../core/services/visit.service';

@Component({
  selector: 'app-admin',
  imports: [FormsModule, DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  readonly visits = inject(VisitService);
  readonly company = COMPANY;
  private readonly sanitizer = inject(DomSanitizer);
  pin = '';
  error = signal('');
  selected = signal<LocationVisit | null>(null);

  async login(): Promise<void> {
    const ok = await this.visits.unlockAdmin(this.pin);
    this.error.set(ok ? '' : this.visits.loadError() || 'Senha incorreta.');
    this.pin = '';
  }

  select(visit: LocationVisit): void {
    this.selected.set(visit);
  }

  mapUrl(visit: LocationVisit): string {
    return `https://www.openstreetmap.org/?mlat=${visit.lat}&mlon=${visit.lng}#map=14/${visit.lat}/${visit.lng}`;
  }

  embedUrl(visit: LocationVisit): SafeResourceUrl {
    const d = 0.04;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${visit.lng - d}%2C${visit.lat - d}%2C${visit.lng + d}%2C${visit.lat + d}&layer=mapnik&marker=${visit.lat}%2C${visit.lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
