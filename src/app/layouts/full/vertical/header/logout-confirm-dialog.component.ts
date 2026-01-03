import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {TranslateModule} from "@ngx-translate/core";
import {Component} from "@angular/core";

@Component({
    selector: 'logout-confirm-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, TranslateModule],
    template: `
    <h5 mat-dialog-title class="mat-subtitle-1">{{ 'Header.Logout.Title' | translate }}</h5>
    <div mat-dialog-content class="text-sm lh-16">
        {{ 'Header.Logout.Message' | translate }}
    </div>
    <div mat-dialog-actions class="p-6 pt-0">
        <button mat-flat-button class="bg-error text-white!" mat-dialog-close>
            {{ 'Header.Logout.Cancel' | translate }}
        </button>
        <button mat-flat-button [mat-dialog-close]="'confirm'" cdkFocusInitial>{{ 'Header.Logout.Confirm' | translate }}</button>
    </div>
  `,
})
export class LogoutConfirmDialogComponent {}
