// ============================================================
// Quantity Nexus – AuthGuard  (UC20 Angular)
//
// UC19 equivalent:
//   auth.checkAuth(true)  → window.location.href = 'login.html'
// Angular replaces this with a proper CanActivateFn guard on routes.
// ============================================================

import { inject }         from '@angular/core';
import { CanActivateFn }  from '@angular/router';
import { Router }         from '@angular/router';
import { AuthService }    from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};
