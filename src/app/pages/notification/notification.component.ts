import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from 'src/app/material.module';
import {TablerIconsModule} from 'angular-tabler-icons';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import {
    latLng,
    tileLayer,
    marker,
    icon,
    MapOptions,
    Layer,
} from 'leaflet';
import { NotificationService } from 'src/app/pages/notification/notification.service';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {CoreService} from "../../services/core.service";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {finalize} from "rxjs/operators";

type Severity = 'critical' | 'high' | 'medium' | 'low';

type EventType =
    | 'Comunicação'
    | 'Elétrico'
    | 'Térmico'
    | 'Manutenção';

export interface NotificationItem {
    qtd: number;
    createdAt: string;
    tipo: EventType;
    titulo: string;
    descricao: string;
    solucao: string;
    severidade: Severity;
    usina: string;
}

interface topcards {
    img: string;
    color: Severity;
    title: string;
    subtitle: string;
}

@Component({
    selector: 'app-notifications',
    standalone: true,
    imports: [CommonModule, FormsModule, MaterialModule, TablerIconsModule, LeafletModule,
        CommonModule,
        TranslateModule,
        MatProgressSpinnerModule],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
    options = this.settings.getOptions();
    isLoading = false;
    maxDate = new Date();
    
    private readonly plantIcon = icon({
        iconUrl: 'assets/images/svgs/solar-panel-marker.svg',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36],
    });
    
    notifications: NotificationItem[] = [];
    topcards: topcards[] = [];

    private readonly severityConfig: Record<Severity, { img: string; title: string }> = {
        critical: { img: 'assets/images/svgs/severity-critical.svg', title: 'critical' },
        high:     { img: 'assets/images/svgs/severity-high.svg',     title: 'high' },
        medium:   { img: 'assets/images/svgs/severity-medium.svg',   title: 'medium' },
        low:      { img: 'assets/images/svgs/severity-low.svg',      title: 'low' },
    };
    
    //     {
    //         id: 1,
    //         color: 'primary',
    //         img: '/assets/images/svgs/icon-user-male.svg',
    //         title: 'Profile',
    //         subtitle: '3,685',
    //     },
    //     {
    //         id: 2,
    //         color: 'warning',
    //         img: '/assets/images/svgs/icon-briefcase.svg',
    //         title: 'Blog',
    //         subtitle: '256',
    //     },
    //     {
    //         id: 3,
    //         color: 'secondary',
    //         img: '/assets/images/svgs/icon-mailbox.svg',
    //         title: 'Calendar',
    //         subtitle: '932',
    //     },
    //     {
    //         id: 4,
    //         color: 'error',
    //         img: '/assets/images/svgs/icon-favorites.svg',
    //         title: 'Email',
    //         subtitle: '$348K',
    //     },
    // ];

    // filtros
    selectedType: string = '';
    selectedSeverity: string = '';

    selectedDate: Date | null = new Date();
    selectedPlantId: number = 1;

    constructor(
        translate: TranslateService,
        private settings: CoreService,
        private service: NotificationService,
    ) {
        const lang = this.options.language || 'pt-BR';
        translate.setDefaultLang(lang);
        translate.use(lang);
    }

    ngOnInit(): void {
        this.consultDate();
    }

    consultDate(): void {
        if (!this.selectedDate) {
            return;
        }

        const plantId = this.selectedPlantId ?? 1;
        const date = this.selectedDate;

        this.isLoading = true;

        this.service.get(plantId, date)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: (items) => {
                    this.notifications = items;
                    this.topcards = this.buildTopcards(items);
                },
                error: (err) => {
                    console.error('Erro ao carregar itens', err);
                },
            });
    }

    private buildTopcards(items: NotificationItem[]): topcards[] {
        const totals = items.reduce<Record<Severity, number>>(
            (acc, item) => {
                acc[item.severidade] += item.qtd ?? 0;
                return acc;
            },
            { critical: 0, high: 0, medium: 0, low: 0 }
        );

        const order: Severity[] = ['critical', 'high', 'medium', 'low'];

        return order.map((sev) => ({
            img: this.severityConfig[sev].img,
            color: sev,
            title: this.getSeverityLabel(this.severityConfig[sev].title),
            subtitle: String(totals[sev]),
        }));
    }

    // lista filtrada
    get filteredNotifications(): NotificationItem[] {
        return this.notifications.filter((n) => {
            const matchesType = this.selectedType
                ? n.tipo === this.selectedType
                : true;
            const matchesSev = this.selectedSeverity
                ? n.severidade === this.selectedSeverity
                : true;
            return matchesType && matchesSev;
        });
    }

    // contagem por severidade
    get counts() {
        return {
            critical: this.notifications.filter((n) => n.severidade === 'critical').length,
            high: this.notifications.filter((n) => n.severidade === 'high').length,
            medium: this.notifications.filter((n) => n.severidade === 'medium').length,
            low: this.notifications.filter((n) => n.severidade === 'low').length,
        };
    }

    // Leaflet
    map!: L.Map;
    zoomLevel = 17;
    usinaLat = -3.8492973;
    usinaLng = -38.5990356;
    mapCenter = new L.LatLng(this.usinaLat, this.usinaLng);

    mapOptions: L.MapOptions = {
        // base
        zoom: this.zoomLevel,
        center: this.mapCenter,

        // trava mover
        dragging: false,

        // trava zoom
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: false
    };

    onMapReady(map: L.Map) {
        this.map = map;

        // garante que não dá zoom (nem por código/atalhos/plugins)
        const z = map.getZoom();
        map.setMinZoom(z);
        map.setMaxZoom(z);

        // garante que não “escapa” do lugar (blindagem extra)
        const bounds = map.getBounds();
        map.setMaxBounds(bounds);
        (map as any).options.maxBoundsViscosity = 1.0;

        // desabilita handlers por garantia (extra)
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        (map as any).tap?.disable?.();
    }

    get mapLayers(): Layer[] {
        const layers: Layer[] = [];

        layers.push(
            tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                {
                    maxZoom: 17,
                    attribution: '&copy; OpenStreetMap contributors',
                }
            )
        )

        layers.push(
            marker([this.usinaLat, this.usinaLng], { icon: this.plantIcon }).bindPopup(
                `<strong>Posição exata da usina</strong><br><small>${this.usinaLat.toFixed(
                    6
                )}, ${this.usinaLng.toFixed(6)}</small>`
            )
        );

        return layers;
    }
    
    applyFilters(): void {
        // aqui no futuro pode chamar API, por enquanto é tudo mock local
        console.log('Filtros aplicados', this.selectedType, this.selectedSeverity);
    }

    getSeverityLabel(sev: Severity | string): string {
        switch (sev) {
            case 'critical':
                return 'Crítico';
            case 'high':
                return 'Alto';
            case 'medium':
                return 'Médio';
            case 'low':
                return 'Baixo';
            default:
                return sev;
        }
    }
}
