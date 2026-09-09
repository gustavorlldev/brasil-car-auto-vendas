import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { VisitService } from '../../core/services/visit.service';

@Component({
  selector: 'app-location-consent',
  templateUrl: './location-consent.component.html',
  styleUrl: './location-consent.component.scss',
})
export class LocationConsentComponent {
  private readonly router = inject(Router);
  readonly visits = inject(VisitService);

  private readonly path = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly visible = computed(() => {
    const fromRouter = (this.path() || this.router.url || '').split('?')[0];
    const fromWindow = typeof location === 'undefined' ? '' : location.pathname;
    const path = fromRouter.startsWith('/admin') || fromWindow.startsWith('/admin') ? '/admin' : fromRouter || '/';
    return this.visits.isBlocked(path);
  });

  constructor() {
    effect((onCleanup) => {
      const locked = this.visible();
      document.body.style.overflow = locked ? 'hidden' : '';
      onCleanup(() => {
        document.body.style.overflow = '';
      });
    });

    effect(() => {
      const path = this.path() || '/';
      if (this.visits.consent() === 'accepted' && !path.startsWith('/admin')) {
        void this.visits.tryCapture(path);
      }
    });
  }

  accept(): void {
    void this.visits.accept(this.path() || '/');
  }
}
