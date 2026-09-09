import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  open = signal<number | null>(0);

  items = [
    {
      q: 'A Brasil Cars é um marketplace?',
      a: 'Não. Somos uma loja única. Todos os carros do site pertencem ao estoque da Brasil Cars, em Blumenau (SC).',
    },
    {
      q: 'Como falo com a loja?',
      a: 'Pelo WhatsApp, telefone (47) 3333-2026 ou no pátio da Rua 7 de Setembro, 1.215 — Centro, Blumenau.',
    },
    {
      q: 'Os carros têm garantia?',
      a: 'Seminovos saem com garantia da loja de até 12 meses. 0 km segue a garantia de fábrica.',
    },
    {
      q: 'O simulador de financiamento é uma proposta?',
      a: 'É uma simulação ilustrativa de CDC. As condições finais saem após análise de crédito na loja.',
    },
    {
      q: 'As fotos mostram o veículo completo?',
      a: 'As fotos são do estoque da loja. Identificações do veículo ficam ocultas no anúncio e a documentação é apresentada na visita ao pátio.',
    },
  ];

  toggle(index: number): void {
    this.open.set(this.open() === index ? null : index);
  }
}
