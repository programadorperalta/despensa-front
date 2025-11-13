import Producto from "./product";

export default class Venta{
    id?: number;
    products?: Producto[]
    metodoPago?: string;
    total?: number;
    createdAt?: Date;
    tiendaId?:number;

    constructor(data?: Partial<Venta>) {
        this.id = data?.id;
        this.products = data?.products ?? [];
        this.metodoPago = data?.metodoPago ?? '';
        this.total = data?.total ?? 0;
        this.createdAt = data?.createdAt ?? new Date();
        this.tiendaId = data?.tiendaId ?? 0;
    }

    static fromJSON(json: any): Venta {
        return new Venta({
            id: json.id,
            products: json.products ? json.products.map((prodJson: any) => Producto.fromJSON(prodJson)) : [],
            metodoPago: json.metodoPago,
            total: json.total,
            createdAt: new Date(json.createdAt),
            tiendaId: json.tiendaId
        });
    }
}   
