import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompareService } from './core/services/compare.service';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { LocationConsentComponent } from './shared/location-consent/location-consent.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, RouterLink, LocationConsentComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly compare = inject(CompareService);
}
