import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../services/venta.service';
import Venta from '../../models/venta';
import Producto from '../../models/product';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RoleService } from '../../services/role.service';
import { ModalComponent } from '../modal.component/modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-venta-list',
  imports: [CommonModule, RouterLink, FormsModule, ModalComponent],
  templateUrl: './venta-list.component.html',
  styleUrl: './venta-list.component.scss'
})
export class VentaListComponent implements OnInit {
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  cargando: boolean = true;

  //Elementos para el modal
  message: string = '';
  title: string = '';
  openModal: boolean = false;

  // Filtros
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroMetodoPago: string = '';
  filtroMontoMinimo: number = 0;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;

  constructor(private ventaService: VentaService, private roleService: RoleService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.loadVentas();
  }

  loadVentas(): void {
    this.cargando = true;
    this.ventaService.getAllSells().subscribe({
      next: (ventas) => {
        this.ventas = ventas;
        this.ventasFiltradas = ventas;
        this.calcularTotalPaginas();
        this.cargando = false;
      },
      error: (error: any) => {
        console.error("Error cargando las ventas", error);
        this.cargando = false;
      }
    });
  }

  // Métodos para estadísticas
  getTotalVentas(): number {
    return this.ventasFiltradas.reduce((sum, venta) => sum + (venta.total || 0), 0);
  }

  getVentasMes(): number {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return this.ventasFiltradas
      .filter(venta => venta.createdAt && new Date(venta.createdAt) >= inicioMes)
      .reduce((sum, venta) => sum + (venta.total || 0), 0);
  }

  getVentasHoy(): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.ventasFiltradas
      .filter(venta => venta.createdAt && new Date(venta.createdAt) >= hoy)
      .reduce((sum, venta) => sum + (venta.total || 0), 0);
  }

  getPromedioVenta(): number {
    const total = this.getTotalVentas();
    const count = this.ventasFiltradas.length;
    return count > 0 ? total / count : 0;
  }


  // Métodos para filtros
  aplicarFiltros(): void {
    this.ventasFiltradas = this.ventas.filter(venta => {
      let cumpleFiltro = true;

      // Filtro por fecha inicio - CORREGIDO
      if (this.filtroFechaInicio && venta.createdAt) {
        // Para venta.createdAt (que es ISO string con hora) - usar la fecha local
        const fechaVenta = new Date(venta.createdAt);
        const fechaVentaLocal = new Date(fechaVenta.getFullYear(), fechaVenta.getMonth(), fechaVenta.getDate());

        // Para filtroFechaInicio (que es YYYY-MM-DD) - parsear manualmente
        const [year, month, day] = this.filtroFechaInicio.split('-').map(Number);
        const fechaInicioLocal = new Date(year, month - 1, day);

        cumpleFiltro = cumpleFiltro && fechaVentaLocal >= fechaInicioLocal;
      }

      // Filtro por fecha fin - CORREGIDO
      if (this.filtroFechaFin && venta.createdAt) {
        // Para venta.createdAt (que es ISO string con hora) - usar la fecha local
        const fechaVenta = new Date(venta.createdAt);
        const fechaVentaLocal = new Date(fechaVenta.getFullYear(), fechaVenta.getMonth(), fechaVenta.getDate());

        // Para filtroFechaFin (que es YYYY-MM-DD) - parsear manualmente
        const [year, month, day] = this.filtroFechaFin.split('-').map(Number);
        const fechaFinLocal = new Date(year, month - 1, day);

        cumpleFiltro = cumpleFiltro && fechaVentaLocal <= fechaFinLocal;
      }

      if (this.filtroMetodoPago && venta.metodoPago) {
        cumpleFiltro = cumpleFiltro && venta.metodoPago === this.filtroMetodoPago;
      }

      if (this.filtroMontoMinimo > 0 && venta.total) {
        cumpleFiltro = cumpleFiltro && venta.total >= this.filtroMontoMinimo;
      }

      return cumpleFiltro;
    });

    this.paginaActual = 1;
    this.calcularTotalPaginas();
  }

  // Métodos de utilidad
  getNombresProductos(productos: Producto[]): string {
    return productos.slice(0, 3).map(p => p.name).join(', ') +
      (productos.length > 3 ? '...' : '');
  }

  // Métodos de paginación
  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.ventasFiltradas.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Métodos de acciones
  verDetalle(venta: Venta): void {
    //Abrir el popup y mostrar el detalle de la venta: 
    this.openModal = true;
    //Armar el titulo 
    this.title = `Detalle de venta ${venta.id} - ${venta.createdAt} - ${venta.total}`
    //Armar el cuerpo del mensajea
    this.message = `Detalles de la Venta

    ID: ${venta.id || 'N/A'}
    Método de Pago: ${this.determinarMetodoPago(venta.metodoPago) || 'N/A'}
    Total: $${venta.total?.toFixed(2) || '0.00'}
    Fecha: ${venta.createdAt ? new Date(venta.createdAt).toLocaleString() : 'N/A'}

    Productos:${venta.products?.map(p => `${p.name} x${p.cantidad} - $${p.price}`).join('\n') || 'Sin productos'}`;
  }

  determinarMetodoPago(id: string | undefined): string {
    let name = '';

    switch (id) {
      case '1':
        name = 'Efectivo';
        break;

      case '2':
        name = 'Transferencia';
        break;

      case '3':
        name = 'Tarjeta'
        break;

      case undefined:
        name = 'No se puede determinar el metodo de pago'
        break;
    }

    return name;
  }

  generarRecibo(venta: Venta): void {
    try {
      // Validación básica
      if (!venta) {
        throw new Error('No se proporcionaron datos de venta');
      }

      // Crear nuevo documento PDF
      const doc = new jsPDF();

      // Configuración del documento
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;

      // ===== ENCABEZADO DEL RECIBO =====
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('RECIBO DE VENTA', pageWidth / 2, margin, { align: 'center' });

      // Línea decorativa
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, margin + 5, pageWidth - margin, margin + 5);

      // ===== INFORMACIÓN DE LA VENTA =====
      let yPosition = margin + 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);

      // Número de recibo
      doc.text(`Recibo N°: ${venta.id?.toString().padStart(6, '0') || '000000'}`, margin, yPosition);
      yPosition += 7;

      // Fecha
      const fecha = venta.createdAt ? new Date(venta.createdAt) : new Date();
      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Fecha: ${fechaFormateada}`, margin, yPosition);
      yPosition += 7;

      // Método de pago
      doc.text(`Método de Pago: ${this.formatearMetodoPago(venta.metodoPago || '')}`, margin, yPosition);
      yPosition += 7;

      // Tienda
      yPosition += 15;

      // ===== TABLA DE PRODUCTOS =====
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('DETALLE DE PRODUCTOS', margin, yPosition);
      yPosition += 10;

      // Preparar datos para la tabla
      const tableData = this.prepararDatosTabla(venta.products || []);

      autoTable(doc, {
        startY: yPosition,
        head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: margin, right: margin }
      });

      // Obtener la posición Y final de la tabla
      const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50;
      const finalYPosition = finalY + 10;

      // ===== TOTALES =====
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);

      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(pageWidth - 80, finalYPosition, pageWidth - margin, finalYPosition);

      // Total
      doc.text('TOTAL:', pageWidth - 75, finalYPosition + 8);
      doc.text(this.formatearMoneda(venta.total || 0), pageWidth - margin, finalYPosition + 8, { align: 'right' });

      // ===== PIE DE PÁGINA =====
      const footerY = doc.internal.pageSize.getHeight() - 20;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text('¡Gracias por su compra!', pageWidth / 2, footerY, { align: 'center' });
      doc.text('Sistema de Gestión - Mi Despensa', pageWidth / 2, footerY + 5, { align: 'center' });

      // ===== GUARDAR PDF =====
      const nombreArchivo = `recibo_${venta.id?.toString().padStart(6, '0') || '000000'}_${fecha.getTime()}.pdf`;

      // Intentar guardar el archivo
      doc.save(nombreArchivo);

      this.toastService.success("Se ha descargado el archivo correctamente")

    } catch (error) {
      this.toastService.error("Se ha producido un error al intentar descargar.")
    }
  }


  // ===== MÉTODOS AUXILIARES =====

  /**
   * Prepara los datos para la tabla de productos
   */
  private prepararDatosTabla(productos: Producto[]): any[][] {
    return productos.map(producto => [
      producto.name || 'Producto sin nombre',
      producto.cantidad?.toString() || '1',
      this.formatearMoneda(producto.price || 0),
      this.formatearMoneda((producto.price || 0) * (producto.cantidad || 1))
    ]);
  }

  /**
   * Formatea el método de pago para mostrarlo mejor
   */
  private formatearMetodoPago(metodo: string): string {
    const metodos: { [key: string]: string } = {
      '1': 'Efectivo',
      '2': 'Transferencia Bancaria',
      '3': 'Tarjeta',
      '4': 'Transferencia',
      '5': 'Mercado Pago',
      'efectivo': 'Efectivo',
      'tarjeta': 'Tarjeta',
      'transferencia': 'Transferencia',
      'mercadopago': 'Mercado Pago'
    };

    return metodos[metodo.toLowerCase()] || metodo;
  }

  /**
   * Formatea números como moneda
   */
  private formatearMoneda(monto: number): string {
    return `$${monto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }

  /**
   * Método alternativo para generar recibo con diseño más simple
   */
  generarReciboSimple(venta: Venta): void {
    const doc = new jsPDF();

    // Encabezado
    doc.setFontSize(16);
    doc.text('RECIBO DE VENTA', 20, 20);
    doc.setFontSize(10);
    doc.text(`N°: ${venta.id}`, 20, 30);
    doc.text(`Fecha: ${new Date(venta.createdAt || '').toLocaleDateString()}`, 20, 37);

    // Productos
    let y = 50;
    doc.text('Productos:', 20, y);
    y += 10;

    (venta.products || []).forEach((producto, index) => {
      const subtotal = (producto.price || 0) * (producto.cantidad || 1);
      doc.text(
        `${producto.name} - ${producto.cantidad} x $${producto.price} = $${subtotal}`,
        25,
        y + (index * 7)
      );
    });

    // Total
    const totalY = y + ((venta.products?.length || 0) * 7) + 15;
    doc.setFontSize(12);
    doc.text(`TOTAL: $${venta.total}`, 20, totalY);

    // Guardar
    doc.save(`recibo_${venta.id}.pdf`);
  }

  closeModal(): void {
    this.openModal = false;
  }
}

