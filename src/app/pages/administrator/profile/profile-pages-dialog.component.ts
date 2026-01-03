import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileModel } from './profile.component';
import { ProfileService } from './profile.service';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core.service';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

export interface ProfilePageModel {
    id: number;
    name_page: string;
    group_name: string;
    has_permission: boolean;
}

@Component({
    selector: 'app-profile-pages-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MaterialModule,
        TranslateModule,
        MatProgressSpinnerModule,
        FormsModule,
        MatTableModule,
    ],
    templateUrl: './profile-pages-dialog.component.html',
})
export class ProfilePagesDialogComponent {
    options = this.settings.getOptions();

    pages: ProfilePageModel[] = [];
    isLoading = false;

    displayedColumns: string[] = ['select', 'name', 'group'];

    constructor(
        public dialogRef: MatDialogRef<ProfilePagesDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: ProfileModel,
        private translate: TranslateService,
        private settings: CoreService,
        private profileService: ProfileService,
        private toastr: ToastrService
    ) {
        const lang = this.options.language || 'pt-BR';
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);

        this.loadPages();
    }

    private loadPages(): void {
        this.isLoading = true;

        this.profileService.getProfilePages(this.data.id).subscribe({
            next: (pages) => {
                this.pages = pages;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erro ao carregar páginas do perfil', err);
                this.isLoading = false;

                const title = this.translate.instant('Common.Error');
                const msg = this.translate.instant('Common.Unsuccessful');
                this.toastr.error(msg, title);

                this.dialogRef.close();
            },
        });
    }

    isAllSelected(): boolean {
        return this.pages.length > 0 && this.pages.every(p => p.has_permission);
    }

    isIndeterminate(): boolean {
        const someSelected = this.pages.some(p => p.has_permission);
        return someSelected && !this.isAllSelected();
    }

    masterToggle(checked: boolean): void {
        this.pages = this.pages.map(page => ({
            ...page,
            has_permission: checked,
        }));
    }

    onCancel(): void {
        this.dialogRef.close({ event: 'Cancel' });
    }

    onSave(): void {
        this.isLoading = true;

        this.profileService.updateProfilePages(this.data.id, this.pages).subscribe({
            next: () => {
                this.isLoading = false;

                const title = this.translate.instant('Common.Success');
                const msg = this.translate.instant('Common.Successfully');
                this.toastr.success(msg, title);

                this.dialogRef.close({ event: 'Saved' });
            },
            error: (err) => {
                console.error('Erro ao salvar páginas do perfil', err);
                this.isLoading = false;

                const title = this.translate.instant('Common.Error');
                const msg = this.translate.instant('Common.Unsuccessful');
                this.toastr.error(msg, title);
                this.dialogRef.close({ event: 'Cancel' });
            },
        });
    }
}
