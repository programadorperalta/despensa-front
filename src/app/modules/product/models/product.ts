export default class Producto {
    id?: number;
    description?: string;
    name?:string;
    price?: number;
    status?:boolean;
    barraCode?:string;
    category?:string;
    stock?:number;
    tiendaId?: number;
    cantidad?:number;
    //tienda: Tienda | null;
    
    constructor(data?: any) {
        this.id = data?.id;
        this.name = data?.name ?? '';
        this.description = data?.description;
        this.price = data?.price ?? 0;
        this.stock = data?.stock ?? 0;
        this.category = data?.category;
        this.status = data?.status ?? true;
        this.barraCode = data?.barraCode;
        this.tiendaId = data?.tiendaId;
        this.cantidad = data?.cantidad;
    }

    static fromJSON(obj: any): Producto {
        if (!obj) return new Producto();
        return new Producto({
            id: obj.id,
            name: obj.name ?? obj.nombreProducto ?? '',
            description: obj.description ?? obj.desc,
            price: obj.price !== undefined ? Number(obj.precio) : 0,
            stock: obj.stock !== undefined ? Number(obj.stock) : 0,
            category: obj.category ?? obj.categoria,
            barraCode: obj.barraCode ?? obj.codigoBarra,
            status: obj.status !== undefined ? Boolean(obj.disponible) : true,
            tiendaId: obj.tiendaId ?? obj.tiendaId,
            cantidad:obj.cantidad ?? obj.cantidad
        });
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            barraCode:this.barraCode,
            stock: this.stock,
            category: this.category,
            status: this.status,
            tiendaId: this.tiendaId,
            cantidad: this.cantidad
        };
    }
}