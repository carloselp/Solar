import {Component, ViewChild} from '@angular/core';
import {MaterialModule} from '../../../material.module';
import {TablerIconsModule} from 'angular-tabler-icons';
import {MatNativeDateModule} from '@angular/material/core';
import {NgScrollbarModule} from 'ngx-scrollbar';
import {CommonModule, DatePipe} from '@angular/common';
import {MatTable} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../services/core.service';
import {ToastrService} from 'ngx-toastr';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {BaseCrudComponent} from 'src/app/shared/base-crud.component';
import {Observable} from 'rxjs';
import {CompanyService} from './company.service';
import {CompanyDialogContentComponent} from './company-dialog-content.component';

export interface CompanyModel {
    id: number;
    name: string;
    document: string;
    city: string;
    state: string;
    status: number;
}

@Component({
    templateUrl: './company.component.html',
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
export class CompanyComponent extends BaseCrudComponent<CompanyModel> {
    options = this.settings.getOptions();

    @ViewChild(MatTable, {static: true})
    table: MatTable<CompanyModel> = Object.create(null);

    displayedColumns: string[] = [
        '#',
        'name',
        'document',
        'city',
        'state',
        'status',
        'action',
    ];

    constructor(
        dialog: MatDialog,
        translate: TranslateService,
        private settings: CoreService,
        private service: CompanyService,
        toastr: ToastrService
    ) {
        super(dialog, translate, toastr);

        const lang = this.options.language || 'pt-BR';
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

    protected getAll$(): Observable<CompanyModel[]> {
        return this.service.getAll();
    }

    protected create$(entity: CompanyModel): Observable<CompanyModel> {
        return this.service.create(entity);
    }

    protected update$(entity: CompanyModel): Observable<CompanyModel> {
        return this.service.update(entity);
    }

    protected delete$(id: number): Observable<void> {
        return this.service.delete(id);
    }

    protected getId(entity: CompanyModel): number {
        return entity.id;
    }

    protected getDialogComponent() {
        return CompanyDialogContentComponent;
    }
}
