import { Injectable } from '@angular/core';
import { Subject, interval } from 'rxjs';

/* ===============================
   MODELOS DE NOTIFICACIONES
   =============================== */
export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface NotificacionRetiro {
  id?: number;
  idContenedor: number;
  cantidadMl: number;
  fechaRetiro: Date;
  idPaciente?: number;
  nombrePaciente?: string;
  cedulaPaciente?: string;
  leida: boolean;
  tipo: 'POR_RETIRAR' | 'RETIRADO';
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /* ===============================
     NOTIFICACIONES TOAST (UI)
     =============================== */
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  /* ===============================
     NOTIFICACIONES DE RETIRO (MÉDICO)
     =============================== */
  private notificacionesRetiroSubject = new Subject<NotificacionRetiro>();
  notificacionesRetiro$ = this.notificacionesRetiroSubject.asObservable();

  private notificacionesCache: NotificacionRetiro[] = [];
  private ultimaActualizacion: Date | null = null;

  constructor() {
    this.cargarNotificacionesLocales();
    this.iniciarPolling();
  }

  /* ===============================
     MÉTODOS DE NOTIFICACIONES TOAST
     =============================== */
  success(message: string, duration: number = 3000) {
    this.show({ type: 'success', message, duration });
  }

  error(message: string, duration: number = 3000) {
    this.show({ type: 'error', message, duration });
  }

  warning(message: string, duration: number = 3000) {
    this.show({ type: 'warning', message, duration });
  }

  info(message: string, duration: number = 3000) {
    this.show({ type: 'info', message, duration });
  }

  private show(notification: Notification) {
    this.notificationSubject.next(notification);
  }

  /* ===============================
     MÉTODOS DE NOTIFICACIONES DE RETIRO
     =============================== */

  /**
   * Registra una nueva notificación de retiro
   */
  registrarRetiro(
    tipo: 'POR_RETIRAR' | 'RETIRADO',
    idContenedor: number,
    cantidadMl: number,
    idPaciente?: number,
    nombrePaciente?: string,
    cedulaPaciente?: string
  ): void {
    const notificacion: NotificacionRetiro = {
      id: Date.now(),
      idContenedor,
      cantidadMl,
      fechaRetiro: new Date(),
      idPaciente,
      nombrePaciente: nombrePaciente || 'Paciente',
      cedulaPaciente: cedulaPaciente || 'N/A',
      leida: false,
      tipo,
    };

    // Agregar a cache
    this.notificacionesCache.unshift(notificacion);

    // Guardar en localStorage
    this.guardarNotificacionesLocales();

    // Emitir notificación
    this.notificacionesRetiroSubject.next(notificacion);

    // Actualizar timestamp
    this.ultimaActualizacion = new Date();

    console.log('📢 Notificación registrada:', notificacion);
  }

  /**
   * Marca una notificación como leída
   */
  marcarComoLeida(idNotificacion: number): void {
    const notif = this.notificacionesCache.find((n) => n.id === idNotificacion);
    if (notif) {
      notif.leida = true;
      this.guardarNotificacionesLocales();
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): void {
    this.notificacionesCache.forEach((n) => (n.leida = true));
    this.guardarNotificacionesLocales();
  }

  /**
   * Obtiene todas las notificaciones de retiro
   */
  getNotificacionesRetiro(): NotificacionRetiro[] {
    return [...this.notificacionesCache];
  }

  /**
   * Obtiene solo las notificaciones no leídas
   */
  getNotificacionesNoLeidas(): NotificacionRetiro[] {
    return this.notificacionesCache.filter((n) => !n.leida);
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  getContadorNoLeidas(): number {
    return this.getNotificacionesNoLeidas().length;
  }

  /**
   * Elimina una notificación
   */
  eliminarNotificacion(idNotificacion: number): void {
    this.notificacionesCache = this.notificacionesCache.filter((n) => n.id !== idNotificacion);
    this.guardarNotificacionesLocales();
  }

  /**
   * Limpia todas las notificaciones leídas
   */
  limpiarLeidas(): void {
    this.notificacionesCache = this.notificacionesCache.filter((n) => !n.leida);
    this.guardarNotificacionesLocales();
  }

  /**
   * Limpia todas las notificaciones (útil al cerrar sesión)
   */
  limpiarTodo(): void {
    this.notificacionesCache = [];
    localStorage.removeItem('notificaciones_retiro');
    localStorage.removeItem('notificaciones_ultima_fecha');
    this.ultimaActualizacion = null;
  }

  /* ===============================
     MÉTODOS PRIVADOS
     =============================== */

  /**
   * Inicia el polling para verificar nuevas notificaciones
   */
  private iniciarPolling(): void {
    // Verificar cada 30 segundos
    interval(30000).subscribe(() => {
      // Por ahora solo cargamos desde localStorage
      // En el futuro se puede agregar llamada al backend
      this.cargarNotificacionesLocales();
    });
  }

  /**
   * Carga notificaciones desde localStorage
   */
  private cargarNotificacionesLocales(): void {
    try {
      const stored = localStorage.getItem('notificaciones_retiro');
      if (stored) {
        const notifs = JSON.parse(stored);
        this.notificacionesCache = notifs.map((n: any) => ({
          ...n,
          fechaRetiro: new Date(n.fechaRetiro),
        }));

        // Obtener última actualización
        const ultimaFecha = localStorage.getItem('notificaciones_ultima_fecha');
        if (ultimaFecha) {
          this.ultimaActualizacion = new Date(ultimaFecha);
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
      this.notificacionesCache = [];
    }
  }

  /**
   * Guarda notificaciones en localStorage
   */
  private guardarNotificacionesLocales(): void {
    try {
      localStorage.setItem('notificaciones_retiro', JSON.stringify(this.notificacionesCache));

      if (this.ultimaActualizacion) {
        localStorage.setItem('notificaciones_ultima_fecha', this.ultimaActualizacion.toISOString());
      }
    } catch (error) {
      console.error('❌ Error al guardar notificaciones:', error);
    }
  }
}
