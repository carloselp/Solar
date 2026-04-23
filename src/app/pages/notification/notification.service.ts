import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConstants} from 'src/app/app.constants';

export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface NotificationItem {
    id: number;
    qtd: number;
    createdAt: string;
    tipo: string;
    titulo: string;
    descricao: string;
    solucao: string;
    severidade: NotificationSeverity;
    usina: string;
    isRead?: boolean;
    notificado?: boolean;
}

export interface NotificationSummaryItem {
    severity: NotificationSeverity;
    total: number;
}

export interface NotificationDropdownItem {
    id: number;
    text: string;
    time: string;
    severity: NotificationSeverity;
    isRead: boolean;
    usina: string;
}

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private readonly baseUrl = AppConstants.baseAlert;

    constructor(private http: HttpClient) {
    }

    get(
        solarplantId: number,
        date: Date | string
    ): Observable<NotificationItem[]> {
        const params = new HttpParams()
            .set('solarplantId', String(solarplantId))
            .set('startDate', this.formatDateParam(date));

        return this.http.get<NotificationItem[]>(`${this.baseUrl}`, {params});
    }

    list(filters: {
        solarplantId?: number;
        startDate: Date | string;
        endDate?: Date | string;
        type?: string;
        severity?: string;
        search?: string;
    }): Observable<NotificationItem[]> {
        let params = new HttpParams()
            .set('startDate', this.formatDateParam(filters.startDate));

        if (filters.solarplantId) {
            params = params.set('solarplantId', String(filters.solarplantId));
        }

        if (filters.endDate) {
            params = params.set('endDate', this.formatDateParam(filters.endDate));
        }

        if (filters.type) {
            params = params.set('type', filters.type);
        }

        if (filters.severity) {
            params = params.set('severity', filters.severity);
        }

        if (filters.search) {
            params = params.set('search', filters.search);
        }

        return this.http.get<NotificationItem[]>(`${this.baseUrl}/list`, {params});
    }

    summary(
        solarplantId: number | undefined,
        startDate: Date | string,
        endDate?: Date | string
    ): Observable<NotificationSummaryItem[]> {
        let params = new HttpParams().set('startDate', this.formatDateParam(startDate));

        if (solarplantId) {
            params = params.set('solarplantId', String(solarplantId));
        }

        if (endDate) {
            params = params.set('endDate', this.formatDateParam(endDate));
        }

        return this.http.get<NotificationSummaryItem[]>(`${this.baseUrl}/summary`, {params});
    }

    dropdown(limit = 4): Observable<NotificationDropdownItem[]> {
        const params = new HttpParams().set('limit', String(limit));
        return this.http.get<NotificationDropdownItem[]>(`${this.baseUrl}/dropdown`, {params});
    }

    markRead(id: number): Observable<{success: boolean}> {
        return this.http.put<{success: boolean}>(`${this.baseUrl}/${id}/read`, {});
    }

    markAllRead(solarplantId?: number): Observable<{success: boolean; updatedCount: number}> {
        let params = new HttpParams();
        if (solarplantId) {
            params = params.set('solarplantId', String(solarplantId));
        }

        return this.http.put<{success: boolean; updatedCount: number}>(`${this.baseUrl}/read-all`, {}, {params});
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
}
