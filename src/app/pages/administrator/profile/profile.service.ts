import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';
import { AppConstants } from 'src/app/app.constants';
import { HttpClient } from '@angular/common/http';
import {ProfileModel, ProfilePageModel} from "./profile.component";

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    private readonly baseUrl = AppConstants.baseSystemProfiles;

    constructor(private crud: CrudService<ProfileModel>,
                private http: HttpClient) {}

    getAll(): Observable<ProfileModel[]> {
        return this.crud.getAll(this.baseUrl);
    }

    getById(id: number): Observable<ProfileModel> {
        return this.crud.get(this.baseUrl, id);
    }

    create(entity: ProfileModel): Observable<ProfileModel> {
        return this.crud.add(this.baseUrl, entity);
    }

    update(entity: ProfileModel): Observable<ProfileModel> {
        return this.crud.update(this.baseUrl, entity.id, entity);
    }

    delete(id: number): Observable<void> {
        return this.crud.delete(this.baseUrl, id);
    }

    getProfilePages(id: number): Observable<ProfilePageModel[]> {
        const url = `${this.baseUrl}/${id}/pages`;
        return this.http.get<ProfilePageModel[]>(url);
    }

    updateProfilePages(
        id: number,
        pages: ProfilePageModel[]
    ): Observable<void> {
        const url = `${this.baseUrl}/${id}/pages`;
        return this.http.put<void>(url, pages);
    }
}
