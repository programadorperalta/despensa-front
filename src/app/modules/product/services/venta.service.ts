import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environments";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import Venta from "../models/venta";

@Injectable({
    providedIn: 'root'
})

export class VentaService {
    private apiUrl = `${environment.apiUrl}/sells`

    constructor(private http: HttpClient) { }

    getAllSells(): Observable<Venta[]> {
        return this.http.get<Venta[]>(`${this.apiUrl}/all`);
    }

    createSell(venta: Venta): Observable<Venta> {
        return this.http.post<Venta>(this.apiUrl, venta);
    }



}