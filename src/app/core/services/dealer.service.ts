import { Injectable } from '@angular/core';
import { DEALERS } from '../data/dealers.data';
import { Dealer } from '../models/dealer.model';

@Injectable({ providedIn: 'root' })
export class DealerService {
  readonly all = DEALERS;

  byId(id: string): Dealer | undefined {
    return DEALERS.find((d) => d.id === id);
  }

  bySlug(slug: string): Dealer | undefined {
    return DEALERS.find((d) => d.slug === slug);
  }
}
