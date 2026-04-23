import {NextNavItem} from './next-nav.models';

export const NEXT_FALLBACK_MENU: NextNavItem[] = [
    {group: 'Principal', label: 'Dashboard', route: '/dashboard', icon: '⚡'},
    {group: 'Principal', label: 'Notificações', route: '/notifications', icon: '🔔'},
    {group: 'Principal', label: 'Relatórios', route: '/reports', icon: '📊'},
    {group: 'Configurações', label: 'Usuários', route: '/administrator/users', icon: '👥'},
    {group: 'Configurações', label: 'Empresas', route: '/administrator/companies', icon: '🏢'},
    {group: 'Configurações', label: 'Usinas', route: '/administrator/solarplants', icon: '☀️'},
    {group: 'Configurações', label: 'Perfis', route: '/administrator/profiles', icon: '🪪'},
    {group: 'Configurações', label: 'Páginas', route: '/administrator/pages', icon: '🧭'},
    {group: 'Configurações', label: 'Importação', route: '/import', icon: '📥'},
    {group: 'Configurações', label: 'Minha conta', route: '/account', icon: '⚙️'},
];

const labelMap: Record<string, Partial<NextNavItem>> = {
    dashboard: {group: 'Principal', label: 'Dashboard', route: '/dashboard', icon: '⚡'},
    dashboardsolarplant: {group: 'Dashboard', label: 'Usina', route: '/dashboard', icon: '⚡'},
    notificacoes: {group: 'Principal', label: 'Notificações', route: '/notifications', icon: '🔔'},
    notifications: {group: 'Principal', label: 'Notificações', route: '/notifications', icon: '🔔'},
    relatorios: {group: 'Principal', label: 'Relatórios', route: '/reports', icon: '📊'},
    reports: {group: 'Principal', label: 'Relatórios', route: '/reports', icon: '📊'},
    usuarios: {group: 'Configurações', label: 'Usuários', route: '/administrator/users', icon: '👥'},
    users: {group: 'Configurações', label: 'Usuários', route: '/administrator/users', icon: '👥'},
    administratoruser: {group: 'Administrador', label: 'Usuário', route: '/administrator/users', icon: '👥'},
    empresas: {group: 'Configurações', label: 'Empresas', route: '/administrator/companies', icon: '🏢'},
    company: {group: 'Configurações', label: 'Empresas', route: '/administrator/companies', icon: '🏢'},
    administratorcompany: {group: 'Administrador', label: 'Empresa', route: '/administrator/companies', icon: '🏢'},
    usinas: {group: 'Configurações', label: 'Usinas', route: '/administrator/solarplants', icon: '☀️'},
    solarplant: {group: 'Configurações', label: 'Usinas', route: '/administrator/solarplants', icon: '☀️'},
    administratorsolarplant: {group: 'Administrador', label: 'Usina', route: '/administrator/solarplants', icon: '☀️'},
    perfis: {group: 'Configurações', label: 'Perfis', route: '/administrator/profiles', icon: '🪪'},
    profile: {group: 'Configurações', label: 'Perfis', route: '/administrator/profiles', icon: '🪪'},
    administratorprofile: {group: 'Administrador', label: 'Perfil', route: '/administrator/profiles', icon: '🪪'},
    pagina: {group: 'Configurações', label: 'Páginas', route: '/administrator/pages', icon: '🧭'},
    page: {group: 'Configurações', label: 'Páginas', route: '/administrator/pages', icon: '🧭'},
    administratorpage: {group: 'Administrador', label: 'Páginas', route: '/administrator/pages', icon: '🧭'},
    importacao: {group: 'Configurações', label: 'Importação', route: '/import', icon: '📥'},
    account: {group: 'Configurações', label: 'Minha conta', route: '/account', icon: '⚙️'},
};

interface StoredMenuItem {
    navCap?: string;
    displayName?: string;
    iconName?: string;
    route?: string;
    name?: string;
    state?: string;
}

function normalizeMenuKey(value: string | undefined): string {
    return (value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

export function getNextMenu(): NextNavItem[] {
    const stored = localStorage.getItem('menu');

    if (!stored) {
        return NEXT_FALLBACK_MENU;
    }

    try {
        const parsed = JSON.parse(stored) as StoredMenuItem[];
        let currentGroup = 'Principal';
        const seenRoutes = new Set<string>();
        const mapped: NextNavItem[] = [];

        for (const item of parsed) {
            if (item.navCap) {
                currentGroup = item.navCap;
                continue;
            }

            const rawRouteTail = item.route?.split('/').pop();
            const sourceKey = normalizeMenuKey(
                item.displayName || item.name || item.route || item.state
            );
            const routeKey = normalizeMenuKey(item.route);
            const base =
                labelMap[sourceKey] ??
                labelMap[routeKey] ??
                labelMap[normalizeMenuKey(rawRouteTail)];

            if (!base?.route || !base.label || !base.icon) {
                continue;
            }

            if (seenRoutes.has(base.route)) {
                continue;
            }

            mapped.push({
                group: currentGroup || base.group || 'Principal',
                label: base.label,
                route: base.route,
                icon: base.icon,
            });
            seenRoutes.add(base.route);
        }

        for (const extra of NEXT_FALLBACK_MENU) {
            if (seenRoutes.has(extra.route)) {
                continue;
            }

            mapped.push(extra);
            seenRoutes.add(extra.route);
        }

        return mapped.length ? mapped : NEXT_FALLBACK_MENU;
    } catch {
        return NEXT_FALLBACK_MENU;
    }
}
