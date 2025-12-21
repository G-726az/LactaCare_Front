import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface DialogOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'question' | 'input';
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  inputType?: 'text' | 'number' | 'email' | 'password';
  inputPlaceholder?: string;
  inputValue?: string;
  inputLabel?: string;
  inputSuffix?: string;
}

export interface DialogResult {
  confirmed: boolean;
  value?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialogSubject = new Subject<{options: DialogOptions, callback: (result: DialogResult) => void}>();
  dialog$ = this.dialogSubject.asObservable();

  showAlert(options: DialogOptions): Promise<DialogResult> {
    return new Promise((resolve) => {
      this.dialogSubject.next({
        options: { 
          ...options, 
          type: options.type || 'info',
          showCancel: false 
        },
        callback: resolve
      });
    });
  }

  showConfirm(options: DialogOptions): Promise<DialogResult> {
    return new Promise((resolve) => {
      this.dialogSubject.next({
        options: { 
          ...options, 
          type: options.type || 'question',
          showCancel: true 
        },
        callback: resolve
      });
    });
  }

  showPrompt(options: DialogOptions): Promise<DialogResult> {
    return new Promise((resolve) => {
      this.dialogSubject.next({
        options: { 
          ...options, 
          type: 'input',
          showCancel: true,
          inputType: options.inputType || 'text',
          inputPlaceholder: options.inputPlaceholder || 'Ingrese el valor',
          inputValue: options.inputValue || '',
          inputLabel: options.inputLabel || 'Valor',
          inputSuffix: options.inputSuffix || ''
        },
        callback: resolve
      });
    });
  }

  // Métodos rápidos predefinidos
  success(message: string, title: string = 'Éxito'): Promise<DialogResult> {
    return this.showAlert({
      title,
      message,
      type: 'success',
      icon: 'fa-check-circle',
      confirmText: 'Aceptar'
    });
  }

  error(message: string, title: string = 'Error'): Promise<DialogResult> {
    return this.showAlert({
      title,
      message,
      type: 'error',
      icon: 'fa-times-circle',
      confirmText: 'Aceptar'
    });
  }

  info(message: string, title: string = 'Información'): Promise<DialogResult> {
    return this.showAlert({
      title,
      message,
      type: 'info',
      icon: 'fa-info-circle',
      confirmText: 'Aceptar'
    });
  }

  warning(message: string, title: string = 'Advertencia'): Promise<DialogResult> {
    return this.showAlert({
      title,
      message,
      type: 'warning',
      icon: 'fa-exclamation-triangle',
      confirmText: 'Aceptar'
    });
  }

  question(message: string, title: string = 'Confirmación'): Promise<DialogResult> {
    return this.showConfirm({
      title,
      message,
      type: 'question',
      icon: 'fa-question-circle',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar'
    });
  }

  input(message: string, title: string = 'Ingrese valor', defaultValue: string = ''): Promise<DialogResult> {
    return this.showPrompt({
      title,
      message,
      type: 'input',
      icon: 'fa-keyboard',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      inputValue: defaultValue,
      inputPlaceholder: message,
      inputLabel: 'Valor'
    });
  }
}