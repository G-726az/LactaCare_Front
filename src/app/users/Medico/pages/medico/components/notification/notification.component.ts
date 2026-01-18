import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification, NotificacionRetiro } from '../services/notification.service';
import { Subscription } from 'rxjs';
import { AuthService } from './../../../../../../services/auth.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  
  /* ===============================
     NOTIFICACIONES TOAST
     =============================== */
  notifications: (Notification & { id: number })[] = [];
  private notificationSubscription!: Subscription;
  private notificationId = 0;

  /* ===============================
     PANEL DE NOTIFICACIONES MÉDICO
     =============================== */
  notificacionesRetiro: NotificacionRetiro[] = [];
  notificacionesFiltradas: NotificacionRetiro[] = [];
  mostrarPanelMedico = false;
  filtroActivo: 'todas' | 'por-retirar' | 'retirados' = 'todas';
  esMedico = false;
  
  private retiroSubscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Verificar si el usuario es médico
    const currentUser = this.authService.currentUserValue;
    this.esMedico = currentUser?.rol === 'MEDICO' || currentUser?.tipo === 'medico'; // Ajusta según tu modelo

    // Suscripción a notificaciones toast
    this.notificationSubscription = this.notificationService.notification$.subscribe(
      (notification: Notification) => {
        const id = this.notificationId++;
        const newNotification = { ...notification, id };
        this.notifications.push(newNotification);

        setTimeout(() => {
          this.removeNotification(id);
        }, notification.duration || 3000);
      }
    );

    // Si es médico, suscribirse a notificaciones de retiro
    if (this.esMedico) {
      this.cargarNotificacionesRetiro();

      this.retiroSubscription = this.notificationService.notificacionesRetiro$.subscribe({
        next: (notificacion) => {
          console.log('📬 Nueva notificación de retiro recibida:', notificacion);
          this.cargarNotificacionesRetiro();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.retiroSubscription) {
      this.retiroSubscription.unsubscribe();
    }
  }

  /* ===============================
     NOTIFICACIONES TOAST
     =============================== */
  removeNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getIcon(type: string): string {
    const icons: {[key: string]: string} = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }

  /* ===============================
     PANEL DE NOTIFICACIONES MÉDICO
     =============================== */
  cargarNotificacionesRetiro(): void {
    this.notificacionesRetiro = this.notificationService.getNotificacionesRetiro();
    this.aplicarFiltro(this.filtroActivo);
  }

  aplicarFiltro(filtro: 'todas' | 'por-retirar' | 'retirados'): void {
    this.filtroActivo = filtro;

    switch (filtro) {
      case 'por-retirar':
        this.notificacionesFiltradas = this.notificacionesRetiro.filter(
          n => n.tipo === 'POR_RETIRAR'
        );
        break;
      
      case 'retirados':
        this.notificacionesFiltradas = this.notificacionesRetiro.filter(
          n => n.tipo === 'RETIRADO'
        );
        break;
      
      default: // 'todas'
        this.notificacionesFiltradas = this.notificacionesRetiro;
    }
  }

  togglePanelMedico(): void {
    this.mostrarPanelMedico = !this.mostrarPanelMedico;
    
    if (this.mostrarPanelMedico) {
      this.cargarNotificacionesRetiro();
    }
  }

  cerrarPanelMedico(): void {
    this.mostrarPanelMedico = false;
  }

  marcarComoLeida(notificacion: NotificacionRetiro): void {
    if (notificacion.id) {
      this.notificationService.marcarComoLeida(notificacion.id);
      this.cargarNotificacionesRetiro();
    }
  }

  marcarTodasComoLeidas(): void {
    this.notificationService.marcarTodasComoLeidas();
    this.cargarNotificacionesRetiro();
  }

  eliminarNotificacionRetiro(notificacion: NotificacionRetiro, event: Event): void {
    event.stopPropagation();
    
    if (notificacion.id) {
      this.notificationService.eliminarNotificacion(notificacion.id);
      this.cargarNotificacionesRetiro();
    }
  }

  limpiarLeidas(): void {
    this.notificationService.limpiarLeidas();
    this.cargarNotificacionesRetiro();
  }

  /* ===============================
     GETTERS
     =============================== */
  get contadorNoLeidas(): number {
    return this.notificationService.getContadorNoLeidas();
  }

  get hayNotificacionesRetiro(): boolean {
    return this.notificacionesRetiro.length > 0;
  }

  get notificacionesPorRetirar(): number {
    return this.notificacionesRetiro.filter(n => n.tipo === 'POR_RETIRAR').length;
  }

  get notificacionesRetirados(): number {
    return this.notificacionesRetiro.filter(n => n.tipo === 'RETIRADO').length;
  }

  /* ===============================
     UTILIDADES
     =============================== */
  getTipoIcono(tipo: string): string {
    return tipo === 'POR_RETIRAR' ? '⏳' : '📦';
  }

  getTipoTexto(tipo: string): string {
    return tipo === 'POR_RETIRAR' ? 'Por Retirar' : 'Retirado';
  }

  getTipoClase(tipo: string): string {
    return tipo === 'POR_RETIRAR' ? 'por-retirar' : 'retirado';
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - new Date(fecha).getTime();
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor(diferencia / (1000 * 60));

    if (minutos < 1) {
      return 'Hace un momento';
    } else if (minutos < 60) {
      return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    } else {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}