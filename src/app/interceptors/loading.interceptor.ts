import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppConstants } from '../app.constants';
import { HttpLoadingService } from '../services/http-loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
    constructor(private readonly httpLoadingService: HttpLoadingService) {}

    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (!this.isBackendRequest(req.url)) {
            return next.handle(req);
        }

        this.httpLoadingService.show();

        return next.handle(req).pipe(
            finalize(() => {
                this.httpLoadingService.hide();
            })
        );
    }

    private isBackendRequest(url: string): boolean {
        return url.startsWith(AppConstants.baseUrl);
    }
}
