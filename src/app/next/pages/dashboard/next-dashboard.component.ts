import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexFill,
    ApexGrid,
    ApexLegend,
    ApexPlotOptions,
    ApexStroke,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule,
} from 'ng-apexcharts';
import {finalize} from 'rxjs/operators';
import {forkJoin} from 'rxjs';
import {DashboardService} from 'src/app/pages/dashboard/dashboard.service';
import {NotificationService} from 'src/app/pages/notification/notification.service';
import {SolarplantService} from 'src/app/pages/administrator/solarplant/solarplant.service';
import {SolarplantModel} from 'src/app/pages/administrator/solarplant/solarplant.component';
import {
    DashboardMetrics,
    GeneracaoMedicaoItem,
    HistoricoMedicaoItem,
    TimeSeriesPoint,
} from 'src/app/pages/dashboard/models/dashboard.models';

type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis | ApexYAxis[];
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    legend: ApexLegend;
    dataLabels: ApexDataLabels;
    colors: string[];
    fill: ApexFill;
    grid: ApexGrid;
    plotOptions: ApexPlotOptions;
};

type PeriodPreset = 'current-month' | 'previous-month' | 'last-7-days' | 'all' | 'custom';

type KpiCard = {
    icon: string;
    label: string;
    value: string;
    unit: string;
    trend: string;
    trendClass: 'trend-up' | 'trend-down' | 'trend-neutral';
    color: string;
};

type ChartExportId = 'energy' | 'current' | 'voltage' | 'temperature' | 'irradiance';
type ChartExportFormat = 'png' | 'svg' | 'csv';

@Component({
    selector: 'app-next-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, NgApexchartsModule],
    templateUrl: './next-dashboard.component.html',
    styleUrl: './next-dashboard.component.scss',
})
export class NextDashboardComponent {
    isLoading = false;
    maxDate = new Date();
    selectedStartDate: string = this.formatDate(new Date());
    selectedEndDate: string = this.formatDate(new Date());
    selectedPlantId = 0;
    plants: SolarplantModel[] = [];
    activePeriod: PeriodPreset = 'custom';
    readonly periodPresets: Array<{id: PeriodPreset; label: string}> = [
        {id: 'current-month', label: 'Mês atual'},
        {id: 'previous-month', label: 'Mês anterior'},
        {id: 'last-7-days', label: 'Últimos 7 dias'},
        {id: 'all', label: 'Todo o período'},
        {id: 'custom', label: 'Personalizado'},
    ];

    metrics: DashboardMetrics = {
        current: 0,
        irradiance: 0,
        plateTemp: 0,
        ambientTemp: 0,
        voltage: 0,
        humidity: 0,
        windSpeed: 0,
    };

    notificationCount = 0;
    energySeriesCount = 0;
    totalGeneration = 0;
    irradianceDailyAverage = 0;

    productionChart = this.buildEmptyChart('Produção');
    currentChart = this.buildEmptyChart('Geração x Corrente');
    voltageChart = this.buildEmptyChart('Geração x Tensão');
    temperatureChart = this.buildEmptyChart('Geração x Temperatura Ambiente');
    irradianceChart = this.buildEmptyChart('Irradiação Diária');

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly notificationService: NotificationService,
        private readonly solarplantService: SolarplantService
    ) {
        this.loadPlants();
    }

    get kpis(): KpiCard[] {
        const powerDc = (this.metrics.current * this.metrics.voltage) / 1000000;

        return [
            {
                icon: '☀️',
                label: 'Irradiação Solar',
                value: this.metrics.irradiance.toFixed(1),
                unit: 'W/m²',
                trend: '↗ leitura instantânea',
                trendClass: 'trend-up',
                color: '#f59e0b',
            },
            {
                icon: '📈',
                label: 'Média Diária Irrad.',
                value: this.irradianceDailyAverage.toFixed(1),
                unit: 'W/m²/dia',
                trend: '↗ média no período',
                trendClass: 'trend-up',
                color: '#eab308',
            },
            {
                icon: '🌡️',
                label: 'Temp. Ambiente',
                value: this.metrics.ambientTemp.toFixed(1),
                unit: '°C',
                trend: '↘ leitura climática',
                trendClass: 'trend-down',
                color: '#ef4444',
            },
            {
                icon: '🔥',
                label: 'Temp. Módulos',
                value: this.metrics.plateTemp.toFixed(1),
                unit: '°C',
                trend: '↘ superfície dos módulos',
                trendClass: 'trend-down',
                color: '#f97316',
            },
            {
                icon: '⚡',
                label: 'Corrente DC (Idc)',
                value: this.metrics.current ? this.metrics.current.toFixed(1) : '—',
                unit: 'A',
                trend: '↗ leitura elétrica',
                trendClass: 'trend-up',
                color: '#6366f1',
            },
            {
                icon: '🔌',
                label: 'Tensão DC (Vdc)',
                value: this.metrics.voltage ? this.metrics.voltage.toFixed(1) : '—',
                unit: 'V',
                trend: '↗ tensão monitorada',
                trendClass: 'trend-up',
                color: '#0ea5e9',
            },
            {
                icon: '💡',
                label: 'Potência DC',
                value: powerDc > 0 ? powerDc.toFixed(2) : '—',
                unit: 'MW',
                trend: '↗ corrente × tensão',
                trendClass: 'trend-up',
                color: '#15803d',
            },
            {
                icon: '🔋',
                label: 'Geração no Período',
                value: this.totalGeneration.toFixed(2),
                unit: 'MWh',
                trend: `${this.energySeriesCount} registros`,
                trendClass: 'trend-up',
                color: '#166534',
            },
        ];
    }

    get selectedPlantName(): string {
        return this.plants.find((plant) => plant.id === this.selectedPlantId)?.name ?? 'Portfólio completo';
    }

    get dateRangeLabel(): string {
        return `${this.formatDateLabel(this.selectedStartDate)} a ${this.formatDateLabel(this.selectedEndDate)}`;
    }

    loadPlants(): void {
        this.solarplantService.getAll().subscribe({
            next: (plants) => {
                this.plants = plants;
                if (plants.length > 0) {
                    this.selectedPlantId = plants[0].id;
                }
                this.applyFilters();
            },
            error: () => {
                this.plants = [];
            },
        });
    }

    applyFilters(): void {
        if (!this.selectedPlantId) {
            return;
        }

        this.isLoading = true;

        forkJoin({
            medicao: this.dashboardService.getMedicao(
                this.selectedPlantId,
                this.selectedStartDate,
                this.selectedEndDate
            ),
            geracao: this.dashboardService.getGeracao(
                this.selectedPlantId,
                this.selectedStartDate,
                this.selectedEndDate
            ),
            current: this.dashboardService.getGeracaoXOutraMedida(
                this.selectedPlantId,
                this.selectedStartDate,
                2,
                this.selectedEndDate
            ),
            voltage: this.dashboardService.getGeracaoXOutraMedida(
                this.selectedPlantId,
                this.selectedStartDate,
                3,
                this.selectedEndDate
            ),
            temperature: this.dashboardService.getGeracaoXOutraMedida(
                this.selectedPlantId,
                this.selectedStartDate,
                5,
                this.selectedEndDate
            ),
            irradiance: this.dashboardService.getHistoricoMedicao(
                this.selectedPlantId,
                this.selectedStartDate,
                6,
                this.selectedEndDate
            ),
            notifications: this.notificationService.get(
                this.selectedPlantId,
                this.selectedStartDate
            ),
        })
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: ({medicao, geracao, current, voltage, temperature, irradiance, notifications}) => {
                    this.metrics =
                        this.dashboardService.mapMedicoesToDashboardMetrics(medicao);
                    this.notificationCount = notifications.length;
                    this.energySeriesCount = geracao.length;
                    this.totalGeneration = geracao.reduce((sum, item) => sum + (item.value ?? 0), 0);
                    const productionByDay = this.aggregateProductionByDay(geracao);
                    const currentByHour = this.aggregateDualByHour(current);
                    const voltageByHour = this.aggregateDualByHour(voltage);
                    const temperatureByHour = this.aggregateDualByHour(temperature);
                    const irradianceByHour = this.aggregateHistoryByHour(irradiance);
                    this.irradianceDailyAverage = this.calculateIrradianceDailyAverage(irradiance);

                    this.productionChart = this.buildProductionChart(productionByDay);
                    this.currentChart = this.buildDualChart(
                        'Geração x Corrente',
                        currentByHour,
                        'Geração (MWh)',
                        'Corrente (A)',
                        ['#9a3412', '#1e1b8a']
                    );
                    this.voltageChart = this.buildDualChart(
                        'Geração x Tensão',
                        voltageByHour,
                        'Geração (MWh)',
                        'Tensão (V)',
                        ['#9a3412', '#075985']
                    );
                    this.temperatureChart = this.buildDualChart(
                        'Geração x Temperatura Ambiente',
                        temperatureByHour,
                        'Geração (MWh)',
                        'Temp. Ambiente (°C)',
                        ['#9a3412', '#be123c']
                    );
                    this.irradianceChart = this.buildSingleLineChart(
                        irradianceByHour,
                        'Irradiação Diária',
                        'W/m²',
                        '#92400e'
                    );
                },
                error: () => {
                    this.metrics = {
                        current: 0,
                        irradiance: 0,
                        plateTemp: 0,
                        ambientTemp: 0,
                        voltage: 0,
                        humidity: 0,
                        windSpeed: 0,
                    };
                    this.notificationCount = 0;
                    this.energySeriesCount = 0;
                    this.totalGeneration = 0;
                    this.irradianceDailyAverage = 0;
                    this.temperatureChart = this.buildEmptyChart('Geração x Temperatura Ambiente');
                    this.irradianceChart = this.buildEmptyChart('Irradiação Diária');
                },
            });
    }

    setPeriod(period: PeriodPreset): void {
        this.activePeriod = period;

        const today = new Date();
        const start = new Date(today);
        const end = new Date(today);

        if (period === 'custom') {
            return;
        }

        if (period === 'current-month') {
            start.setDate(1);
        }

        if (period === 'previous-month') {
            start.setMonth(today.getMonth() - 1, 1);
            end.setDate(0);
        }

        if (period === 'last-7-days') {
            start.setDate(today.getDate() - 6);
        }

        if (period === 'all') {
            start.setMonth(0, 1);
        }

        this.selectedStartDate = this.formatDate(start);
        this.selectedEndDate = this.formatDate(end);
        this.applyFilters();
    }

    markCustomPeriod(): void {
        this.activePeriod = 'custom';
    }

    clearFilters(): void {
        this.activePeriod = 'custom';
        this.selectedStartDate = this.formatDate(new Date());
        this.selectedEndDate = this.formatDate(new Date());
        this.applyFilters();
    }

    downloadChart(chartId: ChartExportId, format: ChartExportFormat): void {
        if (format === 'csv') {
            this.downloadCsv(chartId);
            return;
        }

        const svg = document.querySelector<SVGSVGElement>(
            `[data-chart-id="${chartId}"] .apexcharts-canvas svg`
        );

        if (!svg) {
            return;
        }

        const serialized = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([serialized], {type: 'image/svg+xml;charset=utf-8'});

        if (format === 'svg') {
            this.downloadBlob(svgBlob, `${chartId}.svg`);
            return;
        }

        const url = URL.createObjectURL(svgBlob);
        const image = new Image();
        const bounds = svg.getBoundingClientRect();

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(bounds.width, 1) * 2;
            canvas.height = Math.max(bounds.height, 1) * 2;

            const context = canvas.getContext('2d');
            if (!context) {
                URL.revokeObjectURL(url);
                return;
            }

            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                if (blob) {
                    this.downloadBlob(blob, `${chartId}.png`);
                }
            }, 'image/png');
        };

        image.src = url;
    }

    private buildProductionChart(points: TimeSeriesPoint[]): ChartOptions {
        return {
            series: [
                {
                    name: 'Produção',
                    data: points.map((item) => item.value),
                },
            ],
            chart: {
                type: 'bar',
                height: 185,
                toolbar: {show: false},
            },
            xaxis: {
                categories: this.buildSparseAxis(points.map((item) => item.createdAt)),
                labels: {
                    rotate: 0,
                    style: {colors: '#94a3b8', fontSize: '10px'},
                },
            },
            yaxis: {
                title: {text: 'MWh', style: {color: '#64748b', fontSize: '10px'}},
                labels: {style: {colors: '#64748b', fontSize: '10px'}},
            },
            stroke: {curve: 'smooth', width: 0},
            tooltip: {shared: true, intersect: false},
            legend: {show: false},
            dataLabels: {enabled: false},
            colors: ['#7fa88e'],
            fill: {opacity: 0.85},
            grid: {borderColor: '#eef2f7', strokeDashArray: 0},
            plotOptions: {bar: {borderRadius: 3, columnWidth: '66%'}},
        };
    }

    private buildSingleLineChart(
        points: TimeSeriesPoint[],
        name: string,
        unit: string,
        color: string
    ): ChartOptions {
        return {
            series: [
                {
                    name,
                    data: points.map((item) => item.value),
                },
            ],
            chart: {
                type: 'line',
                height: 230,
                toolbar: {show: false},
                dropShadow: {
                    enabled: true,
                    top: 6,
                    left: 0,
                    blur: 8,
                    opacity: 0.18,
                    color,
                },
            },
            xaxis: {
                categories: this.buildSparseAxis(points.map((item) => item.createdAt)),
                labels: {
                    rotate: 0,
                    style: {colors: '#94a3b8', fontSize: '10px'},
                },
            },
            yaxis: {
                title: {text: unit, style: {color: '#64748b', fontSize: '10px'}},
                labels: {style: {colors: '#64748b', fontSize: '10px'}},
            },
            stroke: {curve: 'smooth', width: 3.5},
            tooltip: {shared: true, intersect: false},
            legend: {show: false},
            dataLabels: {enabled: false},
            colors: [color],
            fill: {opacity: 1},
            grid: {borderColor: '#eef2f7'},
            plotOptions: {bar: {borderRadius: 3, columnWidth: '58%'}},
        };
    }

    private buildDualChart(
        title: string,
        items: GeneracaoMedicaoItem[],
        leftLabel: string,
        rightLabel: string,
        colors: string[]
    ): ChartOptions {
        return {
            series: [
                {
                    name: leftLabel,
                    type: 'line',
                    data: items.map((item) => item.geracao),
                },
                {
                    name: rightLabel,
                    type: 'line',
                    data: items.map((item) => item.value),
                },
            ],
            chart: {
                type: 'line',
                height: 230,
                toolbar: {show: false},
                dropShadow: {
                    enabled: true,
                    top: 6,
                    left: 0,
                    blur: 8,
                    opacity: 0.18,
                    color: colors[0],
                    enabledOnSeries: [0],
                },
            },
            xaxis: {
                categories: this.buildSparseAxis(items.map((item) => item.createdAt)),
                labels: {
                    rotate: 0,
                    style: {colors: '#94a3b8', fontSize: '10px'},
                },
            },
            yaxis: [
                {
                    title: {text: leftLabel, style: {color: '#64748b', fontSize: '10px'}},
                    labels: {style: {colors: '#64748b', fontSize: '10px'}},
                },
                {
                    opposite: true,
                    title: {text: rightLabel, style: {color: '#64748b', fontSize: '10px'}},
                    labels: {style: {colors: '#64748b', fontSize: '10px'}},
                },
            ],
            stroke: {curve: 'smooth', width: [3.5, 3.5]},
            tooltip: {shared: true, intersect: false},
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'center',
                fontSize: '11px',
                labels: {colors: '#334155'},
            },
            dataLabels: {enabled: false},
            colors,
            fill: {opacity: [1, 1]},
            grid: {borderColor: '#eef2f7'},
            plotOptions: {bar: {borderRadius: 2, columnWidth: '58%'}},
        };
    }

    private buildEmptyChart(name: string): ChartOptions {
        return {
            series: [{name, data: []}],
            chart: {type: 'line', height: 220, toolbar: {show: false}},
            xaxis: {categories: []},
            yaxis: {title: {text: ''}},
            stroke: {curve: 'smooth', width: 3},
            tooltip: {shared: true, intersect: false},
            legend: {show: false},
            dataLabels: {enabled: false},
            colors: ['#ea580c'],
            fill: {opacity: 1},
            grid: {borderColor: '#eef2f7'},
            plotOptions: {bar: {borderRadius: 2}},
        };
    }

    private downloadCsv(chartId: ChartExportId): void {
        const chart = this.getChartById(chartId);
        const categories = (chart.xaxis.categories ?? []) as string[];
        const series = chart.series;
        const headers = ['periodo', ...series.map((item) => item.name ?? 'serie')];
        const rows = categories.map((category: string, index: number) => [
            category || `ponto-${index + 1}`,
            ...series.map((item) => {
                const data = item.data as Array<number | {x: string; y: number}>;
                const value = data[index];
                return typeof value === 'number' ? value : value?.y ?? '';
            }),
        ]);
        const csv = [headers, ...rows]
            .map((row) =>
                row.map((cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
            )
            .join('\n');

        this.downloadBlob(new Blob([csv], {type: 'text/csv;charset=utf-8'}), `${chartId}.csv`);
    }

    private getChartById(chartId: ChartExportId): ChartOptions {
        if (chartId === 'current') {
            return this.currentChart;
        }

        if (chartId === 'voltage') {
            return this.voltageChart;
        }

        if (chartId === 'temperature') {
            return this.temperatureChart;
        }

        if (chartId === 'irradiance') {
            return this.irradianceChart;
        }

        return this.productionChart;
    }

    private downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    private aggregateProductionByDay(points: TimeSeriesPoint[]): TimeSeriesPoint[] {
        const grouped = new Map<string, {value: number; name: string}>();

        points.forEach((item) => {
            const key = this.dateKey(item.createdAt);
            const current = grouped.get(key) ?? {value: 0, name: item.name};
            current.value += item.value ?? 0;
            grouped.set(key, current);
        });

        return Array.from(grouped.entries()).map(([key, item]) => ({
            createdAt: `${key}T00:00:00`,
            name: item.name,
            value: Number(item.value.toFixed(2)),
        }));
    }

    private aggregateDualByHour(items: GeneracaoMedicaoItem[]): GeneracaoMedicaoItem[] {
        const grouped = new Map<
            string,
            {geracao: number; value: number; count: number; name: string}
        >();

        items.forEach((item) => {
            const key = this.hourKey(item.createdAt);
            const current = grouped.get(key) ?? {
                geracao: 0,
                value: 0,
                count: 0,
                name: item.name,
            };

            current.geracao += item.geracao ?? 0;
            current.value += item.value ?? 0;
            current.count += 1;
            grouped.set(key, current);
        });

        return Array.from(grouped.entries()).map(([key, item]) => ({
            createdAt: key,
            name: item.name,
            geracao: Number(item.geracao.toFixed(2)),
            value: Number((item.value / Math.max(item.count, 1)).toFixed(2)),
        }));
    }

    private aggregateHistoryByHour(items: HistoricoMedicaoItem[]): TimeSeriesPoint[] {
        const grouped = new Map<string, {value: number; count: number; name: string}>();

        items.forEach((item) => {
            const key = this.hourKey(item.createdAt);
            const current = grouped.get(key) ?? {
                value: 0,
                count: 0,
                name: item.name,
            };

            current.value += item.value ?? 0;
            current.count += 1;
            grouped.set(key, current);
        });

        return Array.from(grouped.entries()).map(([key, item]) => ({
            createdAt: key,
            name: item.name,
            value: Number((item.value / Math.max(item.count, 1)).toFixed(2)),
        }));
    }

    private aggregateHistoryByDay(items: HistoricoMedicaoItem[]): TimeSeriesPoint[] {
        const grouped = new Map<string, {value: number; count: number; name: string}>();

        items.forEach((item) => {
            const key = this.dateKey(item.createdAt);
            const current = grouped.get(key) ?? {
                value: 0,
                count: 0,
                name: item.name,
            };

            current.value += item.value ?? 0;
            current.count += 1;
            grouped.set(key, current);
        });

        return Array.from(grouped.entries()).map(([key, item]) => ({
            createdAt: `${key}T00:00:00`,
            name: item.name,
            value: Number((item.value / Math.max(item.count, 1)).toFixed(2)),
        }));
    }

    private calculateIrradianceDailyAverage(items: HistoricoMedicaoItem[]): number {
        const dailyAverages = this.aggregateHistoryByDay(items).map((item) => item.value);
        if (!dailyAverages.length) {
            return 0;
        }

        return Number(
            (
                dailyAverages.reduce((sum, value) => sum + value, 0) /
                dailyAverages.length
            ).toFixed(1)
        );
    }

    private dateKey(value: string): string {
        return new Date(value).toISOString().slice(0, 10);
    }

    private hourKey(value: string): string {
        const date = new Date(value);
        date.setMinutes(0, 0, 0);
        return date.toISOString();
    }

    private buildSparseAxis(values: string[]): string[] {
        if (values.length <= 10) {
            return values.map((value) => this.formatAxis(value));
        }

        const interval = Math.ceil(values.length / 8);

        return values.map((value, index) => {
            const isEdge = index === 0 || index === values.length - 1;
            return isEdge || index % interval === 0 ? this.formatAxis(value) : '';
        });
    }

    private formatAxis(value: string): string {
        const date = new Date(value);

        if (
            date.getHours() === 0 &&
            date.getMinutes() === 0 &&
            date.getSeconds() === 0
        ) {
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
            });
        }

        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private formatDateLabel(value: string): string {
        return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }
}
