import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Roles } from '../../../../models/database.models';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RolService {
  private urlEndPoint: string = `${environment.apiUrl}/roles`;

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  getRol(id: number) {
    return this.http.get<Roles>(`${this.urlEndPoint}/${id}`);
  }

  getRoles(): Observable<Roles[]> {
    return this.http.get<Roles[]>(this.urlEndPoint).pipe(map((response) => response as Roles[]));
  }
}
