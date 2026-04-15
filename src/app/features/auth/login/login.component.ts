// ============================================================
// Quantity Nexus – LoginComponent  (UC20 Angular)
//
// UC19 → Angular mapping:
//   <form id="login-form">         → ReactiveFormsModule FormGroup
//   addEventListener('submit')     → (ngSubmit) event binding
//   document.getElementById(...)  → FormControl.value
//   auth.login() + window.location → AuthService.login() + Router
//   required attribute             → Validators.required
//   Conditional rendering          → @if / [disabled]
// ============================================================

import {
  Component, inject, signal, ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterLink }             from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router }                 from '@angular/router';
import { LucideAngularModule }    from 'lucide-angular';
import { AuthService }            from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page-wrap">
      <main class="container">
        <div class="auth-wrapper glass-card">

          <!-- Logo -->
          <div class="auth-header">
            <div class="logo">
              <lucide-icon name="scale" [size]="48"></lucide-icon>
              <h1>Quantity<span>Nexus</span></h1>
            </div>
          </div>

          <!-- Login Form (Reactive Form – Angular equivalent of UC19 HTML form) -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <div class="form-group">
              <label for="email">Email Address</label>
              <div class="input-with-icon">
                <lucide-icon name="mail" [size]="18"></lucide-icon>
                <input
                  id="email"
                  type="email"
                  class="form-control"
                  placeholder="your@email.com"
                  formControlName="email"
                >
              </div>
              <!-- Conditional rendering: show error only when touched -->
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <span class="error-msg">Valid email is required</span>
              }
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-with-icon">
                <lucide-icon name="lock" [size]="18"></lucide-icon>
                <input
                  id="password"
                  type="password"
                  class="form-control"
                  placeholder="••••••••"
                  formControlName="password"
                >
              </div>
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <span class="error-msg">Password is required</span>
              }
            </div>

            <div class="form-utils">
              <label class="remember-me">
                <input type="checkbox"> <span>Remember me</span>
              </label>
              <a href="#" class="forgot-link">Forgot Password?</a>
            </div>

            <!-- State & controlled inputs: button disabled while loading -->
            <button
              type="submit"
              class="btn btn-primary full-width"
              [disabled]="loading() || form.invalid"
            >
              @if (loading()) {
                <span>Signing in…</span>
              } @else {
                <span>Sign In</span>
                <lucide-icon name="arrow-right" [size]="18"></lucide-icon>
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account?
              <a routerLink="/register">Sign up for free</a>
            </p>
            <div class="divider"><span>OR</span></div>
            <div class="social-btns">
              <button class="btn btn-outline" type="button">
                <lucide-icon name="mail" [size]="18"></lucide-icon> Google
              </button>
              <button class="btn btn-outline" type="button">
                <lucide-icon name="facebook" [size]="18"></lucide-icon> Facebook
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // Signal for loading state (State & controlled inputs)
  loading = signal(false);

  // Reactive Form (Angular equivalent of UC19's vanilla form)
  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
