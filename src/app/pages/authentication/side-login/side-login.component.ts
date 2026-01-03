import {Component, OnInit} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import {
    FormGroup,
    FormControl,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { BrandingComponent } from '../../../layouts/full/vertical/sidebar/branding.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/pages/authentication/auth.service';
import { LoginRequest } from 'src/app/pages/authentication/models/side-login.auth';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-side-login',
    standalone: true,
    imports: [
        RouterModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        BrandingComponent,
        TranslateModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './side-login.component.html',
    styleUrls: ['./side-login.component.scss'],
})
export class AppSideLoginComponent implements OnInit {
    options = this.settings.getOptions();
    isLoading = false;

    form = new FormGroup({
        uname: new FormControl<string | null>('', [
            Validators.required,
            Validators.minLength(6),
        ]),
        password: new FormControl<string | null>('', [Validators.required]),
    });

    constructor(
        private settings: CoreService,
        private router: Router,
        private translate: TranslateService,
        private toastr: ToastrService,
        private authService: AuthService
    ) {
        const lang = this.options.language || 'pt-BR';

        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

    ngOnInit(): void {
        if (this.authService.isLoggedIn()) {
            const title = this.translate.instant('LoginPage.AlreadyLogged.Title');
            const msg = this.translate.instant('LoginPage.AlreadyLogged.Message');

            this.toastr.info(msg, title);

            this.router.navigate(['/dashboard/solarplant']);
            return;
        }
    }

    get f() {
        return this.form.controls;
    }

    submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload: LoginRequest = {
            user_login: this.form.get('uname')?.value ?? '',
            access_key: this.form.get('password')?.value ?? '',
        };

        this.isLoading = true;

        this.authService
            .login(payload)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
            next: () => {
                const title = this.translate.instant('LoginPage.Success.Title');
                const msg = this.translate.instant('LoginPage.Success.Message');

                this.toastr.success(msg, title);

                this.router.navigate(['/dashboard/solarplant']);
            },
            error: () => {
                const title = this.translate.instant('LoginPage.Error.Title');
                const msg = this.translate.instant('LoginPage.Error.Message');

                this.toastr.error(msg, title);
            },
        });
    }
}
