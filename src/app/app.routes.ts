import {Routes} from '@angular/router';
import {AuthGuard} from './auth.guard';
import {NextLayoutComponent} from './next/layout/next-layout.component';
import {NextLoginComponent} from './next/auth/next-login.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
    },
    {
        path: 'login',
        component: NextLoginComponent,
    },
    {
        path: 'authentication/login',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'next/login',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: 'legacy',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'next',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: '',
        component: NextLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./next/next.routes').then((m) => m.NextRoutes),
            }
        ],
    },
    { path: 'notfound', loadComponent: () => import('./pages/error/error.component').then(m => m.ErrorComponent) },
    {
        path: '**',
        redirectTo: 'notfound',
    },
];
