import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {forkJoin} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {DashboardService} from 'src/app/pages/dashboard/dashboard.service';
import {NotificationService} from 'src/app/pages/notification/notification.service';
import {SolarplantService} from 'src/app/pages/administrator/solarplant/solarplant.service';
import {SolarplantModel} from 'src/app/pages/administrator/solarplant/solarplant.component';

@Component({
    selector: 'app-next-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './next-reports.component.html',
})
export class NextReportsComponent {
    plants: SolarplantModel[] = [];
    selectedPlantId = 0;
    startDate = new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    endDate = new Date().toISOString().slice(0, 10);
    isLoading = false;
    summary: Array<{label: string; value: string}> = [];

    constructor(
        private readonly dashboardService: DashboardService,
        private readonly notificationService: NotificationService,
        private readonly solarplantService: SolarplantService
    ) {
        this.solarplantService.getAll().subscribe({
            next: (plants) => {
                this.plants = plants;
                if (plants.length > 0) {
                    this.selectedPlantId = plants[0].id;
                }
                this.generate();
            },
        });
    }

    generate(): void {
        if (!this.selectedPlantId) {
            return;
        }

        this.isLoading = true;
        forkJoin({
            generation: this.dashboardService.getGeracao(
                this.selectedPlantId,
                this.startDate,
                this.endDate
            ),
            measurements: this.dashboardService.getMedicao(
                this.selectedPlantId,
                this.startDate,
                this.endDate
            ),
            notifications: this.notificationService.get(this.selectedPlantId, this.startDate),
        })
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: ({generation, measurements, notifications}) => {
                    const totalGeneration = generation.reduce(
                        (acc, item) => acc + item.value,
                        0
                    );
                    const avgMeasurement =
                        measurements.reduce((acc, item) => acc + item.value, 0) /
                        Math.max(measurements.length, 1);

                    this.summary = [
                        {label: 'Energia acumulada', value: `${totalGeneration.toFixed(2)} MWh`},
                        {label: 'Média das medições', value: `${avgMeasurement.toFixed(2)}`},
                        {label: 'Alertas no início do período', value: `${notifications.length}`},
                        {label: 'Faixa do relatório', value: `${this.startDate} → ${this.endDate}`},
                    ];
                },
                error: () => {
                    this.summary = [];
                },
            });
    }

    exportCsv(): void {
        const lines = ['Indicador,Valor', ...this.summary.map((item) => `${item.label},${item.value}`)];
        const blob = new Blob([lines.join('\n')], {type: 'text/csv;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'smartgrid-relatorio.csv';
        anchor.click();
        URL.revokeObjectURL(url);
    }
}
