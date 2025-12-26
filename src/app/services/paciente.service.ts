// paciente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
// Asegúrate de que esta ruta sea correcta en tu proyecto
import { environment } from '../../environments/environment';

export interface PacienteData {
  id: number;
  cedula: string;
  imagenPerfil?: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  discapacidad: boolean;
  nombreCompleto?: string;
}

export interface PacienteResponse {
  success: boolean;
  message: string;
  data: PacienteData;
}

export interface ActualizarPacienteRequest {
  cedula: string;
  imagenPerfil?: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string;
  discapacidad: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  // Si environment da error, puedes usar directo: 'http://localhost:8080/api'
  private apiUrl = environment.apiUrl || 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ==============================================================
  // 🔑 AQUÍ ESTÁ LA CORRECCIÓN CLAVE: AGREGAR EL TOKEN
  // ==============================================================
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // Buscamos el token en localStorage
    const usuarioJson = localStorage.getItem('lactaCareUser');
    if (usuarioJson) {
      try {
        const usuarioObj = JSON.parse(usuarioJson);
        // Intentamos obtener el token con los nombres más comunes
        const token = usuarioObj.token || usuarioObj.access_token;

        if (token) {
          // Lo agregamos a la cabecera Authorization
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (e) {
        console.error('Error al leer token para cabeceras', e);
      }
    }

    return headers;
  }
  // ==============================================================

  getPacienteById(id: number): Observable<PacienteResponse> {
    console.log('🔍 GET Paciente:', `${this.apiUrl}/pacientes/${id}`);

    return this.http
      .get<any>(`${this.apiUrl}/pacientes/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((paciente) => {
          console.log('✅ Paciente obtenido del backend:', paciente);
          const data = this.transformarPaciente(paciente);
          return {
            success: true,
            message: 'Paciente encontrado',
            data: data,
          };
        }),
        catchError((error) => {
          console.error('❌ Error obteniendo paciente:', error);
          return throwError(() => error);
        })
      );
  }

  actualizarPaciente(
    id: number,
    datosActualizados: ActualizarPacienteRequest
  ): Observable<PacienteResponse> {
    const url = `${this.apiUrl}/pacientes/${id}`;
    console.log('📤 PUT Paciente URL:', url);

    const payload = {
      ...datosActualizados,
      segundoNombre: datosActualizados.segundoNombre || null,
      segundoApellido: datosActualizados.segundoApellido || null,
      imagenPerfil: datosActualizados.imagenPerfil || null,
    };

    return this.http
      .put<any>(url, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((paciente) => {
          console.log('✅ Respuesta del servidor:', paciente);
          const data = this.transformarPaciente(paciente);

          // Actualizar localStorage
          this.actualizarLocalStorage(data);

          return {
            success: true,
            message: 'Paciente actualizado exitosamente',
            data: data,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error actualizando:', error);
          return throwError(() => ({
            success: false,
            message: error.error?.message || 'Error al actualizar el paciente',
            error: error,
          }));
        })
      );
  }

  private actualizarLocalStorage(data: PacienteData) {
    // Actualizar lactaCareUser
    const lactaCareUser = localStorage.getItem('lactaCareUser');
    if (lactaCareUser) {
      try {
        const user = JSON.parse(lactaCareUser);
        const updatedUser = {
          ...user,
          primer_nombre: data.primerNombre,
          segundo_nombre: data.segundoNombre,
          primer_apellido: data.primerApellido,
          segundo_apellido: data.segundoApellido,
          correo: data.correo,
          telefono: data.telefono,
          nombre_completo: data.nombreCompleto,
          perfil_img: data.imagenPerfil,
        };
        localStorage.setItem('lactaCareUser', JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Error actualizando localStorage', e);
      }
    }
  }

  private transformarPaciente(paciente: any): PacienteData {
    const segundoNombre = paciente.segundoNombre || '';
    const segundoApellido = paciente.segundoApellido || '';

    const nombreCompleto = `${paciente.primerNombre || ''} ${segundoNombre} ${
      paciente.primerApellido || ''
    } ${segundoApellido}`
      .replace(/\s+/g, ' ')
      .trim();

    return {
      id: paciente.id,
      cedula: paciente.cedula,
      imagenPerfil: paciente.imagenPerfil || null,
      primerNombre: paciente.primerNombre,
      segundoNombre: segundoNombre || null,
      primerApellido: paciente.primerApellido,
      segundoApellido: segundoApellido || null,
      correo: paciente.correo,
      telefono: paciente.telefono,
      fechaNacimiento: this.convertirFecha(paciente.fechaNacimiento),
      discapacidad: paciente.discapacidad || false,
      nombreCompleto: nombreCompleto,
    };
  }

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
