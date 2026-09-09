export const COMPANY = {
  name: 'Brasil Cars',
  legalName: 'Brasil Cars Auto Vendas',
  phone: '4733332026',
  whatsapp: '5547993332026',
  email: 'contato@brasilcars.com.br',
  city: 'Blumenau',
  state: 'SC',
  address: 'Rua 7 de Setembro, 1.215 — Centro, Blumenau/SC',
  hours: 'Seg a sáb, 8h às 20h',
  lat: -26.9194,
  lng: -49.0661,
  adminPin: '2026',
} as const;

export const COMPANY_WHATSAPP = (model: string) => {
  const text = encodeURIComponent(
    `Olá, Brasil Cars! Tenho interesse no ${model} do estoque de vocês em Blumenau.`,
  );
  return `https://wa.me/${COMPANY.whatsapp}?text=${text}`;
};
