import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CrudService<T, ID = number> {
    constructor(private http: HttpClient) {}
    
    getAll(baseUrl: string): Observable<T[]> {
        return this.http.get<T[]>(baseUrl);
    }

    get(baseUrl: string, id: ID): Observable<T> {
        return this.http.get<T>(`${baseUrl}/${id}`);
    }

    add(baseUrl: string, item: T): Observable<T> {
        return this.http.post<T>(baseUrl, item);
    }

    update(baseUrl: string, id: ID, item: T): Observable<T> {
        return this.http.put<T>(`${baseUrl}`, item);
    }

    delete(baseUrl: string, id: ID): Observable<void> {
        return this.http.delete<void>(`${baseUrl}/${id}`);
    }
}
