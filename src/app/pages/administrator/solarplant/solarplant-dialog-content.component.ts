import {Component, Inject, Optional} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "../../../material.module";
import {DatePipe} from "@angular/common";
import {CoreService} from "../../../services/core.service";
import {SolarplantModel} from "./solarplant.component";
import {CompanyModel} from '../company/company.component';
import {CompanyService} from '../company/company.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-solarplant-dialog-content',
    imports: [MatDialogModule, FormsModule, MaterialModule, TranslateModule],
    providers: [DatePipe],
  templateUrl: './solarplant-dialog-content.component.html',
  styleUrl: './solarplant-dialog-content.component.scss'
})
export class SolarplantDialogContentComponent {
    action: string;
    local_data: any;
    options = this.settings.getOptions();
    companies: CompanyModel[] = [];
    isCompaniesLoading = false;

    constructor(
        public datePipe: DatePipe,
        public dialogRef: MatDialogRef<SolarplantDialogContentComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: SolarplantModel,
        private translate: TranslateService,
        private settings: CoreService,
        private companyService: CompanyService
    ) {
        const lang = this.options.language || 'pt-BR';

        this.translate.setDefaultLang(lang);
        this.translate.use(lang);

        this.local_data = { ...data };
        this.action = this.local_data.action;

        if (
            this.local_data.companyId === undefined ||
            this.local_data.companyId === null
        ) {
            this.local_data.companyId = 0;
        }

        if (this.action !== 'Delete') {
            this.loadCompanies();
        }
    }

    private loadCompanies(): void {
        this.isCompaniesLoading = true;
        this.companyService
            .getAll()
            .pipe(finalize(() => (this.isCompaniesLoading = false)))
            .subscribe({
                next: (companies) => {
                    this.companies = companies ?? [];
                },
                error: () => {
                    this.companies = [];
                },
            });
    }

    doAction(): void {
        this.dialogRef.close({ event: this.action, data: this.local_data });
    }
    closeDialog(): void {
        this.dialogRef.close({ event: 'Cancel' });
    }
}
