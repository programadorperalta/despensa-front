//Vinculacion entre un usuario y una tienda.
export default class UsuarioTienda{
    id: number;
    usuarioId: number;
    tiendaId: number;   
    asignacion: Date;

    constructor(id: number, usuarioId: number, tiendaId: number, asignacion: Date = new Date()){
        this.id = id;
        this.usuarioId = usuarioId;
        this.tiendaId = tiendaId;
        this.asignacion = asignacion;
    }
    
    static fromJSON(json: any): UsuarioTienda {
        return new UsuarioTienda(
            json.id,
            json.usuarioId,
            json.tiendaId,
            new Date(json.asignacion)
        );
    }

    
}