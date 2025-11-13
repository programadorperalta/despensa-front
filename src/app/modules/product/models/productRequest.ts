export default class ProductRequest {
    name: string | undefined;
    description?: string;
    price: number | undefined;
    barra_code?:string;
    stock: number | undefined;
    category?:string;
    status?:boolean;

    constructor(data?: any) {
        this.name = data?.name;
        this.description = data?.description;
        this.price = data?.price;
        this.barra_code = data?.barra_code;
        this.stock = data?.stock;
        this.category = data?.category;
        this.status = data?.status;
    }
}