import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginRequest, LoginResponse } from './models/side-login.auth';
import {AppConstants} from 'src/app/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private jwtHelper = new JwtHelperService();

    private currentUserIdSubject = new BehaviorSubject<string | null>(
        localStorage.getItem('userId')
    );
    currentUserId$ = this.currentUserIdSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {}

    login(payload: LoginRequest) {
        return this.http.post<LoginResponse>(AppConstants.baseLogin, payload).pipe(
            tap((response) => {
                if (response.autenticated) {
                    this.storeSession(response);
                }
            }),
            map((response) => {
                if (!response.autenticated) {
                    throw new Error('Authentication failed');
                }
                return response;
            })
        );
    }

    private storeSession(response: LoginResponse): void {
        const { accessToken, user, menu } = response;

        localStorage.setItem('token', accessToken);

        if (user && user.id != null) {
            localStorage.setItem('userId', String(user.id));
            this.currentUserIdSubject.next(String(user.id));
        } else {
            this.currentUserIdSubject.next(null);
        }

        localStorage.setItem('user', JSON.stringify(user));

        localStorage.setItem('menu', JSON.stringify(menu));
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) return false;
        
        return !this.jwtHelper.isTokenExpired(token);
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        localStorage.removeItem('menu');

        this.currentUserIdSubject.next(null);
        this.router.navigate(['/authentication/login']);
    }
}
