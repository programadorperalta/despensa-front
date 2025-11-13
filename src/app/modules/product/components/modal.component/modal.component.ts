import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import TokenRequest from '../../models/token/tokenRequest';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})

export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() isDelete: boolean = false;
  @Input() isActivate: boolean = false;
  @Input() isMercadoPago: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Output() closed = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<void>();
  @Output() confirmActivation = new EventEmitter<void>();
  @Output() savedCredentiales = new EventEmitter<{ client_id: string, client_secret: string }>();

  credenciales = {
    client_id: '',
    client_secret: ''
  }

  close() {
    this.closed.emit();
  }

  confirmarEliminacion() {
    this.confirmDelete.emit();
  }

  confirmarActivacion() {
    this.confirmActivation.emit();
  }

  guardarCredenciales(): void {
    // Solo emitir los datos al componente padre
    this.savedCredentiales.emit({
      client_id: this.credenciales.client_id,
      client_secret: this.credenciales.client_secret
    });
  }
}