import {Routes} from '@angular/router';

export const NextRoutes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./pages/dashboard/next-dashboard.component').then(
                (m) => m.NextDashboardComponent
            ),
        data: {
            nextPage: {
                title: 'Dashboard',
                subtitle: 'Visão consolidada da geração, clima e desempenho das usinas.',
            },
        },
    },
    {
        path: 'notifications',
        loadComponent: () =>
            import('./pages/notifications/next-notifications.component').then(
                (m) => m.NextNotificationsComponent
            ),
        data: {
            nextPage: {
                title: 'Notificações',
                subtitle: 'Alertas operacionais, severidade e contexto por usina.',
            },
        },
    },
    {
        path: 'administrator/users',
        loadComponent: () =>
            import('./pages/administrator/next-users.component').then(
                (m) => m.NextUsersComponent
            ),
        data: {
            nextPage: {
                title: 'Usuários',
                subtitle: 'Gerenciamento de contas, perfis e status de acesso.',
                primaryAction: 'add',
            },
        },
    },
    {
        path: 'administrator/companies',
        loadComponent: () =>
            import('./pages/administrator/next-companies.component').then(
                (m) => m.NextCompaniesComponent
            ),
        data: {
            nextPage: {
                title: 'Empresas',
                subtitle: 'Cadastro das empresas vinculadas aos usuários do portal.',
                primaryAction: 'add',
            },
        },
    },
    {
        path: 'administrator/solarplants',
        loadComponent: () =>
            import('./pages/administrator/next-solarplants.component').then(
                (m) => m.NextSolarplantsComponent
            ),
        data: {
            nextPage: {
                title: 'Usinas',
                subtitle: 'Cadastro das unidades geradoras e parâmetros operacionais.',
                primaryAction: 'add',
            },
        },
    },
    {
        path: 'administrator/profiles',
        loadComponent: () =>
            import('./pages/administrator/next-profiles.component').then(
                (m) => m.NextProfilesComponent
            ),
        data: {
            nextPage: {
                title: 'Perfis',
                subtitle: 'Controle de permissões e vínculos com páginas do sistema.',
                primaryAction: 'add',
            },
        },
    },
    {
        path: 'administrator/pages',
        loadComponent: () =>
            import('./pages/administrator/next-pages.component').then(
                (m) => m.NextPagesComponent
            ),
        data: {
            nextPage: {
                title: 'Páginas',
                subtitle: 'Catálogo de rotas, ícones e agrupamentos do menu.',
                primaryAction: 'add',
            },
        },
    },
    {
        path: 'reports',
        loadComponent: () =>
            import('./pages/reports/next-reports.component').then(
                (m) => m.NextReportsComponent
            ),
        data: {
            nextPage: {
                title: 'Relatórios',
                subtitle: 'Consolidados exportáveis de produção, clima e alertas.',
            },
        },
    },
    {
        path: 'import',
        loadComponent: () =>
            import('./pages/import/next-import.component').then(
                (m) => m.NextImportComponent
            ),
        data: {
            nextPage: {
                title: 'Importação de Dados',
                subtitle: 'Validação local de arquivos operacionais antes do processamento.',
            },
        },
    },
    {
        path: 'account',
        loadComponent: () =>
            import('./pages/account/next-account.component').then(
                (m) => m.NextAccountComponent
            ),
        data: {
            nextPage: {
                title: 'Minha Conta',
                subtitle: 'Dados pessoais, preferências e segurança da sessão.',
            },
        },
    },
];
