import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HorariosEmpleado } from '../../../../models/database.models';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HorarioEmpleadoService {
  private urlEndPoint: string = `${environment.apiUrl}/horarios-empleado`;

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  create(data: Partial<HorariosEmpleado>): Observable<HorariosEmpleado> {
    return this.http.post<HorariosEmpleado>(this.urlEndPoint, data, {
      headers: this.httpHeaders,
    });
  }

  getHorario(id: number) {
    return this.http.get<HorariosEmpleado>(`${this.urlEndPoint}/${id}`);
  }

  editHorario(id: number, horario: any) {
    return this.http.put<HorariosEmpleado>(`${this.urlEndPoint}/${id}`, horario, {
      headers: this.httpHeaders,
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlEndPoint}/${id}`);
  }
}
