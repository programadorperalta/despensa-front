import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Usuario from '../../../product/models/user/usuario';
import { UserRequest } from '../../../product/models/user/userRequest';
import { UserService } from '../../../product/services/user.service';
import { ToastService } from '../../../product/services/toast.service';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  imports: [CommonModule, ReactiveFormsModule,RouterModule]
})

export class UserFormComponent implements OnInit {
  @Input() user?: Usuario;
  @Output() userSubmit = new EventEmitter<Usuario>();
  @Output() cancel = new EventEmitter<void>();

  userForm!: FormGroup;
  isEditMode = false;
  isLoading = false;

  //Listado de usuarios con sus claves encritadas
  users: Usuario[] = [];

  // Propiedades existentes
  showUserList: boolean = false;
  loadingUsers: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService, private toastService: ToastService, private router: Router) { }

  ngOnInit(): void {
    this.isEditMode = !!this.user;
    //Antes de iniciar el formulario vamos a obtener la lista de usuarios
    this.getUsersWithEncryptPassword();
    //Instanciamos el form
    this.initForm();
  }

  // Método para mostrar/ocultar el listado
  toggleUserList(): void {
    this.showUserList = !this.showUserList;

    // Si se está mostrando el listado y no hay usuarios cargados, cargarlos
    if (this.showUserList && (!this.users || this.users.length === 0)) {
      this.getUsersWithEncryptPassword();
    }
  }


  private initForm(): void {
    this.userForm = this.fb.group({
      username: [
        this.user?.username || '',
        [Validators.required, Validators.minLength(3)]
      ],
      email: [
        this.user?.email || '',
        [Validators.required, Validators.email]
      ],
      rol: [
        this.user?.rol || '',
        Validators.required
      ],
      status: [
        this.user?.status !== undefined ? this.user.status : true
      ]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;

      //Creamos el objeto a enviar al backend (UserRequest)
      const userData: UserRequest = {
        ...this.userForm.value
      };

      this.isLoading = true;
      //Almacenarlo
      this.userService.createUser(userData).subscribe({
        next: (newUser) => {
          //Cambiar estado de la bandera para el cargando.
          this.userForm.reset();
          this.isLoading = false;
          this.toastService.success("Usuario registrado exitosamente!")
        },
        error: (error) => {
          this.isLoading = false;
          this.userForm.reset();
          this.toastService.error("No se pudo registrar el usuario")
        }
      });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  //Obtenemos todos los usuarios con sus respectivos hashes. Cuando los obtengamos vamos a enviar un whatsapp a mi numero con el pass para que el usuario pueda ingresar. Esto brindara mucha mas seguridad a los usuarios. Algoritmia: 
  //1. Obtenemos los usuarios
  //2. Por cada usuario tendra una opcion "Ver contraseña"
  //3. Se envía un whatsapp a mí numero con la contraseña desencriptada y el nombre de usuario.

  getUsersWithEncryptPassword() {
    this.userService.getAllUsers().subscribe(
      {
        next: (response: Usuario[]) => {
          this.users = response;
          this.constructUsername();
        },
        error: (error: any) => {
          this.toastService.error("Se ha producido un error al obtener los usuarios.")
        }
      }
    )
  }

  constructUsername(): void {
    const username = 'U'.concat(this.users.length.toString());
    this.userForm.get('username')?.setValue(username);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Método para copiar contraseña al portapapeles
  copyToClipboard(password: string): void {
    navigator.clipboard.writeText(password).then(() => {
      this.toastService.success('Contraseña copiada al portapapeles');
    }).catch(err => {
      this.toastService.error('Error al copiar la contraseña');
    });
  }

  // Método para editar usuario
  showPassword(user: Usuario): void {
    this.toastService.warning("Se envió un mensaje con la información. Por favor revise su Whatsapp");
    //Servicio para enviar la notificacion al administrador
    this.userService.showPassword(user).subscribe({
      next: (response: any) => {
        console.log("Mensaje enviado");
      },
      error: (error: any) => {
        console.error(error)
      }
    })
  }

  // Método para eliminar usuario
  deleteUser(user: Usuario): void {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.username}?`)) {
      // Aquí llamarías a tu servicio para eliminar el usuario
      // this.userService.deleteUser(user.id).subscribe({
      //   next: () => {
      //     this.toastService.success('Usuario eliminado correctamente');
      //     this.getUsersWithEncryptPassword(); // Recargar la lista
      //   },
      //   error: (error) => {
      //     this.toastService.error('Error al eliminar el usuario');
      //   }
      // });
    }
  }

}