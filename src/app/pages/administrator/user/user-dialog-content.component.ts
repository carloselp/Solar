import {Component, Inject, Optional} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "../../../material.module";
import {DatePipe} from "@angular/common";
import {UserModel} from "./user.component";
import {CoreService} from "../../../services/core.service";
import {ProfileService} from 'src/app/pages/administrator/profile/profile.service';
import {ProfileModel} from 'src/app/pages/administrator/profile/profile.component';
import {CompanyModel} from 'src/app/pages/administrator/company/company.component';
import {CompanyService} from 'src/app/pages/administrator/company/company.service';
import {finalize} from "rxjs/operators";
import {forkJoin} from 'rxjs';

@Component({
    selector: 'app-user-dialog-content',
    imports: [MatDialogModule, FormsModule, MaterialModule, TranslateModule],
    providers: [DatePipe],
    templateUrl: './user-dialog-content.component.html',
    styleUrl: './user-dialog-content.component.scss'
})
export class AppUserDialogContentComponent {
    action: string;
    local_data: any;
    options = this.settings.getOptions();

    password = '';
    confirmPassword = '';

    profiles: ProfileModel[] = [];
    companies: CompanyModel[] = [];
    isProfilesLoading = false;

    constructor(
        public datePipe: DatePipe,
        public dialogRef: MatDialogRef<AppUserDialogContentComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: UserModel,
        private translate: TranslateService,
        private settings: CoreService,
        private profileService: ProfileService,
        private companyService: CompanyService,
    ) {
        const lang = this.options.language || 'pt-BR';

        this.translate.setDefaultLang(lang);
        this.translate.use(lang);

        this.local_data = {...data};

        this.action = this.local_data.action;

        if (
            this.local_data.profileId === undefined ||
            this.local_data.profileId === null
        ) {
            this.local_data.profileId = 0;
        }

        if (
            this.local_data.companyId === undefined ||
            this.local_data.companyId === null
        ) {
            this.local_data.companyId = 0;
        }

        if (this.action !== 'Delete' && this.action !== 'Passkey') {
            this.loadProfiles();
        }

    }

    private loadProfiles(): void {
        this.isProfilesLoading = true;

        forkJoin({
            profiles: this.profileService.getAll(),
            companies: this.companyService.getAll(),
        })
            .pipe(finalize(() => (this.isProfilesLoading = false)))
            .subscribe({
                next: ({profiles, companies}) => {
                    this.profiles = profiles ?? [];
                    this.companies = companies ?? [];
                },
                error: (err) => {
                    console.error('Erro ao carregar perfis e empresas', err);
                    this.profiles = [];
                    this.companies = [];
                },
            });
    }

    doAction(): void {
        if (this.action === 'Passkey') {
            this.local_data.access_key = this.password;
        }

        this.dialogRef.close({event: this.action, data: this.local_data});
    }

    closeDialog(): void {
        this.dialogRef.close({event: 'Cancel'});
    }
}
