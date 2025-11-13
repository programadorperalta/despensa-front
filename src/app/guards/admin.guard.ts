// src/app/guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../modules/product/services/auth.service';
import { map, take } from 'rxjs/operators';
import { RoleService } from '../modules/product/services/role.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router
  ) {}

  canActivate() {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Verificar si es administrador
          if (this.roleService.isAdmin()) {
            return true;
          } else {
            // Si no es admin, redirigir a acceso denegado o página principal
            console.warn('Usuario no autorizado para acceder a esta ruta');
            this.router.navigate(['/access-denied']);
            return false;
          }
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}