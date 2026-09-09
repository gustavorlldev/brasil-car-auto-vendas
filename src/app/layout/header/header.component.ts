import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { COMPANY, COMPANY_WHATSAPP } from '../../core/constants/company';
import { CompareService } from '../../core/services/compare.service';
import { FavoriteService } from '../../core/services/favorite.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly favorites = inject(FavoriteService);
  readonly compare = inject(CompareService);
  readonly whatsapp = COMPANY_WHATSAPP('estoque da loja');
  readonly company = COMPANY;

  menuOpen = signal(false);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen.set(false);
    });
  }
}
