import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, catchError, Observable, of, tap, throwError } from "rxjs";
import { environment } from "../../../../environments/environments";
import { isPlatformBrowser } from "@angular/common";
import { RoleService } from "./role.service";
import { ToastService } from "./toast.service";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  legend: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly IS_GENERIC_KEY = 'is_generic_user';
  private apiUrl = `${environment.apiUrl}/auth`

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isGenericUserSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private roleService: RoleService,
    @Inject(PLATFORM_ID) private platformId: any,
    private toastService: ToastService
  ) {
    // Solo inicializar en el cliente (browser)
    if (isPlatformBrowser(this.platformId)) {
      const hasToken = this.hasToken();
      const isGeneric = this.getIsGenericUser();

      this.isAuthenticatedSubject.next(hasToken && !isGeneric);
      this.isGenericUserSubject.next(isGeneric);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
    .pipe(
      tap(response => {
        this.setToken(response.token);

        // Verificar si el usuario es genérico
        const isGeneric = this.roleService.isGeneric();
        // Verificar si es administrador
        const isAdmin = this.roleService.isAdmin();

        if (isGeneric) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.IS_GENERIC_KEY, isGeneric.toString());
          }
        }

        // ✅ VALIDACIÓN DE TIENDAS: Solo aplica si NO es administrador
        const tiendas = this.roleService.findIdsTiendas();
        const tieneTiendas = tiendas && tiendas.length > 0;

        if (isGeneric) {
          // Usuario genérico: puede tener token pero no está completamente autenticado
          this.isAuthenticatedSubject.next(false);
          this.isGenericUserSubject.next(true);
          
          // Para usuario genérico, verificar tiendas (no debería ser admin)
          if (!tieneTiendas) {
            this.toastService.warning('Usuario genérico sin tiendas asignadas');
            this.logout();
          }
        } else {
          // Usuario normal: completamente autenticado
          this.isAuthenticatedSubject.next(true);
          this.isGenericUserSubject.next(false);
          
          // Solo verificar tiendas si NO es administrador
          if (!isAdmin && !tieneTiendas) {
            this.toastService.warning('No tienes tiendas asignadas. Contacta al administrador.');
            this.logout();
          } else if (!isAdmin && tieneTiendas) {
            // Mostrar éxito solo para usuarios normales con tiendas
            this.toastService.success(`Bienvenido, tienes ${tiendas.length} tienda(s) asignada(s)`);
          } else if (isAdmin) {
            // Mensaje de bienvenida para administrador
            this.toastService.success('Bienvenido administrador');
          }
        }
      }),
      catchError(error => {
        // Manejar errores de login
        this.toastService.error('Error en el inicio de sesión');
        return throwError(() => error);
      })
    );
}

  // Método para cuando el usuario genérico actualiza su contraseña
  completeGenericRegistration(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.IS_GENERIC_KEY, 'false');
    }

    // Ahora está completamente autenticado
    this.isAuthenticatedSubject.next(true);
    this.isGenericUserSubject.next(false);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.IS_GENERIC_KEY);
    }
    this.isAuthenticatedSubject.next(false);
    this.isGenericUserSubject.next(false);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  isGenericUser(): Observable<boolean> {
    return this.isGenericUserSubject.asObservable();
  }

  getIsGenericUser(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.IS_GENERIC_KEY) === 'true';
    }
    return false;
  }

  private hasToken(): boolean {
    return this.getToken() !== null;
  }
}