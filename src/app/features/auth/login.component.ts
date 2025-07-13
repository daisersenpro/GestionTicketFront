import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Crear formulario reactivo con validaciones
    this.loginForm = this.fb.group({
      correoElectronico: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Submit del formulario de login
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.getErrorMessage(error);
          console.error('Error en login:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Marcar todos los campos como touched para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Obtener mensaje de error del servidor
   */
  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Credenciales inválidas. Verifique su email y contraseña.';
    } else if (error.status === 500) {
      return 'Error del servidor. Intente nuevamente más tarde.';
    } else if (error.status === 0) {
      return 'No se pudo conectar al servidor. Verifique su conexión.';
    }
    return 'Error inesperado. Intente nuevamente.';
  }

  /**
   * Verificar si un campo tiene errores
   */
  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Obtener mensaje de error específico de un campo
   */
  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors?.['required']) {
      return `${fieldName === 'correoElectronico' ? 'Email' : 'Contraseña'} es requerido`;
    }
    if (field?.errors?.['email']) {
      return 'Email inválido';
    }
    if (field?.errors?.['minlength']) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }
}
