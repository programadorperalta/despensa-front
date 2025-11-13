import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta
import { RoleService } from '../../services/role.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  isAdminUser = false;
  username: string | null = null;

  constructor(private authService: AuthService, private roleService: RoleService,
    private router: Router, private tokenService: TokenService) { }

  ngOnInit(): void {
    // Verificar si es admin cuando el componente se inicializa
    this.checkAdminStatus();

    // Suscribirse a cambios de autenticación para actualizar el estado
    this.authService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.checkAdminStatus();
      } else {
        this.isAdminUser = false;
        this.username = null;
      }
    });
  }

  isAdmin(): boolean {
    return this.isAdminUser;
  }

  getUsername(): string {
    return this.username || 'Usuario';
  }

  private checkAdminStatus(): void {
    if (this.isLoggedIn()) {
      this.isAdminUser = this.roleService.isAdmin();
      this.username = this.roleService.getUsername();
    }
  }


  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.tokenService.clearToken();

    this.isAdminUser = false;
    this.username = null;
    this.closeMenu();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.getToken() !== null;
  }
}