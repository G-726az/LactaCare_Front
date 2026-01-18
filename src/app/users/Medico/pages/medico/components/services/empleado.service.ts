// empleado.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environment';

export interface EmpleadoData {
  id: number;
  cedula: string;
  perfilEmpleadoImg?: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  rol?: {
    idRol: number;
    nombreRol: string;
  };
  salaLactanciaId?: number;
  horarioEmpleadoId?: number;
  diasLaborablesEmpleadoId?: number;
  nombreCompleto?: string;
}

export interface EmpleadoResponse {
  success: boolean;
  message: string;
  data: EmpleadoData;
}

export interface ActualizarEmpleadoRequest {
  perfilEmpleadoImg?: string;
  cedula: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  rolId?: number;
  salaLactanciaId?: number;
  horarioEmpleadoId?: number;
  diasLaborablesEmpleadoId?: number;
  password?: string;
}

export interface CambioPasswordRequest {
  passwordActual: string;
  passwordNueva: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  /**
   * Obtener empleado por ID
   */
  getEmpleadoById(id: number): Observable<EmpleadoResponse> {
    console.log('🔍 GET Empleado:', `${this.apiUrl}/empleados/${id}`);

    return this.http
      .get<any>(`${this.apiUrl}/empleados/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((empleado) => {
          console.log('✅ Empleado obtenido del backend:', empleado);
          const data = this.transformarEmpleado(empleado);
          return {
            success: true,
            message: 'Empleado encontrado',
            data: data,
          };
        }),
        catchError((error) => {
          console.error('❌ Error obteniendo empleado:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener empleado por cédula
   */
  getEmpleadoByCedula(cedula: string): Observable<EmpleadoResponse> {
    console.log('🔍 GET Empleado por cédula:', cedula);

    return this.http
      .get<any>(`${this.apiUrl}/empleados/cedula/${cedula}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((empleado) => {
          const data = this.transformarEmpleado(empleado);
          return {
            success: true,
            message: 'Empleado encontrado',
            data: data,
          };
        }),
        catchError((error) => {
          console.error('❌ Error obteniendo empleado por cédula:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener empleado por correo
   */
  getEmpleadoByCorreo(correo: string): Observable<EmpleadoResponse> {
    console.log('🔍 GET Empleado por correo:', correo);

    return this.http
      .get<any>(`${this.apiUrl}/empleados/correo/${correo}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((empleado) => {
          const data = this.transformarEmpleado(empleado);
          return {
            success: true,
            message: 'Empleado encontrado',
            data: data,
          };
        }),
        catchError((error) => {
          console.error('❌ Error obteniendo empleado por correo:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener todos los empleados
   */
  getAllEmpleados(): Observable<EmpleadoData[]> {
    console.log('🔍 GET Todos los empleados');

    return this.http
      .get<any[]>(`${this.apiUrl}/empleados`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((empleados) => {
          console.log('✅ Empleados obtenidos:', empleados.length);
          return empleados.map((e) => this.transformarEmpleado(e));
        }),
        catchError((error) => {
          console.error('❌ Error obteniendo empleados:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener empleados por rol
   */
  getEmpleadosByRol(idRol: number): Observable<EmpleadoData[]> {
    console.log('🔍 GET Empleados por rol:', idRol);

    return this.http
      .get<any[]>(`${this.apiUrl}/empleados/rol/${idRol}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((empleados) => {
          return empleados.map((e) => this.transformarEmpleado(e));
        }),
        catchError((error) => {
          console.error('❌ Error obteniendo empleados por rol:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualizar empleado
   */
  actualizarEmpleado(
    id: number,
    datosActualizados: ActualizarEmpleadoRequest
  ): Observable<EmpleadoResponse> {
    const url = `${this.apiUrl}/empleados/${id}`;
    console.log('📤 PUT Empleado URL:', url);
    console.log('📤 Datos a enviar:', datosActualizados);

    const payload = {
      ...datosActualizados,
      segundoNombre: datosActualizados.segundoNombre || null,
      segundoApellido: datosActualizados.segundoApellido || null,
      perfilEmpleadoImg: datosActualizados.perfilEmpleadoImg || null,
    };

    console.log('📦 Payload final:', payload);

    return this.http
      .put<any>(url, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((empleado) => {
          console.log('✅ Respuesta del servidor:', empleado);

          const data = this.transformarEmpleado(empleado);

          // Actualizar localStorage
          const currentUserData = JSON.parse(localStorage.getItem('medicoData') || '{}');
          const updatedData = { ...currentUserData, ...data };
          localStorage.setItem('medicoData', JSON.stringify(updatedData));

          // También actualizar lactaCareUser si existe
          const lactaCareUser = localStorage.getItem('lactaCareUser');
          if (lactaCareUser) {
            const user = JSON.parse(lactaCareUser);
            localStorage.setItem(
              'lactaCareUser',
              JSON.stringify({
                ...user,
                primer_nombre: data.primerNombre,
                segundo_nombre: data.segundoNombre,
                primer_apellido: data.primerApellido,
                segundo_apellido: data.segundoApellido,
                correo: data.correo,
                telefono: data.telefono,
                nombre_completo: data.nombreCompleto,
                perfil_img: data.perfilEmpleadoImg,
              })
            );
          }

          return {
            success: true,
            message: 'Empleado actualizado exitosamente',
            data: data,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error completo:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Error body:', error.error);

          let errorMessage = 'Error al actualizar el empleado';

          if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos. Verifica los campos.';
          } else if (error.status === 404) {
            errorMessage = 'Empleado no encontrado.';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => ({
            success: false,
            message: errorMessage,
            error: error,
          }));
        })
      );
  }

  /**
   * Cambiar contraseña
   */
  cambiarPassword(id: number, passwordData: CambioPasswordRequest): Observable<any> {
    const url = `${this.apiUrl}/empleados/${id}/cambiar-password`;
    console.log('🔐 Cambiar contraseña:', url);

    return this.http
      .put(url, passwordData, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          console.log('✅ Contraseña cambiada exitosamente');
          return {
            success: true,
            message: 'Contraseña actualizada exitosamente',
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error cambiando contraseña:', error);

          let errorMessage = 'Error al cambiar contraseña';

          if (error.status === 400) {
            errorMessage = error.error || 'La contraseña actual es incorrecta';
          } else if (error.error) {
            errorMessage = error.error;
          }

          return throwError(() => ({
            success: false,
            message: errorMessage,
          }));
        })
      );
  }

  /**
   * Transformar datos del empleado del backend al formato del frontend
   */
  private transformarEmpleado(empleado: any): EmpleadoData {
    const segundoNombre = empleado.segundoNombre || '';
    const segundoApellido = empleado.segundoApellido || '';

    const nombreCompleto = `${empleado.primerNombre || ''} ${segundoNombre} ${
      empleado.primerApellido || ''
    } ${segundoApellido}`
      .replace(/\s+/g, ' ')
      .trim();

    return {
      id: empleado.idPerEmpleado,
      cedula: empleado.cedula,
      perfilEmpleadoImg: empleado.perfilEmpleadoImg || null,
      primerNombre: empleado.primerNombre,
      segundoNombre: segundoNombre || null,
      primerApellido: empleado.primerApellido,
      segundoApellido: segundoApellido || null,
      correo: empleado.correo,
      telefono: empleado.telefono,
      fechaNacimiento: this.convertirFecha(empleado.fechaNacimiento),
      rol: empleado.rol
        ? {
            idRol: empleado.rol.idRol,
            nombreRol: empleado.rol.nombreRol,
          }
        : undefined,
      salaLactanciaId: empleado.salaLactanciaId,
      horarioEmpleadoId: empleado.horarioEmpleadoId,
      diasLaborablesEmpleadoId: empleado.diasLaborablesEmpleadoId,
      nombreCompleto: nombreCompleto,
    };
  }

  /**
   * Convertir fecha del formato del backend al formato ISO string
   */
  private convertirFecha(fecha: any): string {
    if (!fecha) return '';

    if (Array.isArray(fecha)) {
      const [year, month, day] = fecha;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    if (typeof fecha === 'string') {
      return fecha.split('T')[0];
    }

    return '';
  }
}
