//La aplicacion esta planteada para que una tienda pueda tener varios usuarios

export default class Tienda{
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;

    constructor(id: number, nombre: string, direccion: string, telefono: string){
        this.id = id;
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
    }

    static fromJSON(json: any): Tienda {
        return new Tienda(
            json.id,
            json.nombre,
            json.direccion,
            json.telefono
        );
    }
}