import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environments";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import UsuarioTienda from "../models/user/usuarioTienda";

@Injectable({
    providedIn: 'root'
})

export class UserTiendaService {
    private apiUrl = `${environment.apiUrl}/userTienda`

    constructor(private http: HttpClient) { }

    getAllUsersTiendas(): Observable<UsuarioTienda[]> {
        return this.http.get<UsuarioTienda[]>(`${this.apiUrl}/all`);
    }

    createUserTienda(usuarioTienda: UsuarioTienda): Observable<UsuarioTienda> {
        return this.http.post<UsuarioTienda>(this.apiUrl, usuarioTienda);
    }

    deleteAsocciation(asocciationId: string) : Observable<any>{
        return this.http.delete(`${this.apiUrl}/${asocciationId}`)
    }
}