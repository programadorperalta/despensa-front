export class UserRequest {
    id : number;
    username:string;
    email:string;
    password?:string | null;
    rol: string;
    status:boolean;

    constructor(id:number,username:string,email:string,password:string| null,rol:string,status:boolean){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.rol = rol;
        this.status = status;
    }
    
}