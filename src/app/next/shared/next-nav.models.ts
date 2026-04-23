export interface NextPageMeta {
    title: string;
    subtitle: string;
    primaryAction?: 'add' | 'export' | 'import';
}

export interface NextNavItem {
    group: string;
    label: string;
    route: string;
    icon: string;
    badge?: number;
}
