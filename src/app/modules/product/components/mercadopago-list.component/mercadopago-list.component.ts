import { Component, Input, OnInit, Output } from '@angular/core';
import { ModalComponent } from '../modal.component/modal.component';
import TokenRequest from '../../models/token/tokenRequest';
import { MercadoPagoService } from '../../services/mercadoPago.service';
import TokenResponse from '../../models/token/tokenResponse';
import { TokenService } from '../../services/token.service';
import { PayReq } from '../../models/payment/paymentRequest';
import { PayResponse } from '../../models/payment/paymentResponse'; // Asegúrate de importar tu PayResponse
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-mercadopago-list.component',
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './mercadopago-list.component.html',
  styleUrl: './mercadopago-list.component.scss'
})
export class MercadopagoListComponent implements OnInit {
  //Recibe del popup la información del cliente
  @Input() tokenResponse: string = '';
  //Bandera para decirle al popup que estamos enviando desde el componente de mercado pagos
  isMercadoPago: boolean = false;
  openModal: boolean = false;
  title: string = '';
  message: string = '';

  //Bandera para poder habilitar una seccion del HTML en caso de no encontrar el token o se cierre el modal
  existsToken: boolean = false;

  //TokenRequest y TokenResponse
  tokenRequest?: TokenRequest;

  // Variables para listar pagos
  payments: PayResponse[] = [];
  filteredPayments: PayResponse[] = [];
  loading: boolean = false;

  // Filtros
  searchTerm: string = '';
  statusFilter: string = '';
  paymentMethodFilter: string = '';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  ngOnInit(): void {
    //Al iniciar la vista debemos llamar al popup para poder solicitar los datos
    if (this.tokenService.isTokenExpired()) {
      this.generarCuerpoModal();
    } else {
      //En caso de que el token no esté expirado se busca los pagos con los datos del localStorage
      this.loadPayments();
      this.existsToken = true;
    }
  }

  constructor(private mercadoPagoService: MercadoPagoService, private tokenService: TokenService, private toastService: ToastService) { }

  generarCuerpoModal(): void {
    this.title = "Credenciales de autenticación"
    this.message = "Por favor ingrese los datos para obtener la información de mercado pago"
    //Banderas para abrir modal
    this.isMercadoPago = true;
    this.openModal = true;
  }

  obtenerCredencialesModal(object: any): void {
    //Recibimos las credenciales y ahora vamos al servicio para obtener el TokenResponse
    //Mapeamos en un objeto tokenRequest
    this.tokenRequest = new TokenRequest(
      object.client_id,
      object.client_secret
    );

    //Enviamos a la api para obtener la respuesta:
    this.mercadoPagoService.obtainToken(this.tokenRequest).subscribe({
      next: (response) => {
        this.saved(response);
        //En caso de exito debemos cambiar el estado de la bandera
        this.existsToken = true;
        //Mostrar mensaje
        this.toastService.success("Credenciales válidas 🎉")
        //Obtener los pagos:
        this.loadPayments();
        //Cerrar el modal
        this.openModal = false;
      },
      error: (error: any) => {
        this.toastService.error("Las credenciales no son correctas. Intente nuevamente.")
      }
    })
  }

  //Almacenar el token en el localStorage
  saved(tokenResponse: TokenResponse): void {
    this.tokenService.saveTokenResponse(tokenResponse);
  }

  loadPayments(): void | null {
    const user_id = this.tokenService.getUserId();
    const access_token = this.tokenService.getToken();
    if (!user_id && !access_token) return null

    //Armar objeto paymentRequest
    const paymentRequest = new PayReq(access_token!, user_id!);
    //Una vez armado vamos a buscar los payments: 
    if (!paymentRequest) return null;

    this.loading = true;
    this.mercadoPagoService.getAllPayments(paymentRequest).subscribe({
      next: (response: any) => {
        this.payments = response;
        this.filteredPayments = [...this.payments];
        this.applyFilter();
        this.loading = false;
      },
      error: (error: any) => {
        console.error("Error al obtener los pagos.", error);
        this.loading = false;
      }
    })
  }

  // Métodos para filtros y paginación
  applyFilter(): void {
    let filtered = this.payments;

    // Filtro de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.description?.toLowerCase().includes(term) ||
        payment.id?.toString().includes(term) ||
        payment.external_reference?.toLowerCase().includes(term) ||
        payment.payer?.email?.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (this.statusFilter) {
      filtered = filtered.filter(payment => payment.status === this.statusFilter);
    }

    // Filtro por método de pago
    if (this.paymentMethodFilter) {
      filtered = filtered.filter(payment => payment.payment_method_id === this.paymentMethodFilter);
    }

    this.filteredPayments = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPayments.length / this.pageSize);
    this.currentPage = 1;
    this.paginatePayments();
  }

  paginatePayments(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredPayments = this.filteredPayments.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginatePayments();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginatePayments();
    }
  }

  // Métodos de utilidad para la vista
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  }

  formatTime(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'approved': return 'in-stock';
      case 'pending': return 'low-stock';
      case 'rejected': return 'out-of-stock';
      default: return 'low-stock';
    }
  }

  getStatusText(status: string | undefined): string {
    if (!status) return 'Desconocido';
    const statusMap: { [key: string]: string } = {
      'approved': 'Aprobado',
      'pending': 'Pendiente',
      'rejected': 'Rechazado',
      'authorized': 'Autorizado',
      'in_process': 'En proceso',
      'in_mediation': 'En mediación',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado'
    };
    return statusMap[status] || status;
  }

  getPaymentMethodText(methodId: string | undefined): string {
    if (!methodId) return 'Desconocido';
    const methodMap: { [key: string]: string } = {
      'account_money': 'Saldo MP',
      'cvu': 'Transferencia',
      'interop_transfer': 'QR',
      'credit_card': 'Tarjeta Crédito',
      'debit_card': 'Tarjeta Débito',
      'ticket': 'Ticket'
    };
    return methodMap[methodId] || methodId;
  }

  // Acciones
  viewPaymentDetails(payment: PayResponse): void {
    console.log('Ver detalles del pago:', payment);
    // Puedes implementar un modal de detalles aquí
  }

  refundPayment(payment: PayResponse): void {
    if (confirm(`¿Estás seguro de que deseas reembolsar el pago ${payment.id}?`)) {
      console.log('Reembolsar pago:', payment);
      // Implementar lógica de reembolso
    }
  }

  reloadPayments(): void {
    this.loadPayments();
  }

  closeModal(): void {
    this.openModal = false;
    this.isMercadoPago = true;
  }

  openModalInCaseNotExists(): void {
    this.generarCuerpoModal();
  }
}