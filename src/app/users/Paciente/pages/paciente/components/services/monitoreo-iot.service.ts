import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from './../../../../../../../environments/environment';

export interface Refrigerador {
  id: number;
  nombre?: string;
  ubicacion?: string;
  sala_lactancia?: {
    idLactario: number;
    nombreCMedico: string;
  };
}

export interface EstadoRefrigerador {
  idEstRefrigerador: number;
  refrigerador: Refrigerador;
  temperaturaEstRefrigerador: number;
  humedadEstRefrigerador: number;
  horaActividadEstRefrigerador: string;
  fechaActividadEstRefrigerador: string;
}

export interface HistorialRefrigerador {
  fecha: string;
  hora: string;
  temperatura: number;
  humedad: number;
}

export interface RegistrarEstadoRequest {
  temperatura: number;
  humedad: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoreoService {
  private apiUrl = `${environment.apiUrl}/monitoreo`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Obtener estado actual de todos los refrigeradores
   */
  getEstadosRefrigeradores(): Observable<EstadoRefrigerador[]> {
    console.log('🔄 Solicitando estados de refrigeradores');
    
    return this.http.get<ApiResponse<EstadoRefrigerador[]>>(
      `${this.apiUrl}/refrigeradores`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Estados recibidos:', response);
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener estados');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener estado de un refrigerador específico
   */
  getEstadoRefrigerador(idRefrigerador: number): Observable<EstadoRefrigerador> {
    console.log('🔄 Solicitando estado del refrigerador:', idRefrigerador);
    
    return this.http.get<ApiResponse<EstadoRefrigerador>>(
      `${this.apiUrl}/refrigerador/${idRefrigerador}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Estado no encontrado');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener historial de un refrigerador
   */
  getHistorialRefrigerador(
    idRefrigerador: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<EstadoRefrigerador[]> {
    console.log('📊 Obteniendo historial del refrigerador:', idRefrigerador);
    
    let url = `${this.apiUrl}/refrigerador/${idRefrigerador}/historial`;
    
    const params: string[] = [];
    if (fechaInicio) params.push(`fechaInicio=${fechaInicio}`);
    if (fechaFin) params.push(`fechaFin=${fechaFin}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<ApiResponse<EstadoRefrigerador[]>>(
      url,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener historial');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener refrigeradores de una sala específica
   */
  getRefrigeradoresBySala(idSala: number): Observable<EstadoRefrigerador[]> {
    console.log('🔄 Obteniendo refrigeradores de la sala:', idSala);
    
    return this.http.get<ApiResponse<EstadoRefrigerador[]>>(
      `${this.apiUrl}/sala/${idSala}/refrigeradores`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener refrigeradores');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Obtener alertas activas (temperaturas fuera de rango)
   */
  getAlertasActivas(): Observable<EstadoRefrigerador[]> {
    console.log('⚠️ Obteniendo alertas activas');
    
    return this.http.get<ApiResponse<EstadoRefrigerador[]>>(
      `${this.apiUrl}/alertas`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al obtener alertas');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Registrar nuevo estado de refrigerador (para dispositivos IoT)
   */
  registrarEstado(
    idRefrigerador: number,
    datos: RegistrarEstadoRequest
  ): Observable<EstadoRefrigerador> {
    console.log('📝 Registrando estado para refrigerador:', idRefrigerador, datos);
    
    return this.http.post<ApiResponse<EstadoRefrigerador>>(
      `${this.apiUrl}/refrigerador/${idRefrigerador}/estado`,
      datos,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.message || 'Error al registrar estado');
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('❌ Error en MonitoreoService:', error);
    
    let errorMessage = 'Ocurrió un error al conectar con el servidor';
    
    if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor de monitoreo.';
    } else if (error.status === 401) {
      errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
    } else if (error.status === 404) {
      errorMessage = 'Datos de monitoreo no encontrados.';
    } else if (error.status === 400) {
      errorMessage = 'Datos de monitoreo inválidos.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}