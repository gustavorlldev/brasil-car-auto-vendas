import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brl', standalone: true })
export class BrlPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) {
      return '—';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}

@Pipe({ name: 'km', standalone: true })
export class KmPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) {
      return '—';
    }
    if (value === 0) {
      return '0 km';
    }
    return `${new Intl.NumberFormat('pt-BR').format(value)} km`;
  }
}

@Pipe({ name: 'phoneBr', standalone: true })
export class PhoneBrPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return value;
  }
}
