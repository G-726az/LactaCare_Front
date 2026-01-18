import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ========== INTERFACES ==========

export interface Atencion {
  id?: number;
  fecha: string; // LocalDate -> 'YYYY-MM-DD'
  hora: string; // LocalTime -> 'HH:mm:ss'
  reserva?: ReservaAtencion;
  contenedoresLeche?: ContenedorLeche[];
  empleado?: EmpleadoAtencion;
  // Campos calculados para la vista
  idReserva?: number;
  nombrePaciente?: string;
  nombreCubiculo?: string;
  totalExtraccion?: number;
}

export interface ReservaAtencion {
  id: number;
  estado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  personaPaciente?: PersonaPacienteReserva;
  cubiculo?: CubiculoReserva;
  salaLactancia?: SalaLactanciaReserva;
}

export interface PersonaPacienteReserva {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  cedula: string;
  correo: string;
  telefono: string;
}

export interface CubiculoReserva {
  idCubiculo: number;
  numeroCubiculo: string;
  estadoCubiculo: string;
}

export interface SalaLactanciaReserva {
  idLactario: number;
  nombreCMedico: string;
}

export interface EmpleadoAtencion {
  idPerEmpleado: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
}

export interface ContenedorLeche {
  id?: number;
  cantidadMililitros: number;
  fechaHoraExtraccion: string; // LocalDateTime -> 'YYYY-MM-DDTHH:mm:ss'
  fechaHoraCaducidad: string; // LocalDateTime -> 'YYYY-MM-DDTHH:mm:ss'
  estado: string;
  // Campos para la vista
  nombrePaciente?: string;
}

export interface Refrigerador {
  idRefrigerador: number;
  pisoRefrigerador: number;
  filaRefrigerador: number;
  columnaRefrigerador: number;
  capacidadMaxRefri: number;
}

export interface UbicacionContenedor {
  idUbicacion?: number;
  contenedor?: { id: number };
  refrigerador?: { idRefrigerador: number };
  pisoRefrigerador: number;
  filaRefrigerador: number;
  columnaRefrigerador: number;
}

export interface CrearAtencionRequest {
  fecha: string;
  hora: string;
  reserva: { id: number };
  empleado: { idPerEmpleado: number };
  contenedoresLeche: ContenedorLecheRequest[];
}

export interface ContenedorLecheRequest {
  cantidadMililitros: number;
  fechaHoraExtraccion: string;
  fechaHoraCaducidad: string;
  estado: string;
}

@Injectable({
  providedIn: 'root',
})
export class AtencionService {
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

  // ========== MÉTODOS DE ATENCIONES ==========

  /**
   * Obtener todas las atenciones
   */
  getAtenciones(): Observable<Atencion[]> {
    if (environment.useMockAuth) {
      return this.getMockAtenciones();
    }

    return this.http
      .get<Atencion[]>(`${this.apiUrl}/atenciones`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((atenciones) => this.procesarAtenciones(atenciones)),
        catchError((error) => {
          console.error('Error al obtener atenciones:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener atención por ID
   */
  getAtencionById(id: number): Observable<Atencion> {
    if (environment.useMockAuth) {
      return this.getMockAtenciones().pipe(
        map((atenciones) => atenciones.find((a) => a.id === id)!)
      );
    }

    return this.http
      .get<Atencion>(`${this.apiUrl}/atenciones/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((atencion) => this.procesarAtencion(atencion)),
        catchError((error) => {
          console.error('Error al obtener atención:', error);
          throw error;
        })
      );
  }

  /**
   * Crear nueva atención
   */
  crearAtencion(request: CrearAtencionRequest): Observable<any> {
    if (environment.useMockAuth) {
      return of({
        success: true,
        message: 'Atención creada exitosamente (MOCK)',
        data: { id: Math.floor(Math.random() * 1000), ...request },
      }).pipe(delay(1000));
    }

    return this.http.post(`${this.apiUrl}/atenciones`, request, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Obtener próximo ID disponible
   */
  getProximoId(): Observable<number> {
    if (environment.useMockAuth) {
      return of(Math.floor(Math.random() * 1000) + 1);
    }

    return this.http
      .get<{ proximoId: number }>(`${this.apiUrl}/atenciones/proximo-id`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => response.proximoId),
        catchError(() => of(1))
      );
  }

  // ========== MÉTODOS DE RESERVAS ==========

  /**
   * Obtener reservas disponibles para atención (estado Confirmada)
   */
  getReservasDisponibles(): Observable<ReservaAtencion[]> {
    if (environment.useMockAuth) {
      return this.getMockReservas();
    }

    return this.http
      .get<ReservaAtencion[]>(`${this.apiUrl}/reservas`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((reservas) =>
          reservas.filter(
            (r) => r.estado.toUpperCase() === 'CONFIRMADA' || r.estado.toUpperCase() === 'ACTIVA'
          )
        ),
        catchError((error) => {
          console.error('Error al obtener reservas:', error);
          return of([]);
        })
      );
  }

  // ========== MÉTODOS DE REFRIGERADORES ==========

  /**
   * Obtener refrigeradores por sala de lactancia
   */
  getRefrigeradoresPorSala(idSala: number): Observable<Refrigerador[]> {
    if (environment.useMockAuth) {
      return this.getMockRefrigeradores(idSala);
    }

    return this.http
      .get<Refrigerador[]>(`${this.apiUrl}/refrigeradores/sala/${idSala}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener refrigeradores:', error);
          return of([]);
        })
      );
  }

  /**
   * Guardar ubicación de contenedor
   */
  guardarUbicacionContenedor(ubicacion: UbicacionContenedor): Observable<any> {
    if (environment.useMockAuth) {
      return of({
        success: true,
        message: 'Ubicación guardada exitosamente (MOCK)',
      }).pipe(delay(500));
    }

    return this.http.post(`${this.apiUrl}/ubicacion-contenedor`, ubicacion, {
      headers: this.getHeaders(),
    });
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Procesar array de atenciones para agregar campos calculados
   */
  private procesarAtenciones(atenciones: Atencion[]): Atencion[] {
    return atenciones.map((atencion) => this.procesarAtencion(atencion));
  }

  /**
   * Procesar una atención para agregar campos calculados
   */
  private procesarAtencion(atencion: Atencion): Atencion {
    const procesada = { ...atencion };

    // Calcular campos derivados
    if (atencion.reserva) {
      procesada.idReserva = atencion.reserva.id;

      if (atencion.reserva.personaPaciente) {
        procesada.nombrePaciente = this.construirNombreCompleto(atencion.reserva.personaPaciente);
      }

      if (atencion.reserva.cubiculo) {
        procesada.nombreCubiculo = `Cubículo ${atencion.reserva.cubiculo.numeroCubiculo}`;
      }
    }

    // Calcular total de extracción
    if (atencion.contenedoresLeche && atencion.contenedoresLeche.length > 0) {
      procesada.totalExtraccion = atencion.contenedoresLeche.reduce(
        (total, contenedor) => total + (contenedor.cantidadMililitros || 0),
        0
      );

      // Agregar nombre del paciente a cada contenedor
      procesada.contenedoresLeche = atencion.contenedoresLeche.map((c) => ({
        ...c,
        nombrePaciente: procesada.nombrePaciente,
      }));
    } else {
      procesada.totalExtraccion = 0;
    }

    return procesada;
  }

  /**
   * Construir nombre completo de una persona
   */
  private construirNombreCompleto(persona: PersonaPacienteReserva): string {
    return [
      persona.primerNombre,
      persona.segundoNombre,
      persona.primerApellido,
      persona.segundoApellido,
    ]
      .filter(Boolean)
      .join(' ');
  }

  // ========== DATOS MOCK ==========

  private getMockAtenciones(): Observable<Atencion[]> {
    const mockData: Atencion[] = [
      {
        id: 1,
        fecha: '2026-01-10',
        hora: '09:30:00',
        idReserva: 1,
        nombrePaciente: 'María Elena González Pérez',
        nombreCubiculo: 'Cubículo 1',
        totalExtraccion: 150.5,
        reserva: {
          id: 1,
          estado: 'CONFIRMADA',
          fecha: '2026-01-10',
          horaInicio: '09:00:00',
          horaFin: '10:00:00',
          personaPaciente: {
            id: 1,
            primerNombre: 'María',
            segundoNombre: 'Elena',
            primerApellido: 'González',
            segundoApellido: 'Pérez',
            cedula: '1234567890',
            correo: 'maria@example.com',
            telefono: '0999999999',
          },
          cubiculo: {
            idCubiculo: 1,
            numeroCubiculo: '1',
            estadoCubiculo: 'DISPONIBLE',
          },
          salaLactancia: {
            idLactario: 1,
            nombreCMedico: 'Centro Médico Principal',
          },
        },
        contenedoresLeche: [
          {
            id: 1,
            cantidadMililitros: 75.5,
            fechaHoraExtraccion: '2026-01-10T09:30:00',
            fechaHoraCaducidad: '2026-01-11T09:30:00',
            estado: 'ALMACENADO',
            nombrePaciente: 'María Elena González Pérez',
          },
          {
            id: 2,
            cantidadMililitros: 75,
            fechaHoraExtraccion: '2026-01-10T09:35:00',
            fechaHoraCaducidad: '2026-01-11T09:35:00',
            estado: 'ALMACENADO',
            nombrePaciente: 'María Elena González Pérez',
          },
        ],
        empleado: {
          idPerEmpleado: 1,
          primerNombre: 'Carlos',
          primerApellido: 'Médico',
        },
      },
      {
        id: 2,
        fecha: '2026-01-09',
        hora: '14:15:00',
        idReserva: 2,
        nombrePaciente: 'Ana Lucía Torres Ramírez',
        nombreCubiculo: 'Cubículo 2',
        totalExtraccion: 120,
        reserva: {
          id: 2,
          estado: 'CONFIRMADA',
          fecha: '2026-01-09',
          horaInicio: '14:00:00',
          horaFin: '15:00:00',
          personaPaciente: {
            id: 2,
            primerNombre: 'Ana',
            segundoNombre: 'Lucía',
            primerApellido: 'Torres',
            segundoApellido: 'Ramírez',
            cedula: '0987654321',
            correo: 'ana@example.com',
            telefono: '0988888888',
          },
          cubiculo: {
            idCubiculo: 2,
            numeroCubiculo: '2',
            estadoCubiculo: 'DISPONIBLE',
          },
          salaLactancia: {
            idLactario: 1,
            nombreCMedico: 'Centro Médico Principal',
          },
        },
        contenedoresLeche: [
          {
            id: 3,
            cantidadMililitros: 120,
            fechaHoraExtraccion: '2026-01-09T14:15:00',
            fechaHoraCaducidad: '2026-01-10T14:15:00',
            estado: 'ALMACENADO',
            nombrePaciente: 'Ana Lucía Torres Ramírez',
          },
        ],
        empleado: {
          idPerEmpleado: 1,
          primerNombre: 'Carlos',
          primerApellido: 'Médico',
        },
      },
    ];

    return of(mockData).pipe(delay(800));
  }

  private getMockReservas(): Observable<ReservaAtencion[]> {
    const mockData: ReservaAtencion[] = [
      {
        id: 3,
        estado: 'CONFIRMADA',
        fecha: '2026-01-11',
        horaInicio: '10:00:00',
        horaFin: '11:00:00',
        personaPaciente: {
          id: 3,
          primerNombre: 'Laura',
          segundoNombre: 'Patricia',
          primerApellido: 'Mendoza',
          segundoApellido: 'Vega',
          cedula: '1122334455',
          correo: 'laura@example.com',
          telefono: '0977777777',
        },
        cubiculo: {
          idCubiculo: 3,
          numeroCubiculo: '3',
          estadoCubiculo: 'RESERVADO',
        },
        salaLactancia: {
          idLactario: 1,
          nombreCMedico: 'Centro Médico Principal',
        },
      },
    ];

    return of(mockData).pipe(delay(500));
  }

  private getMockRefrigeradores(idSala: number): Observable<Refrigerador[]> {
    const mockData: Refrigerador[] = [
      {
        idRefrigerador: 1,
        pisoRefrigerador: 3,
        filaRefrigerador: 5,
        columnaRefrigerador: 4,
        capacidadMaxRefri: 60,
      },
      {
        idRefrigerador: 2,
        pisoRefrigerador: 2,
        filaRefrigerador: 4,
        columnaRefrigerador: 3,
        capacidadMaxRefri: 24,
      },
    ];

    return of(mockData).pipe(delay(300));
  }
}
