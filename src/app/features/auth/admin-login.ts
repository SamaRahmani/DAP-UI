
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  showPassword = false;
  loading = false;
  errorMessage = '';

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    password: ['', [
      Validators.required
    ]]
  });

  constructor() {
    if (
      this.authService.isAuthenticated() &&
      this.authService.hasRole('ROLE_ADMIN')
    ) {
      this.router.navigate(['/dashboard']);
    }
  }

  get email() {
    return this.loginForm.controls.email;
  }

  get password() {
    return this.loginForm.controls.password;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submitLogin(): void {

    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.getRawValue())
      .subscribe({

        next: () => {

          const requestedUrl =
            this.route.snapshot.queryParamMap.get('returnUrl');

          const returnUrl =
            requestedUrl &&
            requestedUrl.startsWith('/') &&
            !requestedUrl.startsWith('//')
              ? requestedUrl
              : '/dashboard';

          this.router.navigateByUrl(returnUrl);
        },

        error: error => {

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            error?.message ||
            'Unable to sign in. Please check your credentials and try again.';

          this.loading = false;
        },

        complete: () => {
          this.loading = false;
        }
      });
  }
}
