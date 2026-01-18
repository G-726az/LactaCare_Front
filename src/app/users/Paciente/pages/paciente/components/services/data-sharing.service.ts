// src/app/services/data-sharing.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PerfilActualizadoEvent {
  id: number;
  nombreCompleto: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  cedula: string;
  correo: string;
  telefono: string;
  imagenPerfil?: string;
  fechaNacimiento: string;
  discapacidad: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  // mantener el último valor del perfil
  private perfilPacienteSubject = new BehaviorSubject<PerfilActualizadoEvent | null>(null);
  public perfilPaciente$: Observable<PerfilActualizadoEvent | null> = 
    this.perfilPacienteSubject.asObservable();

  constructor() {
    console.log('🔄 DataSharingService inicializado');
  }

  /**
   * Emite un evento cuando el perfil se actualiza
   * @param perfil - Datos actualizados del perfil
   */
  actualizarPerfilPaciente(perfil: PerfilActualizadoEvent): void {
    console.log('📢 Emitiendo actualización de perfil:', perfil);
    this.perfilPacienteSubject.next(perfil);
  }

  /**
   * Obtiene el valor actual del perfil sin suscribirse
   * @returns Perfil actual o null
   */
  getPerfilActual(): PerfilActualizadoEvent | null {
    return this.perfilPacienteSubject.value;
  }

  limpiarPerfil(): void {
    console.log('🧹 Limpiando datos del perfil');
    this.perfilPacienteSubject.next(null);
  }
}