import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';
import { PageModel } from 'src/app/pages/administrator/page/page.component';
import { AppConstants } from 'src/app/app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class PageService {
    private readonly baseUrl = AppConstants.baseSystemPages;

    constructor(private crud: CrudService<PageModel>,
                private http: HttpClient) {}

    getAll(): Observable<PageModel[]> {
        return this.crud.getAll(this.baseUrl);
    }

    getById(id: number): Observable<PageModel> {
        return this.crud.get(this.baseUrl, id);
    }

    create(entity: PageModel): Observable<PageModel> {
        return this.crud.add(this.baseUrl, entity);
    }

    update(entity: PageModel): Observable<PageModel> {
        return this.crud.update(this.baseUrl, entity.id, entity);
    }

    delete(id: number): Observable<void> {
        return this.crud.delete(this.baseUrl, id);
    }
}
