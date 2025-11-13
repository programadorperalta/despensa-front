// product-form-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

export class ProductFormModalComponent implements OnInit, AfterViewInit {
  @Input() isOpen: boolean = false;
  @Input() product: Producto | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Producto>();
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  private scanBuffer: string = '';
  private isScanning: boolean = false;
  private scanTimeout: any = null;
  barcodeScanned: boolean = false; // ← NUEVA VARIABLE para trackear estado


  formData: Partial<Producto> = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    barraCode: '',
    category: '',
    status: true
  };

  constructor(
    private productService: ProductService,
    private roleService: RoleService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.resetForm();
  }

  ngAfterViewInit(): void {
    // Configurar el input oculto cuando el componente esté listo
    this.setupBarcodeInput();
  }

  ngOnChanges(): void {
    this.resetForm();
    if (this.isOpen) {
      // Cuando se abre el modal, enfocar el input oculto después de un breve delay
      setTimeout(() => {
        this.focusBarcodeInput();
      }, 300);
    } else {
      this.cleanScanBuffer();
    }
  }

  private cleanScanBuffer(): void {
    this.scanBuffer = '';
    this.isScanning = false;
    this.barcodeScanned = false;
  }


  private setupBarcodeInput(): void {
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.addEventListener('focus', () => {
        this.isScanning = true;
        this.scanBuffer = '';
      });

      this.barcodeInput.nativeElement.addEventListener('blur', () => {
        this.isScanning = false;
        this.scanBuffer = ''
      });
    }
  }

  private focusBarcodeInput(): void {
    if (this.barcodeInput && this.isOpen && !this.barcodeScanned) {
      this.barcodeInput.nativeElement.focus();
      this.isScanning = true;
      this.scanBuffer = '';
    }
  }

  resetForm(): void {
    if (this.product) {
      // En modo edición, todos los campos están habilitados
      this.formData = { ...this.product };
      this.barcodeScanned = true; // ← En edición, ya está escaneado
    } else {
      // En modo creación, solo el código de barras está habilitado inicialmente
      this.formData = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        barraCode: '',
        category: '',
        status: true
      };
      this.barcodeScanned = false; // ← En creación, no está escaneado aún
    }
    this.scanBuffer = '';
  }

  private forceBufferClean(): void {
    // Método agresivo para limpiar el buffer
    this.scanBuffer = '';

    // Crear un input temporal para "consumir" las teclas pendientes
    const tempInput = document.createElement('input');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.focus();

    setTimeout(() => {
      document.body.removeChild(tempInput);
    }, 50);
  }

  @HostListener('window:keypress', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (!this.isScanning) return;

    if (event.key === 'Enter') {
      if (this.scanBuffer.length > 0) {
        this.formData.barraCode = this.scanBuffer;
        this.scanBuffer = '';
        this.barcodeScanned = true; // ← MARCAR COMO ESCANEADO
        event.preventDefault();

        // Enfocar el primer campo habilitado (nombre)
        this.focusNameField();

        this.toastService.success('Código de barras escaneado. Ahora puede completar la información del producto.');
      }
    } else {
      this.scanBuffer += event.key;
    }
  }


  @HostListener('window:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isOpen && target.closest('app-modal') && !this.barcodeScanned) {
      // Solo re-enfocar si no se ha escaneado aún
      this.focusBarcodeInput();
    }
  }


  private focusNameField(): void {
    if (this.barcodeScanned) {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      if (nameInput) {
        setTimeout(() => {
          nameInput.focus();
        }, 100);
      }
    }
  }

  onClose(): void {
    this.cleanScanBuffer();
    this.isScanning = false;
    this.scanBuffer = '';
    this.barcodeScanned = false; // ← REINICIAR AL CERRAR
    this.closed.emit();
  }

  // Método para verificar si los campos deben estar habilitados
  areFieldsEnabled(): boolean {
    return this.barcodeScanned || this.isEditMode;
  }

  // En modo edición, todos los campos están habilitados
  get isEditMode(): boolean {
    return !!this.product?.id;
  }

  onSubmit(): void {
    if (!this.formData.barraCode || !this.formData.name || this.formData.price === undefined || this.formData.stock === undefined) {
      return;
    }

    const productData = new Producto(this.formData);
    productData.tiendaId = this.roleService.findIdsTiendas()?.[0];

    if (this.product?.id) {
      this.productService.updateProduct(this.product.id.toString(), productData).subscribe({
        next: (updatedProduct) => {
          this.toastService.success("Producto modificado exitosamente!")
          this.saved.emit(updatedProduct);
          this.onClose();
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          this.toastService.error('Error al actualizar el producto');
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: (newProduct) => {
          this.toastService.success("Producto creado exitosamente!");
          this.saved.emit(newProduct);
          this.onClose();
        },
        error: (error: any) => {
          this.toastService.error("El producto ya existe. No se ha creado");
        }
      });
    }
  }

  // Permitir re-escaneo si es necesario
  rescanBarcode(): void {
    this.formData.barraCode = '';
    this.scanBuffer = '';
    this.barcodeScanned = false; // ← REINICIAR EL ESTADO
    this.focusBarcodeInput();
    this.toastService.info('Listo para escanear nuevo código de barras');
  }


  generateRandomBarcode(): void {
    // Generar código de barras aleatorio (12-13 dígitos como EAN-13)
    const randomBarcode = this.generateEAN13();

    this.formData.barraCode = randomBarcode;
    this.barcodeScanned = true;

    // Enfocar el campo de nombre automáticamente
    this.focusNameField();

    this.toastService.success('Código de barras generado automáticamente');
  }

  private generateEAN13(): string {
    // Generar un código similar a EAN-13 (13 dígitos)
    let barcode = '';

    // Primeros 12 dígitos aleatorios
    for (let i = 0; i < 12; i++) {
      barcode += Math.floor(Math.random() * 10).toString();
    }

    // Calcular dígito de control (algoritmo EAN-13)
    barcode += this.calculateEAN13CheckDigit(barcode);

    return barcode;
  }

  private calculateEAN13CheckDigit(barcode: string): string {
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i]);
      // Multiplicar por 1 o 3 alternadamente
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }

  generateSimpleRandomBarcode(): void {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let barcode = '';
    const length = 10; // Longitud del código

    for (let i = 0; i < length; i++) {
      barcode += chars[Math.floor(Math.random() * chars.length)];
    }

    this.formData.barraCode = barcode;
    this.barcodeScanned = true;
    this.focusNameField();

    this.toastService.success('Código de barras generado automáticamente');
  }

  // Método opcional para limpiar el código de barras manualmente
  clearBarcode(): void {
    this.formData.barraCode = '';
    this.scanBuffer = '';
    this.focusBarcodeInput();
  }
}