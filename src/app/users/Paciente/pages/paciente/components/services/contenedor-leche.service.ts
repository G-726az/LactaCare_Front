import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environment';

/* ===============================
   MODELOS
   =============================== */
export interface ContenedorLeche {
  id?: number;
  fechaHoraExtraccion: string;
  fechaHoraCaducidad: string;
  estado: 'Refrigerada' | 'Congelada' | 'PorRetirar' | 'Retirada' | 'Caducada';
  cantidadMililitros: number;
}

export interface CrearContenedorRequest {
  cantidadMililitros: number;
  fechaHoraExtraccion: string;
  estado: 'Refrigerada' | 'Congelada';
  idPaciente: number;
}

/* ===============================
   SERVICE
   =============================== */
@Injectable({
  providedIn: 'root'
})
export class ContenedorService {

  private apiUrl = `${environment.apiUrl}/contenedoresleche`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  /* ===============================
     🔥 OBTENER CONTENEDORES POR PACIENTE
     =============================== */
  getContenedoresByPaciente(idPaciente: number): Observable<ContenedorLeche[]> {
    console.log('🔍 Obteniendo todos los contenedores y filtrando para paciente:', idPaciente);

    return this.http.get<ContenedorLeche[]>(
      this.apiUrl,
      { headers: this.getHeaders() }
    ).pipe(
      map(contenedores => {
        console.log('📦 Contenedores totales recibidos:', contenedores.length);

        // Convertir cantidadMililitros a número si viene como string
        return contenedores.map(c => ({
          ...c,
          cantidadMililitros: Number(c.cantidadMililitros) || 0
        }));
      }),
      catchError(error => {
        console.error('❌ Error obteniendo contenedores:', error);
        return this.handleError(error);
      })
    );
  }

  /* ===============================
     CREAR CONTENEDOR / EXTRACCIÓN
     =============================== */
  crearContenedor(request: CrearContenedorRequest): Observable<ContenedorLeche> {
    console.log('📤 Creando contenedor:', request);

    // Calcular fecha de caducidad
    const fechaExtraccion = new Date(request.fechaHoraExtraccion);
    const fechaCaducidad = new Date(fechaExtraccion);

    if (request.estado === 'Refrigerada') {
      // Leche refrigerada: 5 días
      fechaCaducidad.setDate(fechaCaducidad.getDate() + 5);
    } else {
      // Leche congelada: 6 meses
      fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 6);
    }

    const payload = {
      cantidadMililitros: request.cantidadMililitros,
      fechaHoraExtraccion: request.fechaHoraExtraccion,
      fechaHoraCaducidad: fechaCaducidad.toISOString(),
      estado: request.estado,
      atencion: null 
    };

    console.log('📦 Payload a enviar:', payload);

    return this.http.post<ContenedorLeche>(this.apiUrl, payload, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Contenedor creado:', response);
        return {
          ...response,
          cantidadMililitros: Number(response.cantidadMililitros) || 0
        };
      }),
      catchError(this.handleError)
    );
  }

  /* ===============================
     ACTUALIZAR CONTENEDOR COMPLETO
     =============================== */
  actualizarContenedor(
    id: number,
    contenedor: Partial<ContenedorLeche>
  ): Observable<ContenedorLeche> {
    console.log('🔄 Actualizando contenedor:', id, contenedor);

    return this.http.put<ContenedorLeche>(
      `${this.apiUrl}/${id}`,
      contenedor,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Contenedor actualizado:', response);
        return {
          ...response,
          cantidadMililitros: Number(response.cantidadMililitros) || 0
        };
      }),
      catchError(this.handleError)
    );
  }

  /* ===============================
     ACTUALIZAR SOLO EL ESTADO
     =============================== */
  actualizarEstado(
    id: number,
    nuevoEstado: 'Refrigerada' | 'Congelada' | 'PorRetirar' | 'Retirada' | 'Caducada'
  ): Observable<ContenedorLeche> {
    console.log('🔄 Actualizando estado del contenedor:', id, 'a', nuevoEstado);

    return this.http.get<ContenedorLeche>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      switchMap(contenedorActual => {
        const contenedorActualizado = { 
          ...contenedorActual, 
          estado: nuevoEstado 
        };
        
        return this.http.put<ContenedorLeche>(
          `${this.apiUrl}/${id}`,
          contenedorActualizado,
          { headers: this.getHeaders() }
        );
      }),
      map(response => {
        console.log('✅ Estado actualizado:', response);
        return {
          ...response,
          cantidadMililitros: Number(response.cantidadMililitros) || 0
        };
      }),
      catchError(this.handleError)
    );
  }

  /* ===============================
     OBTENER CONTENEDOR POR ID
     =============================== */
  getContenedorById(id: number): Observable<ContenedorLeche> {
    console.log('🔍 Obteniendo contenedor:', id);

    return this.http.get<ContenedorLeche>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        console.log('✅ Contenedor obtenido:', response);
        return {
          ...response,
          cantidadMililitros: Number(response.cantidadMililitros) || 0
        };
      }),
      catchError(this.handleError)
    );
  }

  /* ===============================
     ELIMINAR CONTENEDOR
     =============================== */
  eliminarContenedor(id: number): Observable<void> {
    console.log('🗑️ Eliminando contenedor:', id);

    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(() => {
        console.log('✅ Contenedor eliminado');
      }),
      catchError(this.handleError)
    );
  }

  /* ===============================
     OBTENER TODOS LOS CONTENEDORES
     (Para uso administrativo)
     =============================== */
  getAllContenedores(): Observable<ContenedorLeche[]> {
    console.log('🔍 Obteniendo todos los contenedores');

    return this.http.get<ContenedorLeche[]>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(
      map(contenedores => {
        console.log('✅ Contenedores obtenidos:', contenedores.length);
        return contenedores.map(c => ({
          ...c,
          cantidadMililitros: Number(c.cantidadMililitros) || 0
        }));
      }),
      catchError(this.handleError)
    );
  }

  /* ===============================
     MANEJO DE ERRORES
     =============================== */
  private handleError(error: any): Observable<never> {
    console.error('❌ Error en ContenedorService:', error);

    let errorMessage = 'Ocurrió un error en el servidor';

    if (error.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Por favor inicia sesión nuevamente';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Contenedor no encontrado';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}