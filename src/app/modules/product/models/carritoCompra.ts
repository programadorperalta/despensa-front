import ItemCarrito from "./itemCarrito";

export default class CarritoCompra{
    id?: number;
    items?: ItemCarrito[];
    subtotal?: number;
    totalPrice?: number;
    
    constructor(data?: Partial<CarritoCompra>) {
        this.id = data?.id;
        this.items = data?.items ?? [];
        this.subtotal = data?.subtotal ?? 0;
        this.totalPrice = data?.totalPrice ?? 0;
    }

    static fromJSON(obj: CarritoCompra): CarritoCompra {
    if (!obj) return new CarritoCompra();
    
    return new CarritoCompra({
        id: obj.id,
        // Convertir cada item a instancia de ItemCarrito
        items: obj.items ? obj.items.map(item => new ItemCarrito(item)) : [],
        subtotal: obj.subtotal !== undefined ? Number(obj.subtotal) : 0,
        totalPrice: obj.totalPrice !== undefined ? Number(obj.totalPrice) : 0,
    });
}

    toJSON() {
        return {
            id: this.id,
            items: this.items,
            subtotal:this.subtotal,
            totalPrice: this.totalPrice
        };
    }
}