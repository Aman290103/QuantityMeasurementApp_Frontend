// ============================================================
// Quantity Nexus – AuthService  (UC20 Angular)
//
// UC19 → Angular mapping:
//   fetch()          → HttpClient (Angular DI, typed, interceptable)
//   localStorage     → same, but encapsulated here only
//   window.location  → Router.navigate()
//   class instance   → @Injectable singleton
//   showToast()      → ToastService (reusable)
// ============================================================

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { User, LoginPayload, RegisterPayload, AuthResponse } from '../models/models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Angular Signals – reactive auth state (replaces UC19's property + DOM update)
  private _user = signal<User | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null')
  );

  readonly currentUser = computed(() => this._user());
  readonly isLoggedIn  = computed(() => this._user() !== null);

  /** First-name helper used in header greeting */
  readonly firstName = computed(() => {
    const u = this._user();
    return u ? u.fullName.split(' ')[0] : 'Guest';
  });

  /** Avatar initials helper */
  readonly initials = computed(() => {
    const u = this._user();
    if (!u) return '?';
    return u.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  });

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {}

  // ── Login ──────────────────────────────────────────────────────────────────
  login(email: string, password: string): Observable<AuthResponse> {
    const payload: LoginPayload = { email, password };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => {
        const user: User = { fullName: res.fullName, email: res.email, token: res.token };
        localStorage.setItem('user', JSON.stringify(user));
        this._user.set(user);
        this.toast.show(`Welcome, ${res.fullName}!`, 'success');
      }),
      catchError((err: HttpErrorResponse) => {
        let msg = 'Login failed. Please try again.';
        if (err.status === 0) {
          msg = 'Cannot connect to API. Please check if the backend is running and CORS is allowed.';
        } else if (err.error?.message) {
          msg = err.error.message;
        } else if (err.error?.errors) {
          msg = Object.values(err.error.errors).flat().join(', ');
        }
        this.toast.show(msg, 'error');
        return throwError(() => new Error(msg));
      })
    );
  }

  // ── Register ───────────────────────────────────────────────────────────────
  register(data: { fullName: string; email: string; password: string }): Observable<unknown> {
    // Mapping to .NET RegisterDTO  (same as UC19 signup())
    const payload: RegisterPayload = {
      fullName: data.fullName,
      email: data.email,
      password: data.password
    };

    return this.http.post(`${this.apiUrl}/register`, payload).pipe(
      tap(() => this.toast.show('Account created! Please sign in.', 'success')),
      catchError((err: HttpErrorResponse) => {
        let msg = 'Registration failed.';
        if (err.status === 0) {
          msg = 'Cannot connect to API. Please check if the backend is running and CORS is allowed.';
        } else if (err.error?.message) {
          msg = err.error.message;
        } else if (err.error?.errors) {
          msg = Object.values(err.error.errors).flat().join(', ');
        }
        this.toast.show(msg, 'error');
        return throwError(() => new Error(msg));
      })
    );
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem('user');
    this._user.set(null);
    this.router.navigate(['/dashboard']);
  }
}
