import { Component } from '@angular/core';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NewUserComponent } from '../../../user/components/new-user.component/new-user.component';

@Component({
  selector: 'app-login-form.component',
  imports: [CommonModule, FormsModule, RouterModule, NewUserComponent],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  credentials: LoginRequest = { username: '', password: '' };
  loading = false;
  error = '';
  newUserFormIsVisible: boolean = false;
  isVisible: boolean = true;

  constructor(
    private authService: AuthService,
    private roleService: RoleService,
    private router: Router,
    private userService: UserService
  ) { }

  login(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.loading = false;

        if (this.roleService.isGeneric()) {
          // Usuario genérico: mostrar formulario para nueva contraseña
          this.newUserFormIsVisible = true;
          this.isVisible = false;
          return;
        } else {
          // Usuario normal: procedimiento normal
          this.handleSuccessfulLogin();
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Credenciales inválidas';
        console.error('❌ Error en login:', error);
      }
    });
  }

  // Método llamado cuando el usuario genérico actualiza su contraseña
  onGenericUserCompleted(): void {
    // Marcar como usuario no genérico
    this.authService.completeGenericRegistration();

    // Ahora proceder con el flujo normal
    this.handleSuccessfulLogin();
  }

  private handleSuccessfulLogin(): void {
    const tiendas = this.roleService.findIdsTiendas();
    const tieneTiendas = tiendas && tiendas.length > 0;

    if (!tieneTiendas) {
      return;
    }

    // Forzar redirección incluso si el router falla
    if (this.roleService.isAdmin()) {
      this.router.navigate(['/users']).then(success => {
        if (!success) {
          window.location.href = '/users'; // Fallback
        }
      });
    } else {
      this.router.navigate(['/products']).then(success => {
        if (!success) {
          window.location.href = '/products'; // Fallback
        }
      });
    }
  }

  openLogin(): void {
    this.isVisible = true;
    this.newUserFormIsVisible = false;
  }
}