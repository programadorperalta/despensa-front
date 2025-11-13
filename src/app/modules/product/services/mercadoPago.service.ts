import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environments";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import TokenResponse from "../models/token/tokenResponse";
import TokenRequest from "../models/token/tokenRequest";
import { PayReq } from "../models/payment/paymentRequest";

@Injectable({
    providedIn: 'root'
})

export class MercadoPagoService {
    private apiUrl = `${environment.apiUrl}/mercadopago`
    private apiUrlPayments = `${environment.apiUrl}/payments`

    constructor(private http: HttpClient) { }

    obtainToken(tokenRequest: any): Observable<TokenResponse> {
        const uri: string = '/obtain-token';
        return this.http.post<TokenResponse>(this.apiUrl.concat(uri), tokenRequest);
    }

    getAllPayments(request:PayReq): Observable<PayReq> {
        return this.http.post<PayReq>(`${this.apiUrlPayments}/search`, request);
    }
}

