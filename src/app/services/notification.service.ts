import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notification$ = this.notificationSubject.asObservable();

  success(message: string, duration: number = 3000) {
    this.show({ type: 'success', message, duration });
    Swal.fire({
      icon: 'success',
      title: '✅ Éxito',
      text: message,
      timer: duration,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }

  error(message: string, duration: number = 4000) {
    this.show({ type: 'error', message, duration });
    Swal.fire({
      icon: 'error',
      title: '❌ Error',
      text: message,
      timer: duration,
      showConfirmButton: true,
      toast: true,
      position: 'top-end',
    });
  }

  warning(message: string, duration: number = 3000) {
    this.show({ type: 'warning', message, duration });
    Swal.fire({
      icon: 'warning',
      title: '⚠️ Advertencia',
      text: message,
      timer: duration,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }

  info(message: string, duration: number = 3000) {
    this.show({ type: 'info', message, duration });
    Swal.fire({
      icon: 'info',
      title: 'ℹ️ Información',
      text: message,
      timer: duration,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }

  private show(notification: Notification) {
    this.notificationSubject.next(notification);
  }

  confirm(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f44336',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}
