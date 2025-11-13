import { Component, EventEmitter, Input, Output } from '@angular/core';
import ItemCarrito from '../../../models/itemCarrito';
import { CommonModule } from '@angular/common';
import CarritoCompra from '../../../models/carritoCompra';
import { VentaForm } from '../../venta-form.component/venta-form.component';
import { ModalComponent } from '../../modal.component/modal.component';

@Component({
  selector: 'app-cart-form',
  imports: [CommonModule, VentaForm, ModalComponent],
  templateUrl: './cart-form.component.html',
  styleUrl: './cart-form.component.scss'
})

export class CartFormComponent {
  @Input() carrito: CarritoCompra | null = new CarritoCompra();
  productosParaVenta: any[] = [];
  carritoParaVenta: CarritoCompra | null = new CarritoCompra();
  //Para mostrar el modal de la venta
  mostrarVentaModal: boolean = false;
  openModal: boolean = false;
  mensaje: string = '';
  title: string = '';
  @Output() clearView = new EventEmitter<any>();

  aumentarCantidad(index: number) {
    if (!this.carrito || !this.carrito.items) return;

    const item = this.carrito.items[index];
    if (item && item.cantidad < item.stock) {
      item.cantidad++;
      item.subtotal = item.price * item.cantidad;
       //Calcular el total del carrito
       
    this.calcularTotalCarrito();
    }
  }

  disminuirCantidad(index: number) {
    if (!this.carrito || !this.carrito.items) return;
    const item = this.carrito.items[index];
    if (item.cantidad > 1) {
      item.cantidad--;
      item.subtotal = item.price * item.cantidad;
      //Calcular el total del carrito
    this.calcularTotalCarrito();
    }
    
  }

  eliminarItem(index: number) {
    if (!this.carrito || !this.carrito.items) return;
    this.carrito?.items.splice(index, 1);
  }

  calcularTotalCarrito() {
    if (!this.carrito || !this.carrito.items) return;
    this.carrito.totalPrice = this.carrito.items.reduce((total, item) => {
      return total + (item.subtotal)
    }, 0)
  }

  limpiarCarrito() {
    if (!this.carrito || !this.carrito.items) return;
    this.carrito.items = [];
    this.carrito.totalPrice = 0;
  }

  procesarVentaClick() {
    if (this.carrito?.items?.length === 0 || !this.carrito || !this.carrito.items) return;
  
    //Preparar el carrito para la venta
    this.carritoParaVenta = CarritoCompra.fromJSON(this.carrito);

    //Enviar para la venta
    this.mostrarVentaModal = true;
  }

  agregarItem(item: ItemCarrito) {
    this.carrito?.items?.push(item);

    this.calcularTotalCarrito();
  }

  //Para cerrar el modal de la venta
  onVentaCancelada() {
    this.mostrarVentaModal = false;
    this.carritoParaVenta = new CarritoCompra();
  }

  onVentaProcesada() {
    this.mostrarVentaModal = false;
    this.carritoParaVenta = new CarritoCompra();
    this.limpiarCarrito();

    //Mostrar mensaje de exito
    this.mostrarModalMensaje('✅ Se ha procesado la venta correctamente');

    //Informar al padre para limpiar la vista
    this.clearView.emit();
  }

  mostrarModalMensaje(mensaje: string) {
    this.title = '👌 Venta Exitosa'
    this.mensaje = mensaje;
    this.openModal = true;
    setTimeout(() => {
      this.openModal = false;
    }, 2000); // Cierra el modal después de 2 segundos
  }

}