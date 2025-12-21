import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

export interface PacienteData {
  Id_paciente: number;
  Nombre_paciente: string;
  Apellido_paciente: string;
  nombreCompleto: string;
  Cedula_paciente: string;
  Email_paciente: string;
  Telefono_paciente: string;
  Direccion_paciente?: string;
  Fecha_nacimiento_paciente?: Date;
  foto: string;
  rol?: string;
}

@Component({
  selector: 'app-perfil-madres',
  templateUrl: './perfil-madres.component.html',
  styleUrls: ['./perfil-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PerfilMadresComponent implements OnInit {
  editMode = false;
  private pacienteDataOriginal: PacienteData | null = null;
  
  pacienteData: PacienteData = {
    Id_paciente: 1,
    Nombre_paciente: 'Sarah',
    Apellido_paciente: 'García',
    nombreCompleto: 'Sarah García',
    Cedula_paciente: '1756789012',
    Email_paciente: 'sarah.garcia@email.com',
    Telefono_paciente: '+593 99 876 5432',
    Direccion_paciente: 'Av. Principal 123',
    Fecha_nacimiento_paciente: new Date('1995-05-15'),
    foto: 'assets/user-avatar.png',
    rol: 'Madre Lactante'
  };

  // Campos de validación
  errores: { [key: string]: string } = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.cargarDatosPaciente();
  }

  cargarDatosPaciente(): void {
    const storedUser = localStorage.getItem('lactaCareUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.pacienteData = {
          ...this.pacienteData,
          ...user,
          nombreCompleto: `${user.Nombre_paciente || ''} ${user.Apellido_paciente || ''}`.trim()
        };
      } catch (error) {
        console.error('Error al cargar datos del paciente:', error);
        this.notificationService.error('❌ Error al cargar datos del perfil');
      }
    }
  }

  toggleEditMode(): void {
    this.editMode = true;
    this.pacienteDataOriginal = { ...this.pacienteData };
    this.errores = {};
  }

  validarDatos(): boolean {
    this.errores = {};
    let esValido = true;

    // Validar cédula (10 dígitos)
    if (!/^\d{10}$/.test(this.pacienteData.Cedula_paciente)) {
      this.errores['cedula'] = 'La cédula debe tener 10 dígitos';
      esValido = false;
    }

    // Validar nombre
    if (!this.pacienteData.Nombre_paciente.trim()) {
      this.errores['nombre'] = 'El nombre es obligatorio';
      esValido = false;
    }

    // Validar apellido
    if (!this.pacienteData.Apellido_paciente.trim()) {
      this.errores['apellido'] = 'El apellido es obligatorio';
      esValido = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.pacienteData.Email_paciente)) {
      this.errores['email'] = 'Email inválido';
      esValido = false;
    }

    // Validar teléfono
    if (!/^[\d\s\+\-()]{7,20}$/.test(this.pacienteData.Telefono_paciente)) {
      this.errores['telefono'] = 'Teléfono inválido';
      esValido = false;
    }

    return esValido;
  }

  guardarCambios(): void {
    if (!this.validarDatos()) {
      this.notificationService.error('❌ Por favor corrige los errores en el formulario');
      return;
    }

    try {
      // Actualizar nombre completo
      this.pacienteData.nombreCompleto = 
        `${this.pacienteData.Nombre_paciente.trim()} ${this.pacienteData.Apellido_paciente.trim()}`;
      
      localStorage.setItem('lactaCareUser', JSON.stringify(this.pacienteData));
      this.editMode = false;
      this.pacienteDataOriginal = null;
      this.errores = {};
      
      this.notificationService.success('✅ Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      this.notificationService.error('❌ Error al guardar los cambios');
    }
  }

  cancelarEdicion(): void {
    if (this.pacienteDataOriginal) {
      this.pacienteData = { ...this.pacienteDataOriginal };
      this.pacienteDataOriginal = null;
    }
    this.editMode = false;
    this.errores = {};
    this.notificationService.info('ℹ️ Edición cancelada');
  }

  cambiarFoto(): void {
    // Simulación de cambio de foto
    const opciones = [
      'assets/user-avatar.png',
      'assets/avatar-1.png',
      'assets/avatar-2.png',
      'assets/avatar-3.png'
    ];
    
    const randomIndex = Math.floor(Math.random() * opciones.length);
    this.pacienteData.foto = opciones[randomIndex];
    
    if (!this.editMode) {
      this.guardarDatosFoto();
    }
    
    this.notificationService.success('📸 Foto actualizada');
  }

  private guardarDatosFoto(): void {
    try {
      localStorage.setItem('lactaCareUser', JSON.stringify(this.pacienteData));
    } catch (error) {
      console.error('Error al guardar foto:', error);
    }
  }

  calcularEdad(): number {
    if (!this.pacienteData.Fecha_nacimiento_paciente) return 0;
    
    const hoy = new Date();
    const nacimiento = new Date(this.pacienteData.Fecha_nacimiento_paciente);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }
}