import { DatePipe } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  async login(): Promise<void> {
    const ok = await this.visits.unlockAdmin(this.pin);
    this.error.set(ok ? '' : this.visits.loadError() || 'Senha incorreta.');
    this.pin = '';
  }

  logout(): void {
    this.selected.set(null);
    this.visits.lockAdmin();
  }

  open(visit: LocationVisit): void {
    this.selected.set(visit);
  }

  close(): void {
    this.selected.set(null);
  }

  value(text: string | number | null | undefined): string {
    if (text === null || text === undefined || text === '') {
      return '—';
    }
    return String(text);
  }

  deviceLabel(visit: LocationVisit): string {
    return [visit.device, visit.os, visit.browser].filter((part) => !!part).join(' · ');
  }

  mapUrl(visit: LocationVisit): string {
    return `https://www.openstreetmap.org/?mlat=${visit.lat}&mlon=${visit.lng}#map=17/${visit.lat}/${visit.lng}`;
  }

  googleMapsUrl(visit: LocationVisit): string {
    return `https://www.google.com/maps?q=${visit.lat},${visit.lng}`;
  }

  embedUrl(visit: LocationVisit): SafeResourceUrl {
    const d = 0.008;
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${visit.lng - d}%2C${visit.lat - d}%2C${visit.lng + d}%2C${visit.lat + d}&layer=mapnik&marker=${visit.lat}%2C${visit.lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
