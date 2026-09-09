export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: 'particular' | 'revenda';
  createdAt: string;
}

export interface AuthSession {
  user: User;
  password: string;
}
