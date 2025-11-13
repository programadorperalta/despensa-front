import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../product/services/user.service';

@Component({
  selector: 'app-new-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.scss'
})
export class NewUserComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() username: string = '';
  @Output() completed = new EventEmitter<void>();
  
  userForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      username: this.username,
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Reiniciar el formulario cuando el componente se hace visible
    if (this.isVisible) {
      this.userForm.reset();
      this.errorMessage = '';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  // Getters para validación de requisitos de contraseña
  get hasMinLength(): boolean {
    return this.userForm.get('newPassword')?.value?.length >= 6;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.userForm.get('newPassword')?.value || '');
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.userForm.get('newPassword')?.value || '');
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.userForm.get('newPassword')?.value || '');
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const updateData = {
      username: this.username,
      password: this.userForm.get('newPassword')?.value
    };
    
    this.userService.updateUser(updateData).subscribe({
      next: () => {
        this.isLoading = false;
        // Emitir evento indicando que el registro se completó
        this.completed.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error al actualizar la contraseña. Intente nuevamente.';
        console.error('Error updating password:', error);
      }
    });
  }

  onCancel(): void {
    // Limpiar el formulario y emitir evento para volver al login
    this.userForm.reset();
    this.errorMessage = '';
    this.completed.emit();
  }
}