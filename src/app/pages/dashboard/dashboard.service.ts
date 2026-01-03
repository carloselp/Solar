import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConstants} from 'src/app/app.constants';
import {
    MedicaoItem,
    TimeSeriesPoint,
    DashboardMetrics, GeneracaoMedicaoItem, HistoricoMedicaoItem,
} from './models/dashboard.models';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private readonly baseUrl = AppConstants.baseDashboardSolarplant;

    constructor(private http: HttpClient) {
    }

    getMedicao(
        solarplantId: number,
        date: Date | string
    ): Observable<MedicaoItem[]> {
        const params = new HttpParams()
            .set('solarplantId', String(solarplantId))
            .set('startDate', this.formatDateParam(date));

        return this.http.get<MedicaoItem[]>(`${this.baseUrl}/Medicao`, {params});
    }

    getGeracao(
        solarplantId: number,
        date: Date | string
    ): Observable<TimeSeriesPoint[]> {
        const params = new HttpParams()
            .set('solarplantId', String(solarplantId))
            .set('startDate', this.formatDateParam(date));

        return this.http.get<TimeSeriesPoint[]>(`${this.baseUrl}/Geracao`, {params});
    }

    getGeracaoXOutraMedida(solarplantId: number, date: Date | string, field: number): Observable<GeneracaoMedicaoItem[]> {
        const params = new HttpParams()
            .set('solarplantId', String(solarplantId))
            .set('startDate', this.formatDateParam(date))
            .set('field', String(field));

        return this.http.get<GeneracaoMedicaoItem[]>(`${this.baseUrl}/GeracaoXOutraMedida`, {params});
    }

    getHistoricoMedicao(solarplantId: number, date: Date | string, codigo: number): Observable<HistoricoMedicaoItem[]> {
        const params = new HttpParams()
            .set('solarplantId', String(solarplantId))
            .set('startDate', this.formatDateParam(date))
            .set('fieldNumber', String(codigo));

        return this.http.get<HistoricoMedicaoItem[]>(`${this.baseUrl}/Medicao/Historico`, {params});
    }
    
    mapMedicoesToDashboardMetrics(items: MedicaoItem[]): DashboardMetrics {
        const get = (label: string): number =>
            this.getValueByName(items, label) ?? 0;

        return {
            current: get('Corrente atual'),
            irradiance: get('Irradiação atual'),
            plateTemp: get('Temperatura da Placa atual'),
            ambientTemp: get('Temperatura do Ambiente atual'),
            voltage: get('Tensão atual'),
            humidity: get('Umidade atual'),
            windSpeed: get('Velocidade do Vento atual'),
        };
    }
    
    private formatDateParam(date: Date | string): string {
        if (date instanceof Date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        return date;
    }

    private getValueByName(
        items: MedicaoItem[],
        label: string
    ): number | undefined {
        const found = items.find((m) => m.name === label);
        return found?.value;
    }
}
