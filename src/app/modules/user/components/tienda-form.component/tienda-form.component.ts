import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TiendaService } from '../../../product/services/tienda.service';
import Tienda from '../../../product/models/tienda/tienda';
import { response } from 'express';
import { ToastService } from '../../../product/services/toast.service';

@Component({
  selector: 'app-tienda-form',
  templateUrl: './tienda-form.component.html',
  styleUrls: ['./tienda-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})

export class TiendaFormComponent implements OnInit {
  @Input() tienda?: Tienda; // Para modo edición
  @Output() tiendaSubmit = new EventEmitter<Tienda>();
  @Output() cancel = new EventEmitter<void>();

  tiendaForm!: FormGroup;
  isEditMode = false;
  isLoading = false;

  constructor(private fb: FormBuilder, private tiendaService: TiendaService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.isEditMode = !!this.tienda;
    this.initForm();
  }

  private initForm(): void {
    this.tiendaForm = this.fb.group({
      nombre: [
        this.tienda?.nombre || '',
        [Validators.required, Validators.minLength(3)]
      ],
      direccion: [
        this.tienda?.direccion || '',
        [Validators.required, Validators.minLength(10)]
      ],
      telefono: [
        this.tienda?.telefono || '',
        [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)]
      ]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.tiendaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.tiendaForm.valid) {
      this.isLoading = true;

      const tiendaData: Tienda = {
        ...this.tiendaForm.value
      };

      this.tiendaService.createTienda(tiendaData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.tiendaForm.reset();
          this.toastService.success("Tienda creada exitosamente!")
        },
        error: (error) => {
          this.isLoading = false;
          console.error("Se ha producido un error", error)
        }
      })

    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.tiendaForm.controls).forEach(key => {
        this.tiendaForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}