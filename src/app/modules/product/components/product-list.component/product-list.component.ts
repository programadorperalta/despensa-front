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

  private lastKeyTime: number = 0;
  private readonly SCAN_DELAY = 100; // ms

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
    const currentTime = Date.now();

    // Si pasó mucho tiempo desde la última tecla, limpiar buffer (nuevo escaneo)
    if (currentTime - this.lastKeyTime > this.SCAN_DELAY) {
      this.scanBuffer = ''; // ← LIMPIAR ANTES DE NUEVO ESCANEO
    }

    this.lastKeyTime = currentTime;

    if (event.key === 'Enter') {
      // El código de barras está listo
      if (this.scanBuffer.length > 0) {
        this.selectedProduct = new Producto({ barraCode: this.scanBuffer });
        this.showModal = true;

        this.scanBuffer = '';
        event.preventDefault();
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


  async downloadBarcode(barcode: string): Promise<void> {
    if (!barcode) {
      this.toastService.warning('No hay código de barras para descargar');
      return;
    }

    try {
      // ✅ BUSCAR POR EL ATRIBUTO data-barcode que agregamos en la directiva
      const barcodeElement = document.querySelector(`[data-barcode="${barcode}"]`);
      
      if (!barcodeElement) {
        this.toastService.error('No se pudo encontrar el código de barras');
        return;
      }

      const svgElement = barcodeElement.querySelector('svg');
      if (!svgElement) {
        this.toastService.error('No se pudo encontrar el SVG del código de barras');
        return;
      }

      await this.convertSvgToPng(svgElement as SVGSVGElement, barcode);
      
    } catch (error) {
      console.error('Error al descargar código de barras:', error);
      this.toastService.error('Error al descargar el código de barras');
    }
  }

  private async convertSvgToPng(svgElement: SVGSVGElement, barcode: string): Promise<void> {
    // Crear un canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }

    // Obtener las dimensiones del SVG
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Crear una imagen
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          // Configurar el canvas
          canvas.width = img.width * 2; // Doble resolución para mejor calidad
          canvas.height = img.height * 2;
          
          // Dibujar la imagen en el canvas
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convertir a PNG y descargar
          canvas.toBlob((blob) => {
            if (blob) {
              this.downloadBlob(blob, `codigo-barras-${barcode}.png`);
              URL.revokeObjectURL(url);
              this.toastService.success('Código de barras descargado correctamente');
              resolve();
            } else {
              reject(new Error('No se pudo crear el archivo PNG'));
            }
          }, 'image/png', 1.0);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Error al cargar la imagen SVG'));
      };
      
      img.src = url;
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    // Crear un enlace de descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Liberar memoria
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  // Método alternativo más simple (si el anterior tiene problemas)
  downloadBarcodeSimple(barcode: string): void {
    if (!barcode) {
      this.toastService.warning('No hay código de barras para descargar');
      return;
    }

    try {
      const barcodeElement = document.querySelector(`[appBarcode][data-barcode="${barcode}"] svg`);
      
      if (!barcodeElement) {
        this.toastService.error('No se pudo encontrar el código de barras');
        return;
      }

      const svgData = new XMLSerializer().serializeToString(barcodeElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `codigo-barras-${barcode}.svg`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      this.toastService.success('Código de barras descargado como SVG');
      
    } catch (error) {
      console.error('Error al descargar código de barras:', error);
      this.toastService.error('Error al descargar el código de barras');
    }
  }

}