import {Component, Inject, Optional} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {MaterialModule} from '../../../material.module';
import {DatePipe} from '@angular/common';
import {CoreService} from '../../../services/core.service';
import {CompanyModel} from './company.component';

@Component({
    selector: 'app-company-dialog-content',
    imports: [MatDialogModule, FormsModule, MaterialModule, TranslateModule],
    providers: [DatePipe],
    templateUrl: './company-dialog-content.component.html',
})
export class CompanyDialogContentComponent {
    action: string;
    local_data: any;
    options = this.settings.getOptions();

    constructor(
        public datePipe: DatePipe,
        public dialogRef: MatDialogRef<CompanyDialogContentComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: CompanyModel,
        private translate: TranslateService,
        private settings: CoreService
    ) {
        const lang = this.options.language || 'pt-BR';

        this.translate.setDefaultLang(lang);
        this.translate.use(lang);

        this.local_data = {...data};
        this.action = this.local_data.action;

        if (this.local_data.status === undefined || this.local_data.status === null) {
            this.local_data.status = 1;
        }
    }

    doAction(): void {
        this.dialogRef.close({event: this.action, data: this.local_data});
    }

    closeDialog(): void {
        this.dialogRef.close({event: 'Cancel'});
    }
}
