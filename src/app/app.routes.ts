import {Routes} from '@angular/router';
import {BlankComponent} from './layouts/blank/blank.component';
import {FullComponent} from './layouts/full/full.component';
import {AuthGuard} from './auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: '/dashboard/solarplant',
                pathMatch: 'full',
            },
            {
                path: 'administrator',
                loadChildren: () =>
                    import('./pages/administrator/administrator.routes').then((m) => m.AdministratorRoutes),
            },
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./pages/dashboard/dashboard.routes').then((m) => m.DashboardRoutes),
            },
            { 
                path: 'notifications', 
                loadComponent: () => import('./pages/notification/notification.component').then(m => m.NotificationComponent),
                data: {
                    title: 'Pages.Alerts',
                    urls: [
                        { title: 'Pages.Starter', url: '/dashboard/solarplant' },
                        { title: 'Pages.Notifications' },
                    ],
                },
            },
        ],
    },
    {
        path: '',
        component: BlankComponent,
        children: [
            {
                path: 'authentication',
                loadChildren: () =>
                    import('./pages/authentication/authentication.routes').then(
                        (m) => m.AuthenticationRoutes
                    ),
            }
        ],
    },
    { path: 'notfound', loadComponent: () => import('./pages/error/error.component').then(m => m.ErrorComponent) },
    {
        path: '**',
        redirectTo: 'notfound',
    },
];
