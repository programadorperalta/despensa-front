// src/app/services/toast.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface ToastConfig {
  duration?: number;
  action?: string;
}

@Injectable({
  providedIn: 'root'
})

export class ToastService {

  private defaultConfig: ToastConfig = {
    duration: 4000,
    action: 'Cerrar'
  };

  constructor(private snackBar: MatSnackBar) {}

  success(message: string, config: ToastConfig = {}): void {
    this.show(message, 'success-toast', { ...this.defaultConfig, ...config });
  }

  error(message: string, config: ToastConfig = {}): void {
    this.show(message, 'error-toast', { 
      ...this.defaultConfig, 
      duration: 5000,
      ...config 
    });
  }

  info(message: string, config: ToastConfig = {}): void {
    this.show(message, 'info-toast', { 
      ...this.defaultConfig, 
      duration: 3000,
      ...config 
    });
  }

  warning(message: string, config: ToastConfig = {}): void {
    this.show(message, 'warning-toast', { ...this.defaultConfig, ...config });
  }

  private show(message: string, panelClass: string, config: ToastConfig): void {
    this.snackBar.open(message, config.action, {
      duration: config.duration,
      panelClass: [panelClass, 'bottom-center-toast'],
      horizontalPosition: 'center',  // ← Centrado horizontal
      verticalPosition: 'bottom'     // ← Abajo de la pantalla
    });
  }
}