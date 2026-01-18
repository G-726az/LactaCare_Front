import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Refrigerador } from '../../../../models/database.models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefrigeradorService {
  private urlEndPoint: string = `${environment.apiUrl}/refrigeradores`;
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  create(data: Partial<Refrigerador>) {
    return this.http.post<Refrigerador>(this.urlEndPoint, data, {
      headers: this.httpHeaders,
    });
  }

  getAll() {
    return this.http.get(this.urlEndPoint).pipe(map((response) => response as Refrigerador[]));
  }

  getBySalaId(idSala: number) {
    console.log(`${this.urlEndPoint}/sala/${idSala}`);
    return this.http
      .get(`${this.urlEndPoint}/sala/${idSala}`)
      .pipe(map((response) => response as Refrigerador[]));
  }

  update(data: Partial<any>, id: number): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlEndPoint}/${id}`);
  }
}
