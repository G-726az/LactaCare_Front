import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning' | 'question' | 'close';
  title: string;
  message: string;
  duration?: number;
  icon?: string;
  showConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new Subject<Notification>();
  private notificationId = 0;
  
  notifications$ = this.notificationsSubject.asObservable();

  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.notificationsSubject.next({
      id: ++this.notificationId,
      type: 'success',
      title,
      message,
      duration,
      icon: 'fa-check-circle'
    });
  }

  showError(title: string, message: string, duration: number = 5000): void {
    this.notificationsSubject.next({
      id: ++this.notificationId,
      type: 'error',
      title,
      message,
      duration,
      icon: 'fa-times-circle'
    });
  }

  showInfo(title: string, message: string, duration: number = 5000): void {
    this.notificationsSubject.next({
      id: ++this.notificationId,
      type: 'info',
      title,
      message,
      duration,
      icon: 'fa-info-circle'
    });
  }

  showWarning(title: string, message: string, duration: number = 5000): void {
    this.notificationsSubject.next({
      id: ++this.notificationId,
      type: 'warning',
      title,
      message,
      duration,
      icon: 'fa-exclamation-triangle'
    });
  }

  showQuestion(
    title: string, 
    message: string, 
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar',
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    this.notificationsSubject.next({
      id: ++this.notificationId,
      type: 'question',
      title,
      message,
      duration: 0, // No se cierra automáticamente
      icon: 'fa-question-circle',
      showConfirm: true,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
  }

  showWelcome(usuario: any): void {
    this.notificationsSubject.next({
      id: ++this.notificationId,
      type: 'info',
      title: `¡Bienvenido/a, ${usuario.nombre_completo}!`,
      message: `
        <div class="notification-content">
          <div class="notification-row">
            <i class="fas fa-user-tag"></i>
            <span><strong>Rol:</strong> ${usuario.rol}</span>
          </div>
          <div class="notification-row">
            <i class="fas fa-envelope"></i>
            <span><strong>Correo:</strong> ${usuario.correo}</span>
          </div>
          <div class="notification-divider"></div>
          <div class="notification-permissions">
            <p><i class="fas fa-check-circle"></i> Acceso como médico especialista</p>
            <p><i class="fas fa-check-circle"></i> Puedes ver lactarios, extracciones y temperatura de refrigeradores</p>
          </div>
        </div>
      `,
      duration: 8000,
      icon: 'fa-hand-wave',
      showConfirm: true,
      confirmText: 'Aceptar y continuar'
    });
  }

  closeNotification(id: number): void {
    this.notificationsSubject.next({
      id,
      type: 'close',
      title: '',
      message: ''
    });
  }
}