import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConstants} from 'src/app/app.constants';

export interface AccountProfile {
    id: number;
    fullName: string;
    role: string;
    email: string;
    contact: string;
    user_login: string;
}

export interface AccountCompany {
    companyName: string;
    document: string;
    city: string;
    state: string;
}

export interface AccountPreferences {
    criticalEmail: boolean;
    whatsappAlerts: boolean;
    dailySummary: boolean;
    weeklySummary: boolean;
    lowPerformanceAlerts: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    private readonly baseUrl = `${AppConstants.baseUrl}api/Account/v1`;

    constructor(private readonly http: HttpClient) {}

    getProfile(): Observable<AccountProfile> {
        return this.http.get<AccountProfile>(`${this.baseUrl}/me`);
    }

    updateProfile(payload: Omit<AccountProfile, 'id' | 'user_login'>): Observable<AccountProfile> {
        return this.http.put<AccountProfile>(`${this.baseUrl}/me`, payload);
    }

    getCompany(): Observable<AccountCompany> {
        return this.http.get<AccountCompany>(`${this.baseUrl}/company`);
    }

    updateCompany(payload: AccountCompany): Observable<AccountCompany> {
        return this.http.put<AccountCompany>(`${this.baseUrl}/company`, payload);
    }

    getPreferences(): Observable<AccountPreferences> {
        return this.http.get<AccountPreferences>(`${this.baseUrl}/preferences`);
    }

    updatePreferences(payload: AccountPreferences): Observable<AccountPreferences> {
        return this.http.put<AccountPreferences>(`${this.baseUrl}/preferences`, payload);
    }
}
