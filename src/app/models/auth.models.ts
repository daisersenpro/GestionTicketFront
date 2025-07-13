/**
 * Modelos para el sistema de autenticación
 * Estos modelos coinciden exactamente con los DTOs del backend C#
 */

// Request para el login - lo que enviamos al backend
export interface LoginRequest {
  correoElectronico: string; // Email válido
  contraseña: string;        // Contraseña del usuario
}

// Response del login - lo que recibimos del backend
export interface LoginResponse {
  token: string; // JWT Token para autorización
}

// Información del usuario decodificada del JWT
export interface AuthUser {
  id: number;
  nombre: string;
  apellido: string;
  correoElectronico: string;
  rol: string;
  idEmpresa: number;
  exp: number; // Timestamp de expiración del token
}

// Estado de autenticación en la aplicación
export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}
