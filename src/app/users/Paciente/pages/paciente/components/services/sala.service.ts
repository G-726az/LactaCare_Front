import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from './../../../../../../../environments/environment';

export interface SalaLactancia {
  idLactario: number;
  nombreCMedico: string;
  direccionCMedico: string;
  correoCMedico?: string;
  telefonoCMedico: string;
  latitudCMedico?: string;
  longitudCMedico?: string;
  horarioSala?: {
    idHorarioSala: number;
    horaApertura: string;
    horaCierre: string;
    horaInicioDescanso?: string;
    horaFinDescanso?: string;
  };
  diasLaborablesSala?: {
    lunes: boolean;
    martes: boolean;
    miercoles: boolean;
    jueves: boolean;
    viernes: boolean;
    sabado: boolean;
    domingo: boolean;
  };
  institucion?: {
    idInstitucion: number;
    nombreInstitucion: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class SalaService {
  private apiUrl = `${environment.apiUrl}/salas`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Obtener todas las salas
   */
  getAllSalas(): Observable<SalaLactancia[]> {
    console.log('🔄 Solicitando todas las salas:', this.apiUrl);
    
    return this.http.get<ApiResponse<SalaLactancia[]>>(
      this.apiUrl,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Respuesta del servidor:', response);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener salas');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener salas disponibles
   */
  getSalasDisponibles(): Observable<SalaLactancia[]> {
    console.log('🔄 Solicitando salas disponibles');
    
    return this.http.get<ApiResponse<SalaLactancia[]>>(
      `${this.apiUrl}/disponibles`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener salas disponibles');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener sala por ID
   */
  getSalaById(id: number): Observable<SalaLactancia> {
    console.log('🔄 Solicitando sala ID:', id);
    
    return this.http.get<ApiResponse<SalaLactancia>>(
      `${this.apiUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Sala no encontrada');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Buscar salas por ubicación
   */
  buscarSalasPorUbicacion(ubicacion: string): Observable<SalaLactancia[]> {
    console.log('🔍 Buscando salas en ubicación:', ubicacion);
    
    return this.http.get<ApiResponse<SalaLactancia[]>>(
      `${this.apiUrl}/buscar?ubicacion=${encodeURIComponent(ubicacion)}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error en búsqueda');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('❌ Error en SalaService:', error);
    
    let errorMessage = 'Ocurrió un error al conectar con el servidor';
    
    if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor. Verifica que esté corriendo.';
    } else if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
    } else if (error.status === 404) {
      errorMessage = 'No se encontraron salas disponibles.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}