import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = 'maria.s@example.com';
  password = 'demo123';
  error = signal('');

  submit(): void {
    const result = this.auth.login(this.email, this.password);
    if (!result.ok) {
      this.error.set(result.message);
      return;
    }
    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/minha-conta';
    this.router.navigateByUrl(redirect);
  }
}
