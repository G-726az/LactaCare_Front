import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DiasLaborablesEmpleado } from '../../../../models/database.models';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DiasLarolablesEmpleadoService {
  private urlEndPoint: string = `${environment.apiUrl}/dias-laborables-empleado`;

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  getDiasLaborables(id: number) {
    return this.http.get<DiasLaborablesEmpleado>(`${this.urlEndPoint}/${id}`);
  }

  editDias(id: number, dias: any) {
    return this.http.put<DiasLaborablesEmpleado>(`${this.urlEndPoint}/${id}`, dias, {
      headers: this.httpHeaders,
    });
  }

  create(data: Partial<DiasLaborablesEmpleado>): Observable<DiasLaborablesEmpleado> {
    return this.http.post<DiasLaborablesEmpleado>(this.urlEndPoint, data, {
      headers: this.httpHeaders,
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlEndPoint}/${id}`);
  }
}
