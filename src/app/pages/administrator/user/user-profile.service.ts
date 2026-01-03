import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';
import { UserProfileModel } from 'src/app/pages/administrator/user/user.component';
import { AppConstants } from 'src/app/app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class UserProfileService {
    private readonly baseUrl = AppConstants.baseSystemProfileUsers;

    constructor(private crud: CrudService<UserProfileModel>,
                private http: HttpClient) {}

    getAll(): Observable<UserProfileModel[]> {
        return this.crud.getAll(this.baseUrl);
    }

    getById(id: number): Observable<UserProfileModel> {
        return this.crud.get(this.baseUrl, id);
    }

    create(userProfile: UserProfileModel): Observable<UserProfileModel> {
        return this.crud.add(this.baseUrl, userProfile);
    }

    update(userProfile: UserProfileModel): Observable<UserProfileModel> {
        return this.crud.update(this.baseUrl, userProfile.id, userProfile);
    }

    delete(id: number): Observable<void> {
        return this.crud.delete(this.baseUrl, id);
    }
}
