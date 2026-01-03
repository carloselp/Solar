import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudService } from 'src/app/services/crud.service';
import { UserModel } from 'src/app/pages/administrator/user/user.component';
import { AppConstants } from 'src/app/app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly baseUrl = AppConstants.baseUser;

    constructor(private crud: CrudService<UserModel>,
                private http: HttpClient) {}

    getAll(): Observable<UserModel[]> {
        return this.crud.getAll(this.baseUrl);
    }

    getById(id: number): Observable<UserModel> {
        return this.crud.get(this.baseUrl, id);
    }

    create(user: UserModel): Observable<UserModel> {
        return this.crud.add(this.baseUrl, user);
    }

    update(user: UserModel): Observable<UserModel> {
        return this.crud.update(this.baseUrl, user.id, user);
    }

    delete(id: number): Observable<void> {
        return this.crud.delete(this.baseUrl, id);
    }

    changePassword(id: number, access_key: string): Observable<void> {
        const body = { access_key };
        
        const url = `${this.baseUrl}/${id}/changepassword`;

        return this.http.put<void>(url, body);
    }
}
