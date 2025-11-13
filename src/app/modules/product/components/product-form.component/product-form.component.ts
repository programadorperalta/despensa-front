import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import Producto from '../../models/product';
import { CartFormComponent } from '../cart-form.component/cart-form.component/cart-form.component';
import CarritoCompra from '../../models/carritoCompra';
import ItemCarrito from '../../models/itemCarrito';
import { RoleService } from '../../services/role.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-form.component',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CartFormComponent],
  providers: [ProductService],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {

  @ViewChild(CartFormComponent) cartForm!: CartFormComponent;

  //Definir las propiedades del componente
  codigoBarras: string = '';
  productos: any[] = [];
  productoEncontrado: any = null;
  busquedaRealizada: boolean = false;
  cantidad: number = 1;
  carrito: CarritoCompra = new CarritoCompra();
  mostrarVentaModal: boolean = false;
  productosParaVenta: any[] = [];
  scanBuffer: string = '';
  productosEncontrados: Producto[] = [];

  constructor(private productService: ProductService, private roleService: RoleService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  //Logica para cargar los productos 
  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.productos = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  @HostListener('window:keypress', ['$event'])
  keyEvent(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      // El código de barras está listo
      if (this.scanBuffer.length > 0) {
        this.codigoBarras = this.scanBuffer;
        this.buscarProducto();
        this.scanBuffer = '';
        event.preventDefault(); // Opcional: prevenir comportamiento por defecto
      }
    } else {
      // Acumular caracteres
      this.scanBuffer += event.key;
    }
  }

  // MÉTODOPARA ESCRITURA MANUAL (Enter normal)
  onEnterManual() {
    this.buscarProducto();
  }

  //Logica para buscar el producto por codigo de barras
  buscarProducto() {
    //Sanitizar el codigo de barras ingresado
    const codigoSanitizado = this.codigoBarras.trim();

    //Buscar el producto en la base de datos o en la lista de productos
    if (codigoSanitizado != null || codigoSanitizado != undefined || codigoSanitizado != '') {
      this.productService.getProductByBarraCode(codigoSanitizado).subscribe({
        next: (producto) => {
          if (producto.status && this.perteneceATienda(producto)) {
            this.addProductoEncontrado(producto);
            this.busquedaRealizada = true;
          } else {
            this.productoEncontrado = null;
          }
        },
        error: (error) => {
          console.error('Error searching for product:', error);
        }
      });
    }
  }

  perteneceATienda(producto: Producto): boolean {
    let tiendas = this.roleService.getTiendas();
    if (tiendas && tiendas.length > 0 && producto.tiendaId) {
      return tiendas.includes(producto.tiendaId);
    }
    return false;
  }

  //Agregar al listado de productos encontrados
  addProductoEncontrado(producto: any) {
    // Verificar si el producto ya existe en el array
    const productoExistente = this.productosEncontrados.find(p =>
      p.id === producto.id || p.barraCode === producto.barraCode
    );

    if (!productoExistente) {
      // Solo agregar si NO existe
      this.productosEncontrados.push(producto);
      //Agregar toast
    } else {
      //Agregar toast
      this.toastService.warning("El producto ya existe en la lista")
    }
  }

  //Limpiar el campo de busqueda y cambiar el estado de la busqueda
  limpiarBusqueda() {
    this.codigoBarras = '';
    this.busquedaRealizada = false;
  }

  agregarAlCarrito(product?: Producto) {
    if (!product) return;
    //Se separa la responsabilidad. Ahora el carrito maneja la logica de agregar items
    this.cartForm.agregarItem(this.generateItemCarrito(product));
  }

  generateItemCarrito(product: Producto): ItemCarrito {
    //Generar el item del carrito a partir del producto y la cantidad seleccionada 
    return new ItemCarrito({
      id: product.id!,
      name: product.name!,
      price: product.price!,
      barraCode: product.barraCode!,
      stock: product.stock!,
      cantidad: this.cantidad,
      subtotal: (product.price! * this.cantidad)
    });
  }

  limpiarCampos(): void {
    this.codigoBarras = '';
    this.mostrarVentaModal = false;
    this.productoEncontrado = null;
    this.productosEncontrados = [];
    this.busquedaRealizada = false;
    this.cantidad = 1;
  }

}


