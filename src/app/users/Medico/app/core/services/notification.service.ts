import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

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

  // Métodos existentes para mantener compatibilidad
  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.showSweetAlert(title, message, 'success');
    
    // También emitir la notificación para componentes que la necesiten
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
    this.showSweetAlert(title, message, 'error');
    
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
    this.showSweetAlert(title, message, 'info');
    
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
    this.showSweetAlert(title, message, 'warning');
    
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
  ): Promise<SweetAlertResult> {
    return this.showSweetAlertWithCancel(
      title,
      message,
      'question',
      confirmText,
      cancelText
    ).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      } else if (result.isDismissed && onCancel) {
        onCancel();
      }
      return result;
    });
  }

  showWelcome(usuario: any): void {
    this.showSweetAlert(
      `¡Bienvenido/a, ${usuario.nombre_completo}!`,
      `
        <div class="text-left">
          <div class="mb-2">
            <i class="fas fa-user-tag mr-2"></i>
            <strong>Rol:</strong> ${usuario.rol}
          </div>
          <div class="mb-3">
            <i class="fas fa-envelope mr-2"></i>
            <strong>Correo:</strong> ${usuario.correo}
          </div>
          <hr>
          <div class="mt-3">
            <p><i class="fas fa-check-circle text-success mr-2"></i> Acceso como médico especialista</p>
            <p><i class="fas fa-check-circle text-success mr-2"></i> Puedes ver lactarios, extracciones y temperatura de refrigeradores</p>
          </div>
        </div>
      `,
      'info',
      'Aceptar y continuar'
    );
    
    // También emitir para componentes existentes
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

  // ============================================
  // NUEVOS MÉTODOS CON SWEETALERT2
  // ============================================

  /**
   * Muestra una alerta básica con SweetAlert2
   */
  showSweetAlert(
    title: string, 
    html: string, 
    icon: SweetAlertIcon = 'info',
    confirmButtonText: string = 'Aceptar',
    confirmButtonColor: string = '#1976d2',
    timer?: number
  ): Promise<SweetAlertResult> {
    const swalOptions: any = {
      title,
      html,
      icon,
      confirmButtonColor,
      confirmButtonText,
      customClass: {
        confirmButton: 'btn-swal-confirm'
      }
    };

    if (timer) {
      swalOptions.timer = timer;
      swalOptions.timerProgressBar = true;
      swalOptions.showConfirmButton = false;
    }

    return Swal.fire(swalOptions);
  }

  /**
   * Muestra una alerta con botón de confirmar y cancelar
   */
  showSweetAlertWithCancel(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'question',
    confirmButtonText: string = 'Sí',
    cancelButtonText: string = 'No',
    confirmButtonColor: string = '#1976d2',
    cancelButtonColor: string = '#6c757d'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText,
      cancelButtonText,
      customClass: {
        confirmButton: 'btn-swal-confirm',
        cancelButton: 'btn-swal-cancel'
      }
    });
  }

  /**
   * Muestra una alerta con campo de entrada
   */
  showSweetAlertWithInput(
    title: string,
    inputLabel: string,
    inputType: 'text' | 'number' | 'email' | 'password' | 'textarea' = 'text',
    inputPlaceholder: string = '',
    confirmButtonText: string = 'Aceptar',
    cancelButtonText: string = 'Cancelar',
    validation?: (value: string) => string | null
  ): Promise<SweetAlertResult> {
    const swalOptions: any = {
      title,
      input: inputType,
      inputLabel,
      inputPlaceholder,
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#6c757d',
      confirmButtonText,
      cancelButtonText,
      customClass: {
        confirmButton: 'btn-swal-confirm',
        cancelButton: 'btn-swal-cancel'
      }
    };

    if (validation) {
      swalOptions.inputValidator = validation;
    }

    if (inputType === 'textarea') {
      swalOptions.input = 'textarea';
      swalOptions.inputAttributes = {
        rows: '4'
      };
    }

    return Swal.fire(swalOptions);
  }

  /**
   * Muestra una alerta de éxito estilizada
   */
  showSuccessAlert(title: string, message: string): Promise<SweetAlertResult> {
    return this.showSweetAlert(
      title,
      `<div class="text-center"><i class="fas fa-check-circle fa-3x text-success mb-3"></i><p>${message}</p></div>`,
      'success',
      'Aceptar',
      '#10b981'
    );
  }

  /**
   * Muestra una alerta de error estilizada
   */
  showErrorAlert(title: string, message: string): Promise<SweetAlertResult> {
    return this.showSweetAlert(
      title,
      `<div class="text-center"><i class="fas fa-times-circle fa-3x text-danger mb-3"></i><p>${message}</p></div>`,
      'error',
      'Aceptar',
      '#ef4444'
    );
  }

  /**
   * Muestra una alerta de confirmación para acciones críticas
   */
  showDeleteConfirmation(
    itemName: string = 'este elemento'
  ): Promise<SweetAlertResult> {
    return this.showSweetAlertWithCancel(
      '¿Estás seguro?',
      `Esta acción eliminará ${itemName}. Esta acción no se puede deshacer.`,
      'warning',
      'Sí, eliminar',
      'Cancelar',
      '#dc2626',
      '#6c757d'
    );
  }

  /**
   * Muestra una alerta con progreso/loading
   */
  showLoading(message: string = 'Procesando...'): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  }

  /**
   * Cierra la alerta de loading actual
   */
  closeLoading(): void {
    Swal.close();
  }

  /**
   * Muestra una alerta de éxito después de una operación
   */
  showSuccessWithTimer(
    title: string,
    message: string,
    timer: number = 2000
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      html: `<div class="text-center"><i class="fas fa-check-circle fa-3x text-success mb-3"></i><p>${message}</p></div>`,
      icon: 'success',
      timer,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }

  /**
   * Muestra una alerta con HTML personalizado
   */
  showCustomHtmlAlert(
    title: string,
    htmlContent: string,
    icon: SweetAlertIcon = 'info'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      html: htmlContent,
      icon,
      confirmButtonColor: '#1976d2',
      confirmButtonText: 'Aceptar',
      customClass: {
        confirmButton: 'btn-swal-confirm'
      }
    });
  }

  /**
   * Muestra una alerta de temperatura crítica
   */
  showTemperatureAlert(
    refrigeradorId: number,
    temperatura: string,
    nivel: 'alerta' | 'critico' = 'critico'
  ): Promise<SweetAlertResult> {
    const icon = nivel === 'critico' ? 'fire' : 'exclamation-triangle';
    const color = nivel === 'critico' ? '#dc2626' : '#f59e0b';
    const title = nivel === 'critico' ? '⚠️ Temperatura Crítica' : '⚠️ Alerta de Temperatura';
    
    return this.showSweetAlert(
      title,
      `
        <div class="text-center">
          <i class="fas fa-${icon} fa-3x mb-3" style="color: ${color};"></i>
          <h4 class="mb-2">Refrigerador #${refrigeradorId}</h4>
          <p class="mb-1">Temperatura actual: <strong>${temperatura}</strong></p>
          <p class="text-sm text-gray-600">${nivel === 'critico' ? 'Se requiere atención inmediata' : 'Verificar refrigerador'}</p>
        </div>
      `,
      'warning',
      'Entendido',
      color
    );
  }

  /**
   * Muestra una alerta para registrar extracción
   */
  showExtractionAlert(): Promise<SweetAlertResult> {
    return this.showSweetAlertWithInput(
      'Registrar Extracción',
      'Ingrese la cantidad en mililitros (ml):',
      'number',
      'Ej: 150',
      'Registrar',
      'Cancelar',
      (value) => {
        if (!value) {
          return 'Debe ingresar una cantidad';
        }
        const cantidad = parseFloat(value);
        if (isNaN(cantidad) || cantidad <= 0) {
          return 'La cantidad debe ser un número mayor a 0';
        }
        if (cantidad > 1000) {
          return 'La cantidad no puede exceder los 1000 ml';
        }
        return null;
      }
    );
  }
}