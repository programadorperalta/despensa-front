import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environments";
import { HttpClient } from "@angular/common/http";
import { UserRequest } from "../models/user/userRequest";
import { Observable } from "rxjs";
import Usuario from "../models/user/usuario";

@Injectable({
    providedIn: 'root'
})

export class UserService {
    private apiUrl = `${environment.apiUrl}/user`

    constructor(private http: HttpClient) {
    }

    getAllUsers(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.apiUrl}/all`);
    }

    createUser(user: UserRequest): Observable<any> {
        return this.http.post<UserRequest>(this.apiUrl, user);
    }

    updateUser(newUsuario: any): Observable<any> {
        return this.http.put<any>(this.apiUrl.concat("/update"), newUsuario);
    }

    existsUser(username: string): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/exists`, {
            params: { username: username }
        });
    }

    showPassword(user:Usuario):Observable<any>{
        return this.http.post(this.apiUrl.concat("/sh0wPassw0rd"),user);
    }
}