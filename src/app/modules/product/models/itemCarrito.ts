export default class ItemCarrito{
  id: number;
  name: string;
  price: number;
  barraCode: string;
  stock: number;
  cantidad: number;
  subtotal: number;

    constructor(data: Partial<ItemCarrito>) {
        this.id = data.id ?? 0;
        this.name = data.name ?? '';
        this.price = data.price ?? 0;
        this.barraCode = data.barraCode ?? '';
        this.stock = data.stock ?? 0;
        this.cantidad = data.cantidad ?? 1;
        this.subtotal = data.subtotal ?? this.price * this.cantidad;
    }
}