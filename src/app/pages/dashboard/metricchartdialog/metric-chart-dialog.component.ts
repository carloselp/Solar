import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import {
    NgApexchartsModule,
    ApexAxisChartSeries,
    ApexNonAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexYAxis,
    ApexStroke,
    ApexDataLabels,
    ApexLegend,
    ApexTooltip,
} from 'ng-apexcharts';

export type DialogLineChartOptions = {
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

export interface MetricChartDialogData {
    title: string;
    subtitle?: string; // ex: unidade
    chartOptions: DialogLineChartOptions;
}

@Component({
    selector: 'app-metric-chart-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MaterialModule, NgApexchartsModule],
    templateUrl: './metric-chart-dialog.component.html',
    styleUrls: ['./metric-chart-dialog.component.scss'],
})
export class MetricChartDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<MetricChartDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MetricChartDialogData
    ) {}
}
