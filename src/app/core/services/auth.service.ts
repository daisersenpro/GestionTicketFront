import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, AuthUser, AuthState } from '../../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar si hay un token guardado al iniciar
    this.checkStoredToken();
  }

  /**
   * Login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.token);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar si el token no ha expirado
    try {
      const payload = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): AuthUser | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return this.decodeToken(token);
    } catch {
      return null;
    }
  }

  /**
   * Decodificar el token JWT
   */
  private decodeToken(token: string): AuthUser {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: parseInt(payload.sub || payload.id),
      nombre: payload.nombre,
      apellido: payload.apellido,
      correoElectronico: payload.email || payload.correoElectronico,
      rol: payload.rol,
      idEmpresa: parseInt(payload.idEmpresa),
      exp: payload.exp
    };
  }

  /**
   * Configurar datos de autenticación
   */
  private setAuthData(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
    const user = this.decodeToken(token);
    
    this.authStateSubject.next({
      isAuthenticated: true,
      user: user,
      token: token
    });
  }

  /**
   * Verificar token almacenado al iniciar la aplicación
   */
  private checkStoredToken(): void {
    const token = this.getToken();
    if (token && this.isAuthenticated()) {
      this.setAuthData(token);
    } else {
      this.logout();
    }
  }
}
