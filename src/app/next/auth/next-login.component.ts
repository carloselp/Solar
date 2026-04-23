import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {finalize} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from 'src/app/pages/authentication/auth.service';
import {LoginRequest} from 'src/app/pages/authentication/models/side-login.auth';

@Component({
    selector: 'app-next-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './next-login.component.html',
    styleUrl: './next-login.component.scss',
})
export class NextLoginComponent {
    hidePassword = true;
    isLoading = false;

    readonly form = new FormGroup({
        uname: new FormControl('', [Validators.required, Validators.minLength(3)]),
        password: new FormControl('', [Validators.required]),
    });

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly toastr: ToastrService
    ) {
        if (this.authService.isLoggedIn()) {
            this.router.navigateByUrl('/dashboard');
        }
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload: LoginRequest = {
            user_login: this.form.controls.uname.value ?? '',
            access_key: this.form.controls.password.value ?? '',
        };

        const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

        this.isLoading = true;
        this.authService
            .login(payload)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    this.toastr.success('Login realizado com sucesso.', 'SmartGrid');
                    this.router.navigateByUrl(returnUrl);
                },
                error: () => {
                    this.toastr.error(
                        'Não foi possível autenticar com as credenciais informadas.',
                        'SmartGrid'
                    );
                },
            });
    }
}
