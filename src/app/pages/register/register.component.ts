import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { STATES } from '../../core/constants/catalog';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  states = STATES;
  name = '';
  email = '';
  phone = '';
  city = '';
  state = 'SP';
  password = '';
  role: 'particular' | 'revenda' = 'particular';
  error = signal('');

  submit(): void {
    const result = this.auth.register({
      name: this.name,
      email: this.email,
      phone: this.phone,
      city: this.city,
      state: this.state,
      role: this.role,
      password: this.password,
    });
    if (!result.ok) {
      this.error.set(result.message);
      return;
    }
    this.router.navigateByUrl('/minha-conta');
  }
}
