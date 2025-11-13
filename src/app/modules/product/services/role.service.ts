// src/app/services/role.service.ts
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    exp: number;
    iat: number;
    rol: string[];
    username?: string;
    tiendas?: number[];
    isGeneric?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly TIENDAS_IDS = 'tiendas_ids';

    constructor() { }

    getUserRoles(): string[] {
        const token = this.getToken();
        if (!token) {
            return [];
        }

        try {
            const decoded: DecodedToken = jwtDecode(token);
            return decoded.rol || [];
        } catch (error) {
            console.error('Error decoding token:', error);
            return [];
        }
    }

    getIsGeneric(): boolean | null {
        const token = this.getToken();
        if (!token) {
            return null
        }
        try {
            const decoded: DecodedToken = jwtDecode(token);
            return decoded.isGeneric || null
        } catch (error) {
            console.error("No se pudo obtener si es generico", error)
            return null;
        }
    }

    isGeneric(): boolean | null {
        const isGeneric = this.getIsGeneric();
        if (isGeneric) {
            return isGeneric;
        } else {
            return null;
        }
    }

    findIdsTiendas(): number[] | null {
        const token = this.getToken();
        if (!token) return null; // Cambié [] por null para consistencia

        try {
            const decoded: DecodedToken = jwtDecode(token);

            // Si decoded.tiendas existe Y tiene elementos
            if (decoded.tiendas && decoded.tiendas.length > 0) {
                localStorage.setItem(this.TIENDAS_IDS, JSON.stringify(decoded.tiendas));
                return decoded.tiendas;
            } else {
                // Si no hay tiendas o el array está vacío
                localStorage.removeItem(this.TIENDAS_IDS);
                return null;
            }
        } catch (error) {
            console.error("No se pudo obtener los ids de las tiendas", error);
            return null; // Cambié [] por null para consistencia
        }
    }

    getTiendas(): number[] {
        const tiendasString = localStorage.getItem(this.TIENDAS_IDS);
        if (tiendasString) {
            try {
                return JSON.parse(tiendasString);
            } catch (error) {
                console.error('Error parsing tiendas IDs from localStorage:', error);
                return [];
            }
        }
        return [];
    }

    isAdmin(): boolean {
        const roles = this.getUserRoles();
        return roles.includes('ADMINISTRADOR');
    }

    hasRole(role: string): boolean {
        const roles = this.getUserRoles();
        return roles.includes(role);
    }

    getUsername(): string | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const decoded: DecodedToken = jwtDecode(token);
            return decoded.username || decoded.sub || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    private getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}