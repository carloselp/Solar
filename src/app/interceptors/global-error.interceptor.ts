import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/pages/authentication/auth.service';

@Injectable()
export class GlobalErrorInterceptor implements HttpInterceptor {
    constructor(
        private router: Router,
        private toastr: ToastrService,
        private translate: TranslateService,
        private authService: AuthService
    ) {}

    intercept(
        req: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                // 401 / 403 -> sessão expirada ou acesso negado
                if (error.status === 401 || error.status === 403) {
                    const title = this.translate.instant('Common.SessionExpiredTitle');
                    const msg = this.translate.instant('Common.SessionExpiredMessage');

                    this.toastr.warning(msg, title);

                    // usa o fluxo padrão de logout (limpa storage + navega)
                    this.authService.logout();
                }
                // 500+ -> erro de servidor
                else if (error.status >= 500) {
                    const title = this.translate.instant('Common.Error');
                    const msg = this.translate.instant('Common.ServerError');

                    this.toastr.error(msg, title);
                }
                // outros erros (400, 404, etc.) você pode tratar depois se quiser

                return throwError(() => error);
            })
        );
    }
}
