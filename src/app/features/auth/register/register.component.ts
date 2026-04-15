// ============================================================
// Quantity Nexus – RegisterComponent  (UC20 Angular)
//
// UC19 → Angular mapping:
//   register.html <form>           → ReactiveFormsModule
//   document.getElementById(...)  → FormControl.value
//   auth.signup(userData)          → AuthService.register()
//   window.location.href = login   → Router.navigate(['/login'])
// ============================================================

import {
  Component, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }           from '@angular/common';
import { RouterLink }             from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router }                 from '@angular/router';
import { LucideAngularModule }    from 'lucide-angular';
import { AuthService }            from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page-wrap">
      <main class="container">
        <div class="auth-wrapper glass-card">

          <div class="auth-header">
            <div class="logo">
              <lucide-icon name="scale" [size]="48"></lucide-icon>
              <h1>Quantity<span>Nexus</span></h1>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Form Grid – 2 columns (Component composition + SCSS grid) -->
              <div class="form-group">
                <label>Full Name</label>
                <div class="input-with-icon">
                  <lucide-icon name="user" [size]="18"></lucide-icon>
                  <input type="text" class="form-control" placeholder="Jane Doe"
                         formControlName="fullName">
                </div>
                @if (f['fullName'].invalid && f['fullName'].touched) {
                  <span class="error-msg">Full name is required</span>
                }
              </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Email Address</label>
                <div class="input-with-icon">
                  <lucide-icon name="mail" [size]="18"></lucide-icon>
                  <input type="email" class="form-control" placeholder="jane@email.com"
                         formControlName="email">
                </div>
                @if (f['email'].invalid && f['email'].touched) {
                  <span class="error-msg">Valid email required</span>
                }
              </div>

              <div class="form-group">
                <label>Password</label>
                <div class="input-with-icon">
                  <lucide-icon name="lock" [size]="18"></lucide-icon>
                  <input type="password" class="form-control" placeholder="••••••••"
                         formControlName="password">
                </div>
                @if (f['password'].invalid && f['password'].touched) {
                  <span class="error-msg">Min 6 characters required</span>
                }
              </div>
            </div>

            <button type="submit" class="btn btn-primary full-width"
                    [disabled]="loading() || form.invalid">
              @if (loading()) {
                <span>Creating account…</span>
              } @else {
                <span>Create Free Account</span>
                <lucide-icon name="user-plus" [size]="18"></lucide-icon>
              }
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/login">Sign in here</a></p>
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
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    fullName: ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Shortcut getter for template (Props Passing pattern)
  get f(): { [key: string]: AbstractControl } { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    const { fullName, email, password } = this.form.value;

    this.auth.register({ fullName: fullName!, email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false)
    });
  }
}
