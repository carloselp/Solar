import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        let headers = req.headers;

        if (!headers.has('Content-Type') && req.body) {
            headers = headers.set('Content-Type', 'application/json');
        }

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        if (userId) {
            headers = headers.set('UserId', userId);
        }

        const authReq = req.clone({ headers });

        return next.handle(authReq);
    }
}
