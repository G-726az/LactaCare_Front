import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SistemaService {
  private urlEndPoint: string = `${environment.apiUrl}/sistema`;

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  getSistema(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlEndPoint}/${id}`);
  }

  editSistema(id: number, sistema: any): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${id}`, sistema, { headers: this.httpHeaders });
  }
}
