import {Component, ViewChild} from '@angular/core';
import {MaterialModule} from "../../../material.module";
import {TablerIconsModule} from "angular-tabler-icons";
import {MatNativeDateModule} from "@angular/material/core";
import {NgScrollbarModule} from "ngx-scrollbar";
import {CommonModule, DatePipe} from "@angular/common";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {BaseCrudComponent} from "../../../shared/base-crud.component";
import {MatTable} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {CoreService} from "../../../services/core.service";
import {PageService} from "./page.service";
import {ToastrService} from "ngx-toastr";
import {Observable} from "rxjs";
import {PageDialogContentComponent} from "./page-dialog-content.component";

export interface PageModel {
    id: number;
    name_page: string;
    route: string;
    icon: string;
    group_menu: string;
}

@Component({
  templateUrl: './page.component.html',
  styleUrl: './page.component.scss',
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
export class PageComponent extends BaseCrudComponent<PageModel>{
    options = this.settings.getOptions();

    @ViewChild(MatTable, { static: true })
    table: MatTable<PageModel> = Object.create(null);

    displayedColumns: string[] = [
        '#',
        'name_page',
        'route',
        'icon',
        'group_menu',
        'action',
    ];

    constructor(
        dialog: MatDialog,
        translate: TranslateService,
        private settings: CoreService,
        private service: PageService,
        toastr: ToastrService
    ) {
        super(dialog, translate, toastr);

        const lang = this.options.language || 'pt-BR';
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

    protected getAll$(): Observable<PageModel[]> {
        return this.service.getAll();
    }

    protected create$(entity: PageModel): Observable<PageModel> {
        return this.service.create(entity);
    }

    protected update$(entity: PageModel): Observable<PageModel> {
        return this.service.update(entity);
    }

    protected delete$(id: number): Observable<void> {
        return this.service.delete(id);
    }

    protected getId(entity: PageModel): number {
        return entity.id;
    }

    protected getDialogComponent() {
        return PageDialogContentComponent;
    }
}
