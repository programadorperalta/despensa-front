import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Producto from '../../models/product';
import { ProductService } from '../../services/product.service';
import { ProductFormModalComponent } from '../product-form-modal.component/product-form-modal.component';
import { ModalComponent } from '../modal.component/modal.component';
import { ToastService } from '../../services/toast.service';
import { BarcodeDirective } from '../../../../directives/barcode';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list.component',
  imports: [CommonModule, RouterModule, ProductFormModalComponent, ModalComponent, BarcodeDirective, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})

export class ProductListComponent implements OnInit {
  products: Producto[] = [];
  showModal: boolean = false;
  selectedProduct: Producto | null = null;
  scanBuffer: string = '';
  openModal: boolean = false;
  isDelete: boolean = false;
  isActivation: boolean = false;
  mensaje: string = '';
  title: string = '';
  idProductToDelete: string = '';
  idProductToActivate: string = '';
  idsTiendas: number[] = []

  //Para el buscador
  searchTerm: string = '';
statusFilter: string = '';
stockFilter: string = '';
filteredProducts: any[] = [];

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.loadIdsTiendas();
    this.loadProducts();

    this.filteredProducts = [...this.products];
  }

  clearFilters(): void {
  this.searchTerm = '';
  this.statusFilter = '';
  this.stockFilter = '';
  this.filteredProducts = [...this.products];
}
  
  applyFilter(): void {
  let filtered = this.products;

  // Filtro de búsqueda
  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(product =>
      product.name?.toLowerCase().includes(term) ||
      product.barraCode?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  }

  // Filtro por estado
  if (this.statusFilter === 'active') {
    filtered = filtered.filter(product => product.status === true);
  } else if (this.statusFilter === 'inactive') {
    filtered = filtered.filter(product => product.status === false);
  }

  // Filtro por stock
  if (this.stockFilter === 'low') {
    filtered = filtered.filter(product => (product.stock || 0) <= 5);
  } else if (this.stockFilter === 'out') {
    filtered = filtered.filter(product => (product.stock || 0) === 0);
  } else if (this.stockFilter === 'available') {
    filtered = filtered.filter(product => (product.stock || 0) > 0);
  }

  this.filteredProducts = filtered;
}

  loadIdsTiendas(): void {
    const stored = localStorage.getItem('tiendas_ids');

    if (!stored) {
      this.idsTiendas = [];
      return;
    }

    try {
      // Parsear el string JSON a array de números
      this.idsTiendas = JSON.parse(stored);
    } catch (error) {
      console.error('Error al parsear tiendas_ids:', error);
      this.idsTiendas = [];
    }

  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = [...this.products];
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  //Al iniciar un escaneo que abra para generar un nuevo producto
  @HostListener('window:keypress', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // El código de barras está listo
      if (this.scanBuffer.length > 0) {
        this.selectedProduct = new Producto({ barraCode: this.scanBuffer });
        this.showModal = true;

        this.scanBuffer = '';
        event.preventDefault(); // Opcional: prevenir comportamiento por defecto
      }
    } else {
      // Acumular caracteres
      this.scanBuffer += event.key;
    }
  }

  // Abrir modal para nuevo producto
  nuevoProducto(): void {
    this.selectedProduct = null;
    this.showModal = true;
  }

  // Abrir modal para editar producto
  editarProducto(product: Producto): void {
    this.selectedProduct = product;
    this.showModal = true;
  }

  eliminarProducto(product: Producto): void {
    this.idProductToDelete = product.id?.toString() || '';
    this.isDelete = true;
    this.mostrarModalMensaje('El producto no será eliminado permanentemente, solo cambiará su estado a "inactivo" y dejará de estar disponible para ventas.', product);
  }

  activateProduct(product: Producto): void {
    this.idProductToDelete = product.id?.toString() || '';
    this.isActivation = true;
    this.mostrarModalMensaje('Al activar este producto, estará disponible para ser seleccionado durante el proceso de ventas'
      , product);
  }

  confirmDelete() {
    //No existe la eliminación como tal. Solo cambia el estado del producto a inactivo.     
    this.productService.deleteProduct(this.idProductToDelete).subscribe({
      next: () => {
        this.toastService.warning("Producto desactivado")
        this.loadProducts();
        this.cerrarModal();

      },
      error: (error) => {
        alert('Error al eliminar el producto');
      }
    });
  }

  confirmActivation() {
    this.productService.activateProduct(this.idProductToDelete).subscribe({
      next: () => {
        this.toastService.success("Producto activado")
        this.loadProducts();
        this.cerrarModal();
      },
      error: (error) => {
        alert('Error al activar el producto')
      }
    })
  }

  mostrarModalMensaje(mensaje: string, product: Producto) {
    //Bandera de abrir el modal
    this.openModal = true;
    if (this.isDelete) {
      this.title = '¿Desactivar el producto'.concat(' ', product?.name || '').concat('?');
    } else {
      this.title = '¿Activar el producto'.concat(' ', product?.name || '').concat('?');
    }
    this.mensaje = mensaje;
  }

  cerrarModal() {
    this.openModal = false;
    this.isDelete = false;
    this.isActivation = false;
  }

  // Manejar cierre del modal
  onModalClosed(): void {
    this.openModal = false;
    this.showModal = false;
    this.isDelete = false;
    this.isActivation = false;
    this.selectedProduct = null;
  }

  // Manejar guardado exitoso
  onProductSaved(savedProduct: Producto): void {
    this.toastService.success("Producto guardado exitosamente!")
    this.loadProducts(); // Recargar la lista
  }

  // Método para formatear el precio
  formatearPrecio(precio: number): string {
    return `$${precio.toFixed(2)}`;
  }

  generateSimpleBarcode(code: string): string {
    // Esto es una simulación muy básica - para códigos reales usa una librería
    let bars = '';
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const barWidth = (charCode % 3) + 1;
      bars += `<rect x="${i * 4}" y="0" width="${barWidth}" height="40" fill="black"/>`;
    }
    return `<svg width="${code.length * 4}" height="40" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
  }


}