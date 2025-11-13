//El usuario del sistema. 
// No está vinculado a una tienda específica. 
// Se usa para crear los demas usuarios y vincularlos a las tiendas. 

export default class Usuario{
    id: number;
    username: string;
    email: string;
    password: string;
    rol: 'normal' | 'administrador';
    status: boolean;
    
    constructor(id: number, username: string, email: string, password: string, rol: 'normal' | 'administrador' = 'normal',status:boolean){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.status = status;
    }

    static fromJSON(json: any): Usuario {
        return new Usuario(
            json.id,
            json.username,
            json.email,
            json.password,
            json.rol,
            json.status
        );
    }
}