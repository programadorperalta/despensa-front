import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import CarritoCompra from '../../models/carritoCompra';
import { RoleService } from '../../services/role.service';
import { ToastService } from '../../services/toast.service';

export interface ProductoVenta {
  id: number;
  name: string;
  price: number;
  cantidad: number;
  subtotal: number;
}

export interface MetodoPago {
  value: string;
  nombre: string;
  icono: string;
}


@Component({
  selector: 'app-venta-form',
  imports: [CommonModule, FormsModule],
  providers: [VentaService],
  templateUrl: './venta-form.component.html',
  styleUrl: './venta-form.component.scss'
})

export class VentaForm {
  @Input() carritoParaVenta: CarritoCompra | null = null;
  @Output() ventaConfirmada = new EventEmitter<any>();
  @Output() ventaCancelada = new EventEmitter<void>();
  productosParaVenta: ProductoVenta[] = [];

  constructor(private ventaService: VentaService, private roleService: RoleService, private toastService: ToastService) { }

  metodoSeleccionado: string = '';
  metodosPago: MetodoPago[] = [
    { value: '1', nombre: 'Efectivo', icono: '💵' },
    { value: '2', nombre: 'Transferencia', icono: '🏦' },
    { value: '3', nombre: 'Tarjeta', icono: '💳' }
  ];

  cerrarModal() {
    this.ventaCancelada.emit();
  }

  calcularSubtotal(): number {
    if (!this.carritoParaVenta || !this.carritoParaVenta.items) return 0;
    return this.carritoParaVenta?.items.reduce((total, item) => total + item.subtotal, 0);
  }

  calcularTotal(): number {
    return this.calcularSubtotal();
  }

  confirmarVenta() {
    if (!this.metodoSeleccionado) return;
    this.generarVenta();
  }

  generarVenta(): void {
    //Generar los datos de la venta
    if (!this.carritoParaVenta || !this.carritoParaVenta.items) return;

    //Obtener los productos  
    const productos: ProductoVenta[] = this.carritoParaVenta.items.map(item => ({
      id: item.id!,
      name: item.name,
      price: item.price,
      cantidad: item.cantidad,
      subtotal: item.subtotal
    }));

    //Setear a productos para la venta
    this.productosParaVenta = productos;

    //Generar el objeto de la venta
    const ventaData = {
      products: productos,
      metodoPago: this.metodoSeleccionado,
      total: this.calcularTotal(),
      createdAt: new Date(),
      tiendaId: this.roleService.findIdsTiendas()?.[0] || null
    };

    //Almacenar la venta en la DB
    this.guardarVenta(ventaData);
  }

  guardarVenta(ventaData: any) {
    // Implementar lógica para guardar en base de datos
    this.ventaService.createSell(ventaData).subscribe({
      next: (response) => {
        if (response.id != null) {
          this.toastService.success("Venta creada exitosamente!")
          //Comunicar al 
          this.ventaConfirmada.emit();
        }
      },
      error: (error) => {
        this.toastService.error("Se ha producido un error al generar la venta")
      }
    });
  }

}
