// paciente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

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
    console.log('📤 Datos a enviar:', datosActualizados);

    // Asegurarse de que fechaNacimiento esté en formato correcto
    const payload = {
      ...datosActualizados,
      segundoNombre: datosActualizados.segundoNombre || null,
      segundoApellido: datosActualizados.segundoApellido || null,
      imagenPerfil: datosActualizados.imagenPerfil || null,
    };

    console.log('📦 Payload final:', payload);

    return this.http
      .put<any>(url, payload, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((paciente) => {
          console.log('✅ Respuesta del servidor:', paciente);

          // 🔥 Transformar la respuesta
          const data = this.transformarPaciente(paciente);

          // Actualizar localStorage
          const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
          const updatedData = { ...currentUserData, ...data };
          localStorage.setItem('userData', JSON.stringify(updatedData));

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
                perfil_img: data.imagenPerfil,
              })
            );
          }

          return {
            success: true,
            message: 'Paciente actualizado exitosamente',
            data: data,
          };
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('❌ Error completo:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Error body:', error.error);
          console.error('❌ Error message:', error.message);

          let errorMessage = 'Error al actualizar el paciente';

          if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos. Verifica los campos.';
          } else if (error.status === 404) {
            errorMessage = 'Paciente no encontrado.';
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

  private transformarPaciente(paciente: any): PacienteData {
    // 🔥 Manejar segundoNombre y segundoApellido correctamente
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
      segundoNombre: segundoNombre || null, // 🔥 Asegurar que se capture
      primerApellido: paciente.primerApellido,
      segundoApellido: segundoApellido || null, // 🔥 Asegurar que se capture
      correo: paciente.correo,
      telefono: paciente.telefono,
      fechaNacimiento: this.convertirFecha(paciente.fechaNacimiento),
      discapacidad: paciente.discapacidad || false,
      nombreCompleto: nombreCompleto,
    };
  }

  private convertirFecha(fecha: any): string {
    if (!fecha) return '';

    // Si es un array [año, mes, día] de LocalDate de Spring Boot
    if (Array.isArray(fecha)) {
      const [year, month, day] = fecha;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Si es una cadena ISO
    if (typeof fecha === 'string') {
      return fecha.split('T')[0];
    }

    return '';
  }

  
}

