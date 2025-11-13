// product-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Producto from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ModalComponent } from '../modal.component/modal.component';
import { RoleService } from '../../services/role.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './product-form-modal.component.html',
  styleUrl: './product-form-modal.component.scss'
})
export class ProductFormModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Input() product: Producto | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Producto>();


  private scanBuffer: string = '';

  formData: Partial<Producto> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    barraCode: '',
    category: '',
    status: true
  };

  constructor(private productService: ProductService, private roleService: RoleService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(): void {
    this.resetForm();
  }

  resetForm(): void {
    if (this.product) {
      // Editar producto existente
      this.formData = { ...this.product };
    } else {
      // Nuevo producto
      this.formData = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        barraCode: '',
        category: '',
        status: true
      };
    }
  }

  @HostListener('window:keypress', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // El código de barras está listo
      if (this.scanBuffer.length > 0) {
        this.formData.barraCode = this.scanBuffer;
        this.scanBuffer = '';
        event.preventDefault(); // Opcional: prevenir comportamiento por defecto
      }
    } else {
      // Acumular caracteres
      this.scanBuffer += event.key;
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (!this.formData.name || this.formData.price === undefined || this.formData.stock === undefined) {
      return;
    }

    //const productData = new Producto(this.formData);

    const productData = new Producto(this.formData);
    productData.tiendaId = this.roleService.findIdsTiendas()?.[0]
    
    
    if (this.product?.id) {
      // Actualizar producto existente
      this.productService.updateProduct(this.product.id.toString(), productData).subscribe({
        next: (updatedProduct) => {
          this.toastService.success("Producto modificado exitosamente!")
          this.saved.emit(updatedProduct);
          this.onClose();
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          alert('Error al actualizar el producto');
        }
      });
    } else {
      // Crear nuevo producto
      this.productService.createProduct(productData).subscribe({
        next: (newProduct) => {
          this.toastService.success("Producto creado exitosamente!");
          this.saved.emit(newProduct);
          this.onClose();
        },
        error: (error: any) => {
          this.toastService.error("El producto ya existe. No se ha creado");
          this.onClose();
        }
      });
    }
  }
}