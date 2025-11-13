import { Routes } from '@angular/router';
import { LoginFormComponent } from './modules/product/components/login-form.component/login-form.component';
import { AuthGuard } from './guards/auth.guard';
import { VentaListComponent } from './modules/product/components/venta-list.component/venta-list.component';
import { MercadopagoListComponent } from './modules/product/components/mercadopago-list.component/mercadopago-list.component';
import { UserFormComponent } from './modules/user/components/user-form.component/user-form.component';
import { TiendaFormComponent } from './modules/user/components/tienda-form.component/tienda-form.component';
import { UserTiendaComponent } from './modules/user/components/user-tienda.component/user-tienda.component';
import { AdminGuard } from './guards/admin.guard';
import { AccessDeniedComponent } from './modules/product/components/access-denied.component/access-denied.component';
import { NewUserComponent } from './modules/user/components/new-user.component/new-user.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // ← AGREGAR ESTO
    { path: 'login', component: LoginFormComponent },
    { path: 'newUser', component: NewUserComponent },
    {
        path: 'products',
        loadComponent: () => import('./modules/product/components/product-form.component/product-form.component').then(m => m.ProductFormComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'products/list',
        loadComponent: () => import('./modules/product/components/product-list.component/product-list.component').then(m => m.ProductListComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'sells/list',
        loadComponent: () => import('./modules/product/components/venta-list.component/venta-list.component').then(m=>m.VentaListComponent),
        canActivate: [AuthGuard]
    },
    {
        path:'mercadoPago/list',
        component: MercadopagoListComponent,
        canActivate:[AuthGuard]
    },
    {
        path:'users',
        component: UserFormComponent,
        canActivate:[AdminGuard]
    },
    {
        path:'tiendas',
        component: TiendaFormComponent,
        canActivate:[AdminGuard]
    },
    {
        path:'userTienda',
        component: UserTiendaComponent,
        canActivate:[AdminGuard]
    },
    { path: 'access-denied', component: AccessDeniedComponent },
    { path: '**', redirectTo: '/login' } // ← Opcional: para rutas no encontradas
];