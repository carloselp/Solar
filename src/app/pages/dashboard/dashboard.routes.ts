import { Routes } from '@angular/router';
import {DashboardSolarplantComponent} from "./solarplant/solarplant.component";

export const DashboardRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'solarplant',
                component: DashboardSolarplantComponent,
                data: {
                    title: 'Dashboard',
                    urls: [
                        { title: 'Pages.Starter', url: '/dashboard/solarplant' },
                        { title: 'Pages.Solarplant' },
                    ],
                },
            },
        ],
    },
];
