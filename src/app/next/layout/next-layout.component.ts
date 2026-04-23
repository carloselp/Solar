import {CommonModule} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterModule} from '@angular/router';
import {filter} from 'rxjs/operators';
import {NotificationDropdownItem, NotificationService} from 'src/app/pages/notification/notification.service';
import {NextNavItem, NextPageMeta} from '../shared/next-nav.models';
import {getNextMenu} from '../shared/next-menu';

interface StoredUser {
    first_name?: string;
    last_name?: string;
    user_login?: string;
}

@Component({
    selector: 'app-next-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './next-layout.component.html',
    styleUrl: './next-layout.component.scss',
})
export class NextLayoutComponent {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly notificationService = inject(NotificationService);

    readonly navItems = signal<NextNavItem[]>(getNextMenu());
    readonly dropdownOpen = signal(false);
    readonly pageMeta = signal<NextPageMeta>({
        title: 'Dashboard',
        subtitle: 'Visão consolidada do portal SmartGrid.',
    });
    readonly unreadCount = signal(0);
    readonly notifications = signal<NotificationDropdownItem[]>([]);

    readonly groupedNav = computed(() => {
        const map = new Map<string, NextNavItem[]>();
        for (const item of this.navItems()) {
            const current = map.get(item.group) ?? [];
            current.push(item);
            map.set(item.group, current);
        }
        return Array.from(map.entries()).map(([group, items]) => ({group, items}));
    });

    readonly user = this.readStoredUser();
    readonly userInitials = this.computeUserInitials(this.user);
    readonly userName =
        `${this.user.first_name ?? ''} ${this.user.last_name ?? ''}`.trim() ||
        this.user.user_login ||
        'Usuário';

    constructor() {
        this.syncPageMeta();
        this.loadNotificationsSummary();

        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.dropdownOpen.set(false);
                this.syncPageMeta();
            });
    }

    isRouteActive(route: string): boolean {
        return this.router.url === route;
    }

    toggleDropdown(): void {
        this.dropdownOpen.update((value) => !value);
    }

    markAllRead(): void {
        this.notificationService.markAllRead().subscribe({
            next: () => this.loadNotificationsSummary(),
            error: () => this.loadNotificationsSummary(),
        });
    }

    private syncPageMeta(): void {
        let current: ActivatedRoute | null = this.route;

        while (current?.firstChild) {
            current = current.firstChild;
        }

        const meta = current?.snapshot?.data?.['nextPage'] as NextPageMeta | undefined;
        if (meta) {
            this.pageMeta.set(meta);
        }
    }

    private loadNotificationsSummary(): void {
        this.notificationService.dropdown(4).subscribe({
            next: (items) => {
                this.notifications.set(items);
                this.unreadCount.set(items.filter((item) => !item.isRead).length);

                this.navItems.update((items) =>
                    items.map((item) =>
                        item.route === '/notifications'
                            ? {...item, badge: this.unreadCount()}
                            : item
                    )
                );
            },
            error: () => {
                this.unreadCount.set(0);
                this.notifications.set([]);
            },
        });
    }

    private readStoredUser(): StoredUser {
        const raw = localStorage.getItem('user');
        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw) as StoredUser;
        } catch {
            return {};
        }
    }

    private computeUserInitials(user: StoredUser): string {
        const base =
            `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.trim() ||
            user.user_login?.slice(0, 2) ||
            'US';

        return base.toUpperCase();
    }
}
