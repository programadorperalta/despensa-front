import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import Producto from "../models/product";
import { environment } from "../../../../environments/environments";

@Injectable({
  providedIn: 'root'
})

export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/all`);
  }

  getProductByBarraCode(barcode: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/barra-code/${barcode}`);
  }

  createProduct(product: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, product);
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/desactivate/${productId}`);
  }

  activateProduct(productId:string):Observable<any>{
    return this.http.delete(`${this.apiUrl}/activate/${productId}`)
  }

  updateProduct(id: string, product: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, product);
  }
}

