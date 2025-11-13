import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../modules/product/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // No agregar token a endpoints de login
  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();
  
  if (token) {
    // Clonar la request y agregar el header Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};