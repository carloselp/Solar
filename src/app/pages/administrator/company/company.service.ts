import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';
import { AppConstants } from 'src/app/app.constants';
import { CompanyModel } from './company.component';

@Injectable({
    providedIn: 'root',
})
export class CompanyService {
    private readonly baseUrl = AppConstants.baseSystemCompanies;

    constructor(private readonly crud: CrudService<CompanyModel>) {}

    getAll(): Observable<CompanyModel[]> {
        return this.crud.getAll(this.baseUrl);
    }

    getById(id: number): Observable<CompanyModel> {
        return this.crud.get(this.baseUrl, id);
    }

    create(entity: CompanyModel): Observable<CompanyModel> {
        return this.crud.add(this.baseUrl, entity);
    }

    update(entity: CompanyModel): Observable<CompanyModel> {
        return this.crud.update(this.baseUrl, entity.id, entity);
    }

    delete(id: number): Observable<void> {
        return this.crud.delete(this.baseUrl, id);
    }
}
