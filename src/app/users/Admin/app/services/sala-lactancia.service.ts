import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SalaLactancia, SalaLactanciaDTO } from '../../../../models/database.models';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SalaLactanciaService {
  private apiUrl = `${environment.apiUrl}/lactarios`;
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  // Obtener todas las salas
  getAll(): Observable<SalaLactancia[]> {
    return this.http.get<SalaLactancia[]>(this.apiUrl).pipe(
      catchError((e) => {
        console.error('Error al obtener salas:', e);
        return throwError(() => e);
      })
    );
  }

  // Obtener solo activas
  getAllActive(): Observable<SalaLactancia[]> {
    return this.http.get<SalaLactancia[]>(`${this.apiUrl}/activos`).pipe(
      catchError((e) => {
        console.error('Error al obtener salas activas:', e);
        return throwError(() => e);
      })
    );
  }

  // Obtener por ID
  getById(id: number): Observable<SalaLactancia> {
    return this.http.get<SalaLactancia>(`${this.apiUrl}/${id}`).pipe(
      catchError((e) => {
        console.error(`Error al obtener sala ${id}:`, e);
        return throwError(() => e);
      })
    );
  }

  // Crear sala sin cubículos
  create(sala: SalaLactancia): Observable<SalaLactancia> {
    return this.http.post<SalaLactancia>(this.apiUrl, sala, { headers: this.httpHeaders }).pipe(
      catchError((e) => {
        console.error('Error al crear sala:', e);
        return throwError(() => e);
      })
    );
  }

  // Crear sala con cubículos
  createConCubiculos(dto: SalaLactanciaDTO): Observable<SalaLactancia> {
    return this.http
      .post<SalaLactancia>(`${this.apiUrl}/con-cubiculos`, dto, { headers: this.httpHeaders })
      .pipe(
        catchError((e) => {
          console.error('Error al crear sala con cubículos:', e);
          return throwError(() => e);
        })
      );
  }

  // Actualizar sala
  update(id: number, sala: SalaLactancia): Observable<SalaLactancia> {
    return this.http
      .put<SalaLactancia>(`${this.apiUrl}/${id}`, sala, { headers: this.httpHeaders })
      .pipe(
        catchError((e) => {
          console.error(`Error al actualizar sala ${id}:`, e);
          return throwError(() => e);
        })
      );
  }

  // Eliminar físicamente
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((e) => {
        console.error(`Error al eliminar sala ${id}:`, e);
        return throwError(() => e);
      })
    );
  }

  // Desactivar (borrado lógico)
  desactivar(id: number): Observable<void> {
    return this.http
      .patch<void>(`${this.apiUrl}/${id}/desactivar`, {}, { headers: this.httpHeaders })
      .pipe(
        catchError((e) => {
          console.error(`Error al desactivar sala ${id}:`, e);
          return throwError(() => e);
        })
      );
  }

  // Activar
  activar(id: number): Observable<void> {
    return this.http
      .patch<void>(`${this.apiUrl}/${id}/activar`, {}, { headers: this.httpHeaders })
      .pipe(
        catchError((e) => {
          console.error(`Error al activar sala ${id}:`, e);
          return throwError(() => e);
        })
      );
  }
}
