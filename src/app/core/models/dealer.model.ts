export interface Dealer {
  id: string;
  slug: string;
  name: string;
  type: 'revenda' | 'concessionaria';
  city: string;
  state: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  rating: number;
  reviews: number;
  since: number;
  brands: string[];
  description: string;
  image: string;
  verified: boolean;
}
