// reserva.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../../../../../../environments/environment';

export interface Reserva {
  id?: number;
  idPersonaPaciente: number;
  idSala: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
}

export interface SalaLactancia {
  idLactario: number;
  nombreCMedico: string;
  direccionCMedico: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  getReservasByPaciente(idPaciente: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/paciente/${idPaciente}`, {
      headers: this.getHeaders(),
    });
  }

  getSalasDisponibles(): Observable<SalaLactancia[]> {
    return this.http.get<SalaLactancia[]>(`${this.apiUrl}/salas`, {
      headers: this.getHeaders(),
    });
  }

  crearReserva(reserva: Reserva): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, reserva, {
      headers: this.getHeaders(),
    });
  }

  confirmarReserva(idReserva: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${idReserva}/confirmar`, {}, {
      headers: this.getHeaders(),
    });
  }

  cancelarReserva(idReserva: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reservas/${idReserva}/cancelar`, {}, {
      headers: this.getHeaders(),
    });
  }

  eliminarReserva(idReserva: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/${idReserva}`, {
      headers: this.getHeaders(),
    });
  }
}