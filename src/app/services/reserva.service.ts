// reservas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces
export interface Reserva {
  id?: number;
  estado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  personaPaciente?: any;
  sala?: SalaLactancia;
}

export interface SalaLactancia {
  idLactario: number;
  nombreCMedico: string;
  direccionCMedico: string;
  correoCMedico?: string;
  telefonoCMedico?: string;
  horario?: any;
  institucion?: any;
}

export interface ReservaResponse {
  success: boolean;
  message: string;
  data: Reserva | Reserva[];
}

export interface CrearReservaRequest {
  idPersonaPaciente: number;
  idSala: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  getReservasByPaciente(idPaciente: number): Observable<Reserva[]> {
    return this.http
      .get<Reserva[]>(`${this.apiUrl}/reservas`, {
        headers: this.getHeaders(),
      })
      .pipe(
        // CORRECCIÓN: Tipo explícito para el parámetro 'r'
        map((reservas: Reserva[]) =>
          reservas.filter((r: Reserva) => r.personaPaciente?.id === idPaciente)
        )
      );
  }

  crearReserva(request: CrearReservaRequest): Observable<ReservaResponse> {
    const reserva = {
      estado: request.estado || 'Pendiente',
      fecha: request.fecha,
      horaInicio: request.horaInicio,
      horaFin: request.horaFin,
      paciente: { id: request.idPersonaPaciente },
    };

    return this.http.post<ReservaResponse>(`${this.apiUrl}/reservas`, reserva, {
      headers: this.getHeaders(),
    });
  }

  actualizarEstadoReserva(idReserva: number, nuevoEstado: string): Observable<ReservaResponse> {
    return this.http.patch<ReservaResponse>(
      `${this.apiUrl}/reservas/${idReserva}/estado`,
      { estado: nuevoEstado },
      { headers: this.getHeaders() }
    );
  }

  cancelarReserva(idReserva: number): Observable<ReservaResponse> {
    return this.actualizarEstadoReserva(idReserva, 'Cancelada');
  }

  confirmarReserva(idReserva: number): Observable<ReservaResponse> {
    return this.actualizarEstadoReserva(idReserva, 'Confirmada');
  }

  getSalasDisponibles(): Observable<SalaLactancia[]> {
    return this.http.get<SalaLactancia[]>(`${this.apiUrl}/lactarios`, {
      headers: this.getHeaders(),
    });
  }

  verificarDisponibilidad(idSala: number, fecha: string, hora: string): Observable<boolean> {
    return this.http
      .get<{ disponible: boolean }>(`${this.apiUrl}/salas/${idSala}/disponibilidad`, {
        params: { fecha, hora },
        headers: this.getHeaders(),
      })
      .pipe(map((response: { disponible: boolean }) => response.disponible));
  }
}
