import { Injectable } from '@angular/core';
import { PersonaEmpleado } from '../../../../models/database.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CambioPasswordDTO } from '../../../../models/database.models';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private urlEndPoint: string = `${environment.apiUrl}/empleados`;

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  create(data: Partial<PersonaEmpleado>): Observable<PersonaEmpleado> {
    return this.http.post<PersonaEmpleado>(this.urlEndPoint, data, {
      headers: this.httpHeaders,
    });
  }

  getEmpleado(id: number): Observable<PersonaEmpleado> {
    return this.http.get<PersonaEmpleado>(`${this.urlEndPoint}/${id}`);
  }

  editPassword(idEmpleado: number, data: CambioPasswordDTO): Observable<void> {
    return this.http.put<void>(`${this.urlEndPoint}/${idEmpleado}/cambiar-password`, data, {
      headers: this.httpHeaders,
    });
  }

  editEmpleado(id: number, data: Partial<PersonaEmpleado>): Observable<PersonaEmpleado> {
    return this.http.put<PersonaEmpleado>(`${this.urlEndPoint}/${id}`, data, {
      headers: this.httpHeaders,
    });
  }

  actualizarPerfilConImagen(perfilData: any, imagen?: File): Observable<void> {
    const formData = new FormData();

    formData.append('perfil', new Blob([JSON.stringify(perfilData)], { type: 'application/json' }));

    if (imagen) {
      formData.append('imagen', imagen);
    }

    return this.http.put<void>('http://localhost:8080/api/admin/perfil', formData);
  }

  getEmpleados(): Observable<PersonaEmpleado[]> {
    return this.http.get(this.urlEndPoint).pipe(map((response) => response as PersonaEmpleado[]));
  }

  getEmpleadosPorRol(idRol: number): Observable<PersonaEmpleado[]> {
    return this.http
      .get(`${this.urlEndPoint}/rol/${idRol}`)
      .pipe(map((response) => response as PersonaEmpleado[]));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlEndPoint}/${id}`);
  }

  editImagen(id: number, data: Partial<PersonaEmpleado>): Observable<PersonaEmpleado> {
    return this.http.put<PersonaEmpleado>(`${this.urlEndPoint}/${id}/cambiar-imagen`, data, {
      headers: this.httpHeaders,
    });
  }

  editLactario(id: number, data: Partial<PersonaEmpleado>): Observable<PersonaEmpleado> {
    return this.http.put<PersonaEmpleado>(`${this.urlEndPoint}/${id}/cambiar-lactario`, data, {
      headers: this.httpHeaders,
    });
  }

  switchEstado(id: number): Observable<PersonaEmpleado> {
    return this.http.put<PersonaEmpleado>(`${this.urlEndPoint}/${id}/cambiar-estado`, {
      headers: this.httpHeaders,
    });
  }
}
