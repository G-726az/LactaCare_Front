import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PersonaPacienteDTO } from '../../../../models/database.models';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private urlEndPoint: string = `${environment.apiUrl}/pacientes`;

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  getPacientes(): Observable<PersonaPacienteDTO[]> {
    return this.http
      .get(this.urlEndPoint)
      .pipe(map((response) => response as PersonaPacienteDTO[]));
  }
}
