import {Component, Inject, Optional} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "../../../material.module";
import {DatePipe} from "@angular/common";
import {CoreService} from "../../../services/core.service";
import {ProfileModel} from "./profile.component";

@Component({
    selector: 'app-profile-dialog-content',
    imports: [MatDialogModule, FormsModule, MaterialModule, TranslateModule],
    providers: [DatePipe],
    templateUrl: './profile-dialog-content.component.html',
    styleUrl: './profile-dialog-content.component.scss'
})
export class ProfileDialogContentComponent {
    action: string;
    local_data: any;
    options = this.settings.getOptions();

    constructor(
        public datePipe: DatePipe,
        public dialogRef: MatDialogRef<ProfileDialogContentComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: ProfileModel,
        private translate: TranslateService,
        private settings: CoreService
    ) {
        const lang = this.options.language || 'pt-BR';

        this.translate.setDefaultLang(lang);
        this.translate.use(lang);

        this.local_data = { ...data };
        this.action = this.local_data.action;
    }

    doAction(): void {
        this.dialogRef.close({ event: this.action, data: this.local_data });
    }
    closeDialog(): void {
        this.dialogRef.close({ event: 'Cancel' });
    }
}