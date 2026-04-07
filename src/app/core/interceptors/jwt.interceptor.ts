// ============================================================
// Quantity Nexus – JWT Interceptor  (UC20 Angular)
//
// UC19 had no interceptor – tokens weren't sent to API calls.
// Angular HttpInterceptorFn cleanly attaches the Bearer token
// to all outgoing requests (Session management).
// ============================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { AuthService }       from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const user  = auth.currentUser();

  if (user?.token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${user.token}` }
    });
    return next(cloned);
  }

  return next(req);
};
