import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConstants} from 'src/app/app.constants';
import {NotificationItem} from "./notification.component";

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
