import { Injectable } from '@angular/core';
import { Institucion } from '../../../../models/database.models';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InstitucionService {
  private urlEndPoint: string = `${environment.apiUrl}/instituciones`;
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  getInstituciones(): Observable<Institucion[]> {
    return this.http.get(this.urlEndPoint).pipe(map((response) => response as Institucion[]));
  }

  create(data: Partial<Institucion>): Observable<Institucion> {
    return this.http.post<Institucion>(this.urlEndPoint, data, {
      headers: this.httpHeaders,
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlEndPoint}/${id}`);
  }

  update(data: Partial<Institucion>, id: number): Observable<Institucion> {
    return this.http.put<Institucion>(`${this.urlEndPoint}/${id}`, data);
  }
}
