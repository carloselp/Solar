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
import { SolarplantService } from 'src/app/pages/administrator/solarplant/solarplant.service';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseCrudComponent } from 'src/app/shared/base-crud.component';
import { Observable } from 'rxjs';
import {SolarplantDialogContentComponent} from "./solarplant-dialog-content.component";

export interface SolarplantModel {
    id: number;
    name: string;
    efficiency: number;
    id_external: number;
    partnershipId: number;
    partnershipName: string;
    apiKey: string;
}
@Component({
  templateUrl: './solarplant.component.html',
  styleUrl: './solarplant.component.scss',
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
export class SolarplantComponent extends BaseCrudComponent<SolarplantModel>{
    options = this.settings.getOptions();

    @ViewChild(MatTable, { static: true })
    table: MatTable<SolarplantModel> = Object.create(null);

    displayedColumns: string[] = [
        '#',
        'name',
        'efficiency',
        'id_external',
        'partnership',
        'apiKey',
        'action',
    ];

    constructor(
        dialog: MatDialog,
        translate: TranslateService,
        private settings: CoreService,
        private service: SolarplantService,
        toastr: ToastrService
    ) {
        super(dialog, translate, toastr);

        const lang = this.options.language || 'pt-BR';
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
    }

    protected getAll$(): Observable<SolarplantModel[]> {
        return this.service.getAll();
    }

    protected create$(entity: SolarplantModel): Observable<SolarplantModel> {
        return this.service.create(entity);
    }

    protected update$(entity: SolarplantModel): Observable<SolarplantModel> {
        return this.service.update(entity);
    }

    protected delete$(id: number): Observable<void> {
        return this.service.delete(id);
    }

    protected getId(entity: SolarplantModel): number {
        return entity.id;
    }

    protected getDialogComponent() {
        return SolarplantDialogContentComponent;
    }
}
