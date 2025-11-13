import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Usuario from '../../../product/models/user/usuario';
import UsuarioTienda from '../../../product/models/user/usuarioTienda';
import Tienda from '../../../product/models/tienda/tienda';
import { UserService } from '../../../product/services/user.service';
import { TiendaService } from '../../../product/services/tienda.service';
import { UserTiendaService } from '../../../product/services/userTienda.service';
import { response } from 'express';
import { ToastService } from '../../../product/services/toast.service';

@Component({
  selector: 'app-usuario-tienda',
  templateUrl: './user-tienda.component.html',
  styleUrls: ['./user-tienda.component.scss'],
  imports: [CommonModule, FormsModule]
})

export class UserTiendaComponent implements OnInit {
  // Arrays
  usuarios: Usuario[] = [];
  tiendas: Tienda[] = [];
  asignaciones: UsuarioTienda[] = [];

  // Filtros y estado
  searchTerm: string = '';
  selectedTienda: number = 0;
  selectedUsuario: number = 0;
  asignacionesFiltradas: UsuarioTienda[] = [];

  // Paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Modal
  showModal: boolean = false;
  nuevaAsignacion: any;
  formSubmitted: boolean = false;
  isLoading: boolean = false;

  //Elementos a visualizar
  asignacionesToVisualice: any[] = [];

  constructor(private userService: UserService, private tiendaService: TiendaService, private userTiendas: UserTiendaService, private toastService: ToastService) { }

  ngOnInit(): void {
    this.inicializarArrays();
    //this.applyFilters();
  }

  inicializarArrays() {
    //Colocar los arrays a cero
    this.asignaciones = [];
    this.usuarios = [];
    this.tiendas = [];
    this.asignacionesToVisualice = [];


    //Cargamos los usuarios
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        this.usuarios = response;
      },
      error: (error) => {
        console.error("Se ha producido un error", error);
      }
    })

    //Cargamos las tiendas
    this.tiendaService.getAllTiendas().subscribe({
      next: (response) => {
        this.tiendas = response;
      },
      error: (error) => {
        console.error("Se ha producido un error", error)
      }
    })

    //Cargamos las relaciones existentes
    this.userTiendas.getAllUsersTiendas().subscribe({
      next: (response) => {
        this.asignaciones = response;
        //Debemos obtener los objetos del backend (usuario,tienda)
        this.createObjectToVisualize();
      },
      error: (error) => {
        console.error("Se ha producido un error", error)
      }
    })
  }


  createObjectToVisualize(): void {
    //Tenemos el array de usuarios, tiendas y asignaciones. El objeto resultante debe ser: 
    /**
     * {
     *  usuario: usuario,
     *  tienda: tienda,
     *  userTiendaId: id
     * }
     * 
     */
    this.asignaciones.forEach(element => {
      //Buscar el usuario asociado
      const usuario = this.usuarios.find(user => user.id == element.usuarioId);
      //Buscar la tienda asociada
      const tienda = this.tiendas.find(tienda => tienda.id == element.tiendaId);
      //Asignacion ID
      const asignacionID = element.id;

      //Armar objeto resultante por cada uno y almacenarlo en un array de elementos
      this.asignacionesToVisualice.push({
        usuario: usuario,
        tienda: tienda,
        asignacionID: asignacionID,
        asignacion: element.asignacion
      })
    })
  }

  // Filtros
  applyFilters(): void {
    let filtered = this.asignaciones;

    // Filtro por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(asignacion =>
        this.getUsuarioNombre(asignacion.usuarioId).toLowerCase().includes(term) ||
        this.getTiendaNombre(asignacion.tiendaId).toLowerCase().includes(term)
      );
    }

    // Filtro por tienda
    if (this.selectedTienda) {
      filtered = filtered.filter(asignacion => asignacion.tiendaId === this.selectedTienda);
    }

    // Filtro por usuario
    if (this.selectedUsuario) {
      filtered = filtered.filter(asignacion => asignacion.usuarioId === this.selectedUsuario);
    }

    this.asignacionesFiltradas = filtered;
    this.updatePagination();
  }

  // Métodos de ayuda para obtener nombres
  getUsuarioNombre(usuarioId: number): string {
    const usuario: any = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.username : 'Usuario no encontrado';
  }

  getUsuarioEmail(usuarioId: number): string {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.email : '';
  }

  getTiendaNombre(tiendaId: number): string {
    const tienda = this.tiendas.find(t => t.id === tiendaId);
    return tienda ? tienda.nombre : 'Tienda no encontrada';
  }

  getTiendaDireccion(tiendaId: number): string {
    const tienda: any = this.tiendas.find(t => t.id === tiendaId);
    return tienda ? tienda.direccion : '';
  }

  // Usuarios disponibles para asignar (que no están ya asignados a esa tienda)
  get usuariosDisponibles(): Usuario[] {
    return this.usuarios.filter(usuario =>
      !this.asignaciones.some(asignacion =>
        asignacion.usuarioId === usuario.id &&
        asignacion.tiendaId === this.nuevaAsignacion.tiendaId
      )
    );
  }

  // Tiendas disponibles para asignar
  get tiendasDisponibles(): Tienda[] {
    return this.tiendas;
  }

  // Verificar si la asignación ya existe
  get asignacionExistente(): boolean {
    return this.asignaciones.some(asignacion =>
      asignacion.usuarioId === this.nuevaAsignacion.usuarioId &&
      asignacion.tiendaId === this.nuevaAsignacion.tiendaId
    );
  }

  // Modal
  openAsignacionModal(): void {
    this.showModal = true;
    this.nuevaAsignacion = { usuarioId: 0, tiendaId: 0, asignacion: new Date() };
    this.formSubmitted = false;
  }

  closeModal(): void {
    this.showModal = false;
    this.formSubmitted = false;
  }

  confirmarAsignacion(): void {
    this.formSubmitted = true;

    if (!this.nuevaAsignacion.usuarioId || !this.nuevaAsignacion.tiendaId || this.asignacionExistente) {
      return;
    }

    this.isLoading = true;

    const nuevaAsignacion: UsuarioTienda = {
      ...this.nuevaAsignacion
    };

    //Enviar al backend para almacenar
    this.userTiendas.createUserTienda(nuevaAsignacion).subscribe({
      next: () => {
        this.isLoading = false;
        this.applyFilters();
        this.closeModal();
        this.toastService.success("Asociacion registrada exitosamente!")
        this.inicializarArrays();
      },
      error: () => {
        this.isLoading = false;
        this.applyFilters();
        this.closeModal();
        this.toastService.error("Se ha producido un error al registrar la asociacion.")
      }
    })
  }

  // Eliminar asignación
  eliminarAsignacion(asignacion: any): void {

    if (confirm('¿Está seguro de que desea eliminar esta asignación?')) {
      this.isLoading = true;
      this.userTiendas.deleteAsocciation(asignacion.asignacionID?.toString()).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.warning("Se ha eliminado la asociacion.")
          this.inicializarArrays();
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error("Se ha producido un error.")
          this.inicializarArrays();
        }
      })
    }
  }

  // Paginación
  updatePagination(): void {
    this.totalPages = Math.ceil(this.asignacionesFiltradas.length / this.pageSize);
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}