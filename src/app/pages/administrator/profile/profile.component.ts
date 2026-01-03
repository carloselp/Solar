import { Component, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatNativeDateModule } from '@angular/material/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoreService } from '../../../services/core.service';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseCrudComponent } from 'src/app/shared/base-crud.component';
import { Observable } from 'rxjs';
import {ProfileDialogContentComponent} from "./profile-dialog-content.component";
import {ProfileService} from "./profile.service";
import { ProfilePagesDialogComponent } from './profile-pages-dialog.component';

export interface ProfileModel {
    id: number;
    profile_name: string;
    countPages: number;
}

export interface ProfilePageModel{
    id: number;
    name_page: string;
    group_name: string;
    has_permission: boolean;
}

@Component({
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
    imports: [
        MaterialModule,
        TablerIconsModule,
        MatNativeDateModule,
        NgScrollbarModule,
        CommonModule,
        TranslateModule,
        MatProgressSpinnerModule,
    ],
    providers: [DatePipe],
})
export class ProfileComponent extends BaseCrudComponent<ProfileModel>{
    options = this.settings.getOptions();

    @ViewChild(MatTable, { static: true })
    table: MatTable<ProfileModel> = Object.create(null);

    displayedColumns: string[] = [
        '#',
        'profile_name',
        'countPages',
        'action',
    ];

    constructor(
        dialog: MatDialog,
        translate: TranslateService,
        private settings: CoreService,
        private service: ProfileService,
        toastr: ToastrService
    ) {
        super(dialog, translate, toastr);

        const lang = this.options.language || 'pt-BR';
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

    protected getAll$(): Observable<ProfileModel[]> {
        return this.service.getAll();
    }

    protected create$(entity: ProfileModel): Observable<ProfileModel> {
        return this.service.create(entity);
    }

    protected update$(entity: ProfileModel): Observable<ProfileModel> {
        return this.service.update(entity);
    }

    protected delete$(id: number): Observable<void> {
        return this.service.delete(id);
    }

    protected getId(entity: ProfileModel): number {
        return entity.id;
    }

    protected getDialogComponent() {
        return ProfileDialogContentComponent;
    }

    openPagesDialog(profile: ProfileModel): void {
        const dialogRef = this.dialog.open(ProfilePagesDialogComponent, {
            data: profile,
            width: '600px',
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result?.event === 'Saved') {
                this.loadItems()
            }
        });
    }
}
