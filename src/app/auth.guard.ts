import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree,
} from '@angular/router';
import { AuthService } from './pages/authentication/auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private auth: AuthService,
        private router: Router
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        if (this.auth.isLoggedIn()) {
            return true;
        }

        return this.router.createUrlTree(['/authentication/login'], {
            queryParams: { returnUrl: state.url },
        });
    }
}
