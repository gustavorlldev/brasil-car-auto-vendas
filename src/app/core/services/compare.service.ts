import { Injectable, computed, signal } from '@angular/core';

const KEY = 'bcav_compare';
const LIMIT = 3;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly ids = signal<string[]>(this.read());

  readonly list = this.ids.asReadonly();
  readonly count = computed(() => this.ids().length);

  has(id: string): boolean {
    return this.ids().includes(id);
  }

  toggle(id: string): void {
    this.ids.update((current) => {
      if (current.includes(id)) {
        const next = current.filter((x) => x !== id);
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      }
      if (current.length >= LIMIT) {
        return current;
      }
      const next = [...current, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  clear(): void {
    this.ids.set([]);
    localStorage.removeItem(KEY);
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
