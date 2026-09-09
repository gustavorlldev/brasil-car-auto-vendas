import { Injectable, computed, signal } from '@angular/core';

const KEY = 'bcav_favorites';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly ids = signal<string[]>(this.read());

  readonly count = computed(() => this.ids().length);
  readonly list = this.ids.asReadonly();

  has(id: string): boolean {
    return this.ids().includes(id);
  }

  toggle(id: string): void {
    this.ids.update((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  private read(): string[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }
}
