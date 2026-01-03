import { Routes } from '@angular/router';
import {UserComponent} from "./user/user.component";
import {SolarplantComponent} from "./solarplant/solarplant.component";
import {ProfileComponent} from "./profile/profile.component";
import {PageComponent} from "./page/page.component";

export const AdministratorRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'user',
                component: UserComponent,
                data: {
                    title: 'Pages.Administrator',
                    urls: [
                        { title: 'Pages.Starter', url: '/dashboard/solarplant' },
                        { title: 'Pages.User' },
                    ],
                },
            },
            {
                path: 'solarplant',
                component: SolarplantComponent,
                data: {
                    title: 'Pages.Administrator',
                    urls: [
                        { title: 'Pages.Starter', url: '/dashboard/solarplant' },
                        { title: 'Pages.Solarplant' },
                    ],
                },
            },
            {
                path: 'profile',
                component: ProfileComponent,
                data: {
                    title: 'Pages.Administrator',
                    urls: [
                        { title: 'Pages.Starter', url: '/dashboard/solarplant' },
                        { title: 'Pages.Profile' },
                    ],
                },
            },
            {
                path: 'page',
                component: PageComponent,
                data: {
                    title: 'Pages.Administrator',
                    urls: [
                        { title: 'Pages.Starter', url: '/dashboard/solarplant' },
                        { title: 'Pages.Page' },
                    ],
                },
            },
        ],
    },
];
