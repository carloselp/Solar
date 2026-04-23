import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {latLng, tileLayer, marker, icon, MapOptions, Layer} from 'leaflet';
import {forkJoin} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {
    NotificationItem,
    NotificationService,
    NotificationSummaryItem,
} from 'src/app/pages/notification/notification.service';
import {SolarplantService} from 'src/app/pages/administrator/solarplant/solarplant.service';
import {SolarplantModel} from 'src/app/pages/administrator/solarplant/solarplant.component';

@Component({
    selector: 'app-next-notifications',
    standalone: true,
    imports: [CommonModule, FormsModule, LeafletModule],
    templateUrl: './next-notifications.component.html',
    styleUrl: './next-notifications.component.scss',
})
export class NextNotificationsComponent {
    plants: SolarplantModel[] = [];
    notifications: NotificationItem[] = [];
    summaryItems: NotificationSummaryItem[] = [];
    isLoading = false;
    startDate = new Date().toISOString().slice(0, 10);
    endDate = new Date().toISOString().slice(0, 10);
    selectedPlantId = 0;
    selectedSeverity = '';
    selectedType = '';
    search = '';

    readonly mapOptions: MapOptions = {
        layers: [
            tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }),
        ],
        zoom: 6,
        center: latLng(-5.0, -39.2),
    };

    readonly mapMarkerIcon = icon({
        iconUrl: 'assets/images/svgs/solar-panel-marker.svg',
        iconSize: [34, 34],
        iconAnchor: [17, 34],
    });

    constructor(
        private readonly notificationService: NotificationService,
        private readonly solarplantService: SolarplantService
    ) {
        this.loadPlants();
    }

    get filteredNotifications(): NotificationItem[] {
        return this.notifications.filter((item) => {
            const bySeverity = this.selectedSeverity
                ? item.severidade === this.selectedSeverity
                : true;
            const byType = this.selectedType ? item.tipo === this.selectedType : true;
            const bySearch = this.search
                ? `${item.titulo} ${item.descricao} ${item.usina}`
                      .toLowerCase()
                      .includes(this.search.toLowerCase())
                : true;
            return bySeverity && byType && bySearch;
        });
    }

    get visibleNotifications(): NotificationItem[] {
        return this.filteredNotifications.slice(0, 6);
    }

    get types(): string[] {
        return Array.from(
            new Set(this.notifications.map((item) => item.tipo).filter(Boolean))
        );
    }

    get counters(): Array<{label: string; total: number; className: string}> {
        const count = (severity: NotificationItem['severidade']) =>
            this.summaryItems.find((item) => item.severity === severity)?.total ?? 0;

        return [
            {label: 'Crítico', total: count('critical'), className: 'critical'},
            {label: 'Alto', total: count('high'), className: 'high'},
            {label: 'Médio', total: count('medium'), className: 'medium'},
            {label: 'Baixo', total: count('low'), className: 'low'},
        ];
    }

    get selectedPlant(): SolarplantModel | undefined {
        return this.plants.find((plant) => plant.id === this.selectedPlantId);
    }

    get mapCenter(): [number, number] {
        const latitude = this.selectedPlant?.latitude;
        const longitude = this.selectedPlant?.longitude;

        if (latitude == null || longitude == null) {
            return [-4.9609, -39.0178];
        }

        return [Number(latitude), Number(longitude)];
    }

    get mapLayers(): Layer[] {
        return [
            marker(this.mapCenter, {
                icon: this.mapMarkerIcon,
            }),
        ];
    }

    loadPlants(): void {
        this.solarplantService.getAll().subscribe({
            next: (plants) => {
                this.plants = plants;
                if (plants.length > 0) {
                    this.selectedPlantId = plants[0].id;
                }
                this.updateMapCenter();
                this.loadNotifications();
            },
            error: () => {
                this.plants = [];
                this.loadNotifications();
            },
        });
    }

    loadNotifications(): void {
        if (!this.selectedPlantId) {
            return;
        }

        this.updateMapCenter();
        this.isLoading = true;
        forkJoin({
            notifications: this.notificationService.list({
                solarplantId: this.selectedPlantId,
                startDate: this.startDate,
                endDate: this.endDate,
                type: this.selectedType || undefined,
                severity: this.selectedSeverity || undefined,
                search: this.search || undefined,
            }),
            summary: this.notificationService.summary(
                this.selectedPlantId,
                this.startDate,
                this.endDate
            ),
        })
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: ({notifications, summary}) => {
                    this.notifications = notifications;
                    this.summaryItems = summary;
                },
                error: () => {
                    this.notifications = [];
                    this.summaryItems = [];
                },
            });
    }

    severityLabel(value: NotificationItem['severidade']): string {
        return (
            {
                critical: 'Crítico',
                high: 'Alto',
                medium: 'Médio',
                low: 'Baixo',
            }[value] ?? value
        );
    }

    clearFilters(): void {
        this.selectedSeverity = '';
        this.selectedType = '';
        this.search = '';
        this.startDate = new Date().toISOString().slice(0, 10);
        this.endDate = new Date().toISOString().slice(0, 10);
        this.loadNotifications();
    }

    markAllAsRead(): void {
        this.notificationService.markAllRead(this.selectedPlantId).subscribe({
            next: () => this.loadNotifications(),
            error: () => this.loadNotifications(),
        });
    }

    alertIcon(item: NotificationItem): string {
        const type = item.tipo.toLowerCase();
        if (type.includes('falha')) {
            return '⚠️';
        }
        if (type.includes('anomalia')) {
            return '📉';
        }
        if (type.includes('comunicação')) {
            return '📡';
        }
        if (type.includes('manutenção')) {
            return '🔧';
        }

        return item.severidade === 'critical' ? '🔥' : '⚠️';
    }

    alertIconClass(item: NotificationItem): string {
        return item.severidade;
    }

    borderClass(item: NotificationItem): string {
        return item.severidade;
    }

    private updateMapCenter(): void {
        const [latitude, longitude] = this.mapCenter;
        this.mapOptions.center = latLng(latitude, longitude);
    }
}
