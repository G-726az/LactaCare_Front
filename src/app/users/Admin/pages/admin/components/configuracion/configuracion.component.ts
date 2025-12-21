import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  tabActiva = 'perfil';

  perfilData = {
    foto: 'assets/admin-avatar.png',
    nombre: 'Dr. Juan Carlos Pérez González',
    cedula: '0912345678',
    email: 'juan.perez@lactapp.com',
    telefono: '+593 99 123 4567',
    direccion: 'Av. Principal 123, Guayaquil'
  };

  sistemaData = {
    nombre: 'LactApp Admin',
    eslogan: 'Gestión Integral de Lactarios Maternos',
    logo: 'assets/logo.png',
    emailContacto: 'contacto@lactapp.com',
    telefonoSoporte: '+593 4 123 4567'
  };

  seguridadData = {
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {}

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  irASeguridad() {
    this.cambiarTab('seguridad');
    this.notificationService.info('📍 Redirigido a configuración de seguridad');
  }

  guardarPerfil() {
    if (!this.perfilData.nombre || !this.perfilData.email) {
      this.notificationService.warning('⚠️ Por favor completa nombre y email');
      return;
    }
    this.notificationService.success('✅ Perfil actualizado exitosamente');
  }

  guardarSistema() {
    if (!this.sistemaData.nombre) {
      this.notificationService.warning('⚠️ Por favor completa el nombre del sistema');
      return;
    }
    this.notificationService.success('✅ Configuración guardada exitosamente');
  }

  cambiarPassword() {
    if (!this.seguridadData.passwordActual || 
        !this.seguridadData.passwordNueva || 
        !this.seguridadData.passwordConfirmar) {
      this.notificationService.warning('⚠️ Completa todos los campos de contraseña');
      return;
    }

    if (this.seguridadData.passwordNueva !== this.seguridadData.passwordConfirmar) {
      this.notificationService.error('❌ Las contraseñas no coinciden');
      return;
    }

    if (this.seguridadData.passwordNueva.length < 8) {
      this.notificationService.warning('⚠️ Mínimo 8 caracteres requeridos');
      return;
    }

    this.notificationService.success('🔒 Contraseña cambiada exitosamente');
    this.seguridadData = {
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: ''
    };
  }
}