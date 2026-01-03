import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';
import { SolarplantModel } from 'src/app/pages/administrator/solarplant/solarplant.component';
import { AppConstants } from 'src/app/app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class SolarplantService {
    private readonly baseUrl = AppConstants.baseSolarPlant;

    constructor(private crud: CrudService<SolarplantModel>,
                private http: HttpClient) {}

    getAll(): Observable<SolarplantModel[]> {
        return this.crud.getAll(this.baseUrl);
    }

    getById(id: number): Observable<SolarplantModel> {
        return this.crud.get(this.baseUrl, id);
    }

    create(entity: SolarplantModel): Observable<SolarplantModel> {
        return this.crud.add(this.baseUrl, entity);
    }

    update(entity: SolarplantModel): Observable<SolarplantModel> {
        return this.crud.update(this.baseUrl, entity.id, entity);
    }

    delete(id: number): Observable<void> {
        return this.crud.delete(this.baseUrl, id);
    }
}
