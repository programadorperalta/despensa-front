import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environments";
import { Observable } from "rxjs";
import Tienda from "../models/tienda/tienda";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class TiendaService {
    private apiUrl = `${environment.apiUrl}/tiendas`

    constructor(private http: HttpClient) {

    }

    getAllTiendas(): Observable<Tienda[]> {
        return this.http.get<Tienda[]>(`${this.apiUrl}/all`);
    }

    //Funcion para crear la tienda. Las validaciones se hacen del lado del back. 
    createTienda(tienda: Tienda): Observable<Tienda> {
        return this.http.post<Tienda>(this.apiUrl, tienda);
    }
}