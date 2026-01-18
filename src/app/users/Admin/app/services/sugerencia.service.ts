import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Sugerencia } from '../../../../models/database.models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SugerenciaService {
  private urlEndPoint = `${environment.apiUrl}/sugerencias`;
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  getAll(): Observable<Sugerencia[]> {
    return this.http.get(this.urlEndPoint).pipe(map((response) => response as Sugerencia[]));
  }

  create(data: Partial<Sugerencia>): Observable<Sugerencia> {
    return this.http.post<Sugerencia>(this.urlEndPoint, data, {
      headers: this.httpHeaders,
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlEndPoint}/${id}`);
  }

  update(data: Partial<Sugerencia>, id: number): Observable<Sugerencia> {
    return this.http.put<Sugerencia>(`${this.urlEndPoint}/${id}`, data);
  }

  switchEstado(id: number): Observable<Sugerencia> {
    return this.http.put<Sugerencia>(`${this.urlEndPoint}/${id}/cambiar-estado`, {
      headers: this.httpHeaders,
    });
  }
}
