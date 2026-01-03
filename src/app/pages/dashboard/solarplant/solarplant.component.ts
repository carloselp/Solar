import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import {
    ApexAxisChartSeries,
    ApexNonAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexYAxis,
    ApexStroke,
    ApexDataLabels,
    ApexLegend,
    ApexTooltip,
    NgApexchartsModule,
} from 'ng-apexcharts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import {
    MetricChartDialogComponent,
    MetricChartDialogData,
} from '../metricchartdialog/metric-chart-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DashboardService } from '../dashboard.service';
import {
    DashboardMetrics,
    TimeSeriesPoint,
    GeneracaoMedicaoItem,
    HistoricoMedicaoItem
} from '../models/dashboard.models';
import { SolarplantService } from 'src/app/pages/administrator/solarplant/solarplant.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SolarplantModel } from '../../administrator/solarplant/solarplant.component';

type MetricKey =
    | 'irradiance'
    | 'ambientTemp'
    | 'humidity'
    | 'wind'
    | 'plateTemp'
    | 'current'
    | 'voltage';

export type LineChartOptions = {
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis | ApexYAxis[];
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    tooltip: ApexTooltip;
    colors: string[];
};

@Component({
    selector: 'app-solar-overview',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        NgApexchartsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './solarplant.component.html',
    styleUrl: './solarplant.component.scss',
})
export class DashboardSolarplantComponent implements OnInit {
    data: DashboardMetrics = {
        current: 0,
        irradiance: 0,
        plateTemp: 0,
        ambientTemp: 0,
        voltage: 0,
        humidity: 0,
        windSpeed: 0,
    };

    isLoading = false;
    maxDate = new Date();

    panelCells = Array.from({ length: 12 });

    plants: SolarplantModel[] = [];
    selectedDate: Date | null = new Date();
    selectedPlantId: number = 0;

    genCurrentOptions!: LineChartOptions; // Geração x Corrente (dual axis)
    genVoltageOptions!: LineChartOptions; // Geração x Tensão (dual axis)
    genTempOptions!: LineChartOptions;    // Geração x Temp Ambiente (dual axis)
    productionOptions!: LineChartOptions; // Produção (já real)
    
    irradianceHistoryOptions!: LineChartOptions;
    ambientTempHistoryOptions!: LineChartOptions;
    humidityHistoryOptions!: LineChartOptions;
    windHistoryOptions!: LineChartOptions;
    plateTempHistoryOptions!: LineChartOptions;
    currentHistoryOptions!: LineChartOptions;
    voltageHistoryOptions!: LineChartOptions;

    constructor(
        protected dialog: MatDialog,
        private dashboardService: DashboardService,
        private solarplantService: SolarplantService
    ) {
        this.initChartOptions();
    }

    ngOnInit(): void {
        this.loadPlants();
    }

    // ----------------------------------------------------------------
    // Filtros / carga inicial
    // ----------------------------------------------------------------

    private loadPlants(): void {
        this.isLoading = true;

        this.solarplantService
            .getAll()
            .pipe(finalize(() => {})) // o isLoading vai ser finalizado no onApplyFilters
            .subscribe({
                next: (plants: SolarplantModel[]) => {
                    this.plants = plants;

                    if (this.plants.length > 0) {
                        // primeira usina como padrão
                        this.selectedPlantId = this.plants[0].id;
                    }

                    // assim que tiver usina + data atual, já dispara a consulta
                    this.onApplyFilters();
                },
                error: (err) => {
                    console.error('Erro ao carregar usinas', err);
                    this.isLoading = false; // se der erro aqui, precisamos soltar o loading
                },
            });
    }

    onApplyFilters(): void {
        if (!this.selectedDate) {
            return;
        }

        const plantId = this.selectedPlantId ?? 0;
        const date = this.selectedDate;

        this.isLoading = true;

        forkJoin({
            medicao: this.dashboardService.getMedicao(plantId, date),
            geracao: this.dashboardService.getGeracao(plantId, date),

            // 3 novos endpoints para gráficos dual axis:
            geracaoXCorrente: this.dashboardService.getGeracaoXOutraMedida(
                plantId,
                date,
                2 // campo Corrente
            ),
            geracaoXTensao: this.dashboardService.getGeracaoXOutraMedida(
                plantId,
                date,
                3 // campo Tensão
            ),
            geracaoXTempAmbiente: this.dashboardService.getGeracaoXOutraMedida(
                plantId,
                date,
                5 // campo Temperatura ambiente
            ),
        })
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: ({
                           medicao,
                           geracao,
                           geracaoXCorrente,
                           geracaoXTensao,
                           geracaoXTempAmbiente,
                       }) => {
                    // 1) Topo: cards (medição atual)
                    this.data = this.dashboardService.mapMedicoesToDashboardMetrics(
                        medicao
                    );

                    // 2) Produção (linha única)
                    this.updateProductionChart(geracao);

                    // 3) Geração x Corrente (dual axis)
                    this.updateGenCurrentChart(geracaoXCorrente);

                    // 4) Geração x Tensão (dual axis)
                    this.updateGenVoltageChart(geracaoXTensao);

                    // 5) Geração x Temperatura Ambiente (dual axis)
                    this.updateGenTempChart(geracaoXTempAmbiente);

                    // (Os gráficos dos modais continuam mock, depois podemos ligar
                    // o getHistoricoMedicao neles também.)
                },
                error: (err) => {
                    console.error('Erro ao carregar dashboard', err);
                },
            });
    }

    // ----------------------------------------------------------------
    // Configuração base dos gráficos
    // ----------------------------------------------------------------

    private initChartOptions(): void {
        const baseChart: Omit<LineChartOptions, 'series' | 'colors'> = {
            chart: {
                type: 'line',
                height: 220,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true,
                    },
                },
                zoom: { enabled: true },
            },
            stroke: {
                curve: 'smooth',
                width: 3,
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '11px',
                    },
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '11px',
                    },
                },
            },
        };

        // Geração x Corrente (vai ser dual axis depois, aqui deixamos vazio)
        this.genCurrentOptions = {
            ...baseChart,
            colors: ['#2563eb', '#10b981'],
            series: [
                {
                    name: 'Geração (kWh)',
                    data: [],
                },
                {
                    name: 'Corrente (A)',
                    data: [],
                },
            ],
        };

        // Geração x Tensão
        this.genVoltageOptions = {
            ...baseChart,
            colors: ['#2563eb', '#22c55e'],
            series: [
                {
                    name: 'Geração (kWh)',
                    data: [],
                },
                {
                    name: 'Tensão (V)',
                    data: [],
                },
            ],
        };

        // Geração x Temperatura Ambiente
        this.genTempOptions = {
            ...baseChart,
            colors: ['#2563eb', '#f97316'],
            series: [
                {
                    name: 'Geração (kWh)',
                    data: [],
                },
                {
                    name: 'Temp. Ambiente (°C)',
                    data: [],
                },
            ],
        };

        // Produção (linha única, já com eixo de data/horário)
        this.productionOptions = {
            ...baseChart,
            colors: ['#0ea5e9'],
            series: [
                {
                    name: 'Produção (kWh)',
                    data: [],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: 'kWh' },
            },
            tooltip: {
                ...baseChart.tooltip,
                x: {
                    format: 'dd/MM/yyyy HH:mm',
                },
            },
        };

        // -------- opções dos gráficos do modal (mock inicial) --------

        this.irradianceHistoryOptions = {
            ...baseChart,
            colors: ['#fbbf24'],
            series: [
                {
                    name: 'Irradiação (W/m²)',
                    data: [-3.8, 120, 450, 800, 300],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: 'W/m²' },
            },
        };

        this.ambientTempHistoryOptions = {
            ...baseChart,
            colors: ['#f97316'],
            series: [
                {
                    name: 'Temp. ambiente (°C)',
                    data: [22, 24, 27, 29, 26],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: '°C' },
            },
        };

        this.humidityHistoryOptions = {
            ...baseChart,
            colors: ['#0ea5e9'],
            series: [
                {
                    name: 'Umidade (%)',
                    data: [80, 85, 90, 95, 99.9],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: '%' },
            },
        };

        this.windHistoryOptions = {
            ...baseChart,
            colors: ['#22c55e'],
            series: [
                {
                    name: 'Vento (m/s)',
                    data: [-3, -8, -12, -15, -10],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: 'm/s' },
            },
        };

        this.plateTempHistoryOptions = {
            ...baseChart,
            colors: ['#ef4444'],
            series: [
                {
                    name: 'Temp. placa (°C)',
                    data: [27, 30, 35, 38, 33],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: '°C' },
            },
        };

        this.currentHistoryOptions = {
            ...baseChart,
            colors: ['#2563eb'],
            series: [
                {
                    name: 'Corrente (A)',
                    data: [0.0, 0.5, 1.2, 0.9, 0.3],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: 'A' },
            },
        };

        this.voltageHistoryOptions = {
            ...baseChart,
            colors: ['#22c55e'],
            series: [
                {
                    name: 'Tensão (V)',
                    data: [0.1, 50, 110, 95, 40],
                },
            ],
            yaxis: {
                ...baseChart.yaxis!,
                title: { text: 'V' },
            },
        };
    }

    // ----------------------------------------------------------------
    // Geração (produção) - já estava real
    // ----------------------------------------------------------------

    private updateProductionChart(points: TimeSeriesPoint[]): void {
        if (!points || points.length === 0) {
            this.productionOptions = {
                ...this.productionOptions,
                series: [
                    {
                        name: 'Produção (kWh)',
                        data: [],
                    },
                ],
            };
            return;
        }

        const seriesData = points.map((p) => ({
            x: new Date(p.createdAt).getTime(),
            y: p.value,
        }));

        this.productionOptions = {
            ...this.productionOptions,
            series: [
                {
                    name: 'Produção (kWh)',
                    data: seriesData,
                },
            ],
            xaxis: {
                ...this.productionOptions.xaxis,
                type: 'datetime',
            },
            tooltip: {
                ...this.productionOptions.tooltip,
                x: {
                    format: 'dd/MM/yyyy HH:mm',
                },
            },
        };
    }

    // ----------------------------------------------------------------
    // Helpers para gráficos dual axis (Geração x outra medida)
    // ----------------------------------------------------------------

    private buildDualAxisChart(
        base: LineChartOptions,
        points: GeneracaoMedicaoItem[],
        secondSeriesName: string,
        secondUnit: string
    ): LineChartOptions {
        if (!points || points.length === 0) {
            return {
                ...base,
                series: [
                    { name: 'Geração (kWh)', data: [] },
                    { name: secondSeriesName, data: [] },
                ],
            };
        }

        const generationSeries = points.map((p) => ({
            x: new Date(p.createdAt).getTime(),
            y: p.geracao,
        }));

        const otherSeries = points.map((p) => ({
            x: new Date(p.createdAt).getTime(),
            y: p.value,
        }));

        return {
            ...base,
            series: [
                { name: 'Geração (kWh)', data: generationSeries },
                { name: secondSeriesName, data: otherSeries },
            ],
            xaxis: {
                ...base.xaxis,
                type: 'datetime',
            },
            yaxis: [
                {
                    title: { text: 'kWh' },
                    labels: {
                        style: {
                            colors: '#9ca3af',
                            fontSize: '11px',
                        },
                    },
                },
                {
                    opposite: true,
                    title: { text: secondUnit },
                    labels: {
                        style: {
                            colors: '#9ca3af',
                            fontSize: '11px',
                        },
                    },
                },
            ],
            tooltip: {
                ...base.tooltip,
                shared: true,
                x: {
                    format: 'dd/MM/yyyy HH:mm',
                },
            },
            legend: {
                ...base.legend,
                show: true,
                position: 'top',
                horizontalAlign: 'left',
            },
        };
    }

    private updateGenCurrentChart(points: GeneracaoMedicaoItem[]): void {
        this.genCurrentOptions = this.buildDualAxisChart(
            this.genCurrentOptions,
            points,
            'Corrente (A)',
            'A'
        );
    }

    private updateGenVoltageChart(points: GeneracaoMedicaoItem[]): void {
        this.genVoltageOptions = this.buildDualAxisChart(
            this.genVoltageOptions,
            points,
            'Tensão (V)',
            'V'
        );
    }

    private updateGenTempChart(points: GeneracaoMedicaoItem[]): void {
        this.genTempOptions = this.buildDualAxisChart(
            this.genTempOptions,
            points,
            'Temp. Ambiente (°C)',
            '°C'
        );
    }

    private buildSingleMetricHistoryChart(
        color: string,
        seriesName: string,
        unit: string,
        points: HistoricoMedicaoItem[]
    ): LineChartOptions {
        const baseChart: Omit<LineChartOptions, 'series' | 'colors'> = {
            chart: {
                type: 'line',
                height: 220,
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true,
                    },
                },
                zoom: { enabled: true },
            },
            stroke: {
                curve: 'smooth',
                width: 3,
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                show: false,
            },
            tooltip: {
                theme: 'dark',
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '11px',
                    },
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '11px',
                    },
                },
                title: { text: unit },
            },
        };

        const seriesData = (points || []).map((p) => ({
            x: new Date(p.createdAt).getTime(),
            y: p.value,
        }));

        return {
            ...baseChart,
            colors: [color],
            series: [
                {
                    name: seriesName,
                    data: seriesData,
                },
            ],
            tooltip: {
                ...baseChart.tooltip,
                x: {
                    format: 'dd/MM/yyyy HH:mm',
                },
            },
        };
    }
    
    // ----------------------------------------------------------------
    // Modal de métricas (continua usando mock)
    // ----------------------------------------------------------------

    openMetricChart(metric: MetricKey): void {
        if (!this.selectedDate || !this.selectedPlantId) {
            return;
        }

        const plantId = this.selectedPlantId;
        const date = this.selectedDate;

        // Mapa com código do campo + visual do gráfico + textos
        const configMap: Record<
            MetricKey,
            {
                code: number;
                color: string;
                seriesName: string;
                unit: string;
                title: string;
                subtitle: string;
            }
        > = {
            irradiance: {
                code: 6,
                color: '#fbbf24',
                seriesName: 'Irradiação (W/m²)',
                unit: 'W/m²',
                title: 'Irradiação ao longo do dia',
                subtitle: 'W/m²',
            },
            ambientTemp: {
                code: 5,
                color: '#f97316',
                seriesName: 'Temp. ambiente (°C)',
                unit: '°C',
                title: 'Temperatura ambiente ao longo do dia',
                subtitle: '°C',
            },
            humidity: {
                code: 8,
                color: '#0ea5e9',
                seriesName: 'Umidade (%)',
                unit: '%',
                title: 'Umidade relativa do ar ao longo do dia',
                subtitle: '%',
            },
            wind: {
                code: 7,
                color: '#22c55e',
                seriesName: 'Vento (m/s)',
                unit: 'm/s',
                title: 'Velocidade do vento ao longo do dia',
                subtitle: 'm/s',
            },
            plateTemp: {
                code: 4,
                color: '#ef4444',
                seriesName: 'Temp. placa (°C)',
                unit: '°C',
                title: 'Temperatura da placa ao longo do dia',
                subtitle: '°C',
            },
            current: {
                code: 2,
                color: '#2563eb',
                seriesName: 'Corrente (A) ao longo do dia',
                unit: 'A',
                title: 'Corrente do string',
                subtitle: 'A',
            },
            voltage: {
                code: 3,
                color: '#22c55e',
                seriesName: 'Tensão (V) ao longo do dia',
                unit: 'V',
                title: 'Tensão do string',
                subtitle: 'V',
            },
        };

        const cfg = configMap[metric];
        if (!cfg) {
            return;
        }

        this.isLoading = true;

        this.dashboardService
            .getHistoricoMedicao(plantId, date, cfg.code)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (items: HistoricoMedicaoItem[]) => {
                    const chartOptions = this.buildSingleMetricHistoryChart(
                        cfg.color,
                        cfg.seriesName,
                        cfg.unit,
                        items
                    );

                    const data: MetricChartDialogData = {
                        title: cfg.title,
                        subtitle: cfg.subtitle,
                        chartOptions: chartOptions as any,
                    };

                    this.dialog.open(MetricChartDialogComponent, {
                        width: '900px',
                        maxWidth: '95vw',
                        data,
                    });
                },
                error: (err) => {
                    console.error('Erro ao carregar histórico da métrica', metric, err);
                },
            });
    }

}
