import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { map, take } from 'rxjs/operators';
import { AuthService } from '../modules/product/services/auth.service';
import { RoleService } from '../modules/product/services/role.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router, private roleService:RoleService) {}

  canActivate() {
    return this.authService.isAuthenticated().pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}