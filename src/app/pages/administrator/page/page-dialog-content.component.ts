import {Component, Inject, Optional} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import {MaterialModule} from "../../../material.module";
import {DatePipe} from "@angular/common";
import {CoreService} from "../../../services/core.service";
import {PageModel} from "./page.component";
import {TablerIconsModule} from "angular-tabler-icons";

@Component({
    selector: 'app-page-dialog-content',
    imports: [MatDialogModule, FormsModule, MaterialModule, TranslateModule, TablerIconsModule],
    providers: [DatePipe],
    templateUrl: './page-dialog-content.component.html'
})
export class PageDialogContentComponent {
    action: string;
    local_data: any;
    options = this.settings.getOptions();

    constructor(
        public datePipe: DatePipe,
        public dialogRef: MatDialogRef<PageDialogContentComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: PageModel,
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