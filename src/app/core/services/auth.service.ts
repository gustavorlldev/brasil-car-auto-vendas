import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

const USERS_KEY = 'bcav_users';
const SESSION_KEY = 'bcav_session';

interface StoredUser extends User {
  password: string;
}

const DEMO_USER: StoredUser = {
  id: 'u-demo',
  name: 'Carlos Silva',
  email: 'maria.s@example.com',
  phone: '11999990000',
  city: 'São Paulo',
  state: 'SP',
  role: 'particular',
  createdAt: '2026-01-10',
  password: 'demo123',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSignal = signal<User | null>(this.readSession());

  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  constructor() {
    this.ensureDemoUser();
  }

  login(email: string, password: string): { ok: boolean; message: string } {
    const users = this.readUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!found) {
      return { ok: false, message: 'E-mail ou senha inválidos.' };
    }
    const { password: _, ...user } = found;
    this.userSignal.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true, message: 'Bem-vindo de volta.' };
  }

  register(payload: Omit<User, 'id' | 'createdAt'> & { password: string }): { ok: boolean; message: string } {
    const users = this.readUsers();
    if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      return { ok: false, message: 'Este e-mail já está cadastrado.' };
    }
    const created: StoredUser = {
      ...payload,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    users.push(created);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...user } = created;
    this.userSignal.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true, message: 'Conta criada com sucesso.' };
  }

  logout(): void {
    this.userSignal.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  private ensureDemoUser(): void {
    const users = this.readUsers();
    if (!users.some((u) => u.email === DEMO_USER.email)) {
      users.push(DEMO_USER);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  private readUsers(): StoredUser[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? (JSON.parse(raw) as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private readSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
