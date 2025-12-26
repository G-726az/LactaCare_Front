import { NotificationService } from './components/services/notification.service';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContenidoComponent } from './components/contenido/contenido.component';
import { LactariosComponent } from './components/lactarios/lactarios.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { NotificationComponent } from './components/notification/notification.component';
import { SugerenciasComponent } from './components/sugerencias/sugerencias.component';
import { ImagenesComponent } from './components/imagenes/imagenes.component';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ContenidoComponent,
    LactariosComponent,
    EmpleadosComponent,
    ConfiguracionComponent,
    ChatbotComponent,
    NotificationComponent,
    SugerenciasComponent,
    ImagenesComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  sidebarCollapsed = false;
  showProfileMenu = false;
  seccionActiva = 'dashboard';

  adminData = {
    foto: 'assets/admin-avatar.png',
    nombre: 'Dr. Juan Pérez',
    nombreCompleto: 'Dr. Juan Carlos Pérez González',
    email: 'juan.perez@lactapp.com',
    telefono: '+593 99 123 4567',
    rol: 'Administrador',
  };

  stats = {
    totalUsuarios: 1247,
    totalLactarios: 15,
    lactariosActivos: 12,
    reservasHoy: 34,
    reservasPendientes: 8,
    totalContenedores: 456,
    contenedoresDisponibles: 234,
  };

  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'contenido', label: 'Contenido', icon: '📝' },
    { id: 'lactarios', label: 'Lactarios', icon: '🏥' },
    { id: 'empleados', label: 'Empleados', icon: '👨‍⚕️' },
    { id: 'chatbot', label: 'Chatbot IA', icon: '🤖' },
    { id: 'sugerencias', label: 'Sugerencias', icon: '💡' },
    { id: 'imagenes', label: 'Imágenes', icon: '🖼️' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.verificarAutenticacion();
    this.cargarDatosAdmin();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) {
      this.showProfileMenu = false;
    }
  }

  toggleProfileMenu() {
    if (!this.sidebarCollapsed) {
      this.showProfileMenu = !this.showProfileMenu;
    }
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.showProfileMenu = false;
  }

  getTituloSeccion(): string {
    const item = this.menuItems.find((m) => m.id === this.seccionActiva);
    return item ? item.label : '';
  }

  editarPerfil() {
    this.cambiarSeccion('configuracion');
    this.showProfileMenu = false;
  }

  verificarAutenticacion() {
    const user = this.authService.currentUserValue;

    if (!user) {
      this.notificationService.error('⚠️ Debes iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }

    // Verificar que sea administrador
    const rolNormalizado = user.rol?.toUpperCase();
    if (rolNormalizado !== 'ADMINISTRADOR' && rolNormalizado !== 'ADMIN') {
      this.notificationService.error('❌ No tienes permisos de administrador');
      this.router.navigate(['/login']);
      return;
    }

    // Cargar datos del administrador desde el usuario autenticado
    this.adminData = {
      foto: user.perfil_img || 'assets/admin-avatar.png',
      nombre: `${user.primer_nombre} ${user.primer_apellido}`,
      nombreCompleto: user.nombre_completo,
      email: user.correo,
      telefono: user.telefono,
      rol: user.rol,
    };
  }

  cerrarSesion() {
    if (confirm('⚠️ ¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout(); // ⬅️ Usar el servicio
      this.notificationService.success('✨ Sesión cerrada exitosamente. ¡Hasta pronto!');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    }
  }

  cargarDatosAdmin() {
    // Cargar desde API
  }
}
