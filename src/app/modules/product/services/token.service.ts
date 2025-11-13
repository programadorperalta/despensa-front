import { Injectable } from "@angular/core";
import TokenResponse from "../models/token/tokenResponse";

@Injectable({
    providedIn: 'root'
})

export class TokenService {
    //Guardar Token
    saveTokenResponse(response: any): void {
        const expirationTime = new Date();
        expirationTime.setSeconds(expirationTime.getSeconds() + (response.expires_in || 0));

        localStorage.setItem('MP_TOKEN_RESPONSE', JSON.stringify(response));
        localStorage.setItem('mp_token_expires', expirationTime.toISOString());
    }

    getToken(): string | null {
        if (this.isTokenExpired()) {
            this.clearToken();
            return null;
        }

        const tokenData = localStorage.getItem('MP_TOKEN_RESPONSE');
        if (!tokenData) return null;

        try {
            const response = JSON.parse(tokenData);
            return response.access_token || null;
        } catch {
            return null;
        }
    }

    clearToken(): void {
        localStorage.removeItem('MP_TOKEN_RESPONSE');
        localStorage.removeItem('mp_token_expires');
    }

    hasValidToken(): boolean {
        return !this.isTokenExpired() && !!this.getToken();
    }

    isTokenExpired(): boolean {
        const expires = localStorage.getItem('mp_token_expires');
        if (!expires) return true;

        return new Date() > new Date(expires);
    }

    getUserId(): number | null{
        const tokenData = localStorage.getItem('MP_TOKEN_RESPONSE');
        if (!tokenData) return null;

        try {
            const response = JSON.parse(tokenData);
            return response.user_id || null;
        } catch {
            return null;
        }
    }
}
