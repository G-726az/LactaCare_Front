import { NotificationService } from '../../app/services/notification.service';

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LactariosComponent } from './components/lactarios/lactarios.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { NotificationComponent } from './components/notification/notification.component';
import { SugerenciasComponent } from './components/sugerencias/sugerencias.component';

import { AuthService } from '../../../../services/auth.service';
import { SistemaComponent } from './components/sistema/sistema.component';
import { RefrigeradoresComponent } from './components/refrigeradores/refrigeradores.component';
import {
  PersonaEmpleado,
  PersonaPacienteDTO,
  SalaLactancia,
  SistemaAlerta,
} from '../../../../models/database.models';
import { EmpleadoService } from '../../app/services/empleado.service';
import { SalaLactanciaService } from '../../app/services/sala-lactancia.service';
import { PacienteService } from '../../app/services/paciente.service';
import { SistemaAlertaService } from '../../app/services/sistema-alerta.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    LactariosComponent,
    EmpleadosComponent,
    ConfiguracionComponent,
    ChatbotComponent,
    NotificationComponent,
    SugerenciasComponent,
    SistemaComponent,
    RefrigeradoresComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  sidebarCollapsed = false;
  showProfileMenu = false;
  seccionActiva = 'dashboard';
  salasLactanciaAct: SalaLactancia[] = [];
  salasLactanciaInact: SalaLactancia[] = [];
  empleadosAct: PersonaEmpleado[] = [];
  empleadosInact: PersonaEmpleado[] = [];
  pacientes: PersonaPacienteDTO[] = [];
  alertas: SistemaAlerta[] = [];

  adminData = {
    foto: 'assets/admin-avatar.png',
    nombre: 'Dr. Juan Pérez',
    nombreCompleto: 'Dr. Juan Carlos Pérez González',
    email: 'juan.perez@lactapp.com',
    telefono: '+593 99 123 4567',
    rol: 'Administrador',
  };

  cargarDashbord() {
    this.cargarEmpleados();
    this.cargarPacientes();
    this.cargarAlertas();
    this.cargarSalas();
  }

  cargarEmpleados() {
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados: PersonaEmpleado[]) => {
        this.empleadosAct = empleados.filter((empleado) => empleado.estado === 'ACTIVO');
        this.empleadosInact = empleados.filter((empleado) => empleado.estado === 'INACTIVO');
      },
      error: (err) => {
        console.error('Error empleados', err);
      },
    });
  }

  cargarPacientes() {
    this.pacienteService.getPacientes().subscribe({
      next: (paci) => {
        this.pacientes = paci;
      },
      error: (err) => {
        console.error('Error empleados', err);
      },
    });
  }

  cargarAlertas() {
    this.sistemaAlertaService.getAlertas().subscribe({
      next: (alertas) => {
        this.alertas = alertas;
      },
      error: (err) => {
        console.error('Alertas empleados', err);
      },
    });
  }

  cargarSalas() {
    this.salaLactanciaService.getAll().subscribe({
      next: (salas: SalaLactancia[]) => {
        this.salasLactanciaAct = salas.filter((sala) => sala.estado === 'ACTIVO');

        this.salasLactanciaInact = salas.filter((sala) => sala.estado === 'INACTIVO');
      },
      error: (err) => {
        console.error('Error salas', err);
      },
    });
  }

  stats = {
    totalUsuarios: 125,
    totalLactarios: 15,
    lactariosActivos: 12,
    reservasHoy: 34,
    reservasPendientes: 8,
    totalContenedores: 456,
    contenedoresDisponibles: 234,
  };

  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'lactarios', label: 'Lactarios', icon: '🏥' },
    { id: 'empleados', label: 'Empleados', icon: '👨‍⚕️' },
    { id: 'refrigeradores', label: 'Refrigeradores', icon: '🍼' },
    { id: 'chatbot', label: 'Chatbot IA', icon: '🤖' },
    { id: 'sugerencias', label: 'Sugerencias', icon: '💡' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' },
    { id: 'sistema', label: 'Sistema', icon: '💻' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private empleadoService: EmpleadoService,
    private salaLactanciaService: SalaLactanciaService,
    private pacienteService: PacienteService,
    private sistemaAlertaService: SistemaAlertaService
  ) {}

  ngOnInit() {
    this.cargarDashbord();
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

    //Verificar que cambie su contraseña
    if (user.status === 'PASSWORD_CHANGE_REQUIRED') {
      this.notificationService.error('⚠️ Primero debes cambiar contraseña');
      this.router.navigate(['/change-password']);
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

  tabActivo: 'ACTIVOS' | 'INACTIVOS' = 'ACTIVOS';

  get empleadosFiltrados() {
    return this.tabActivo === 'ACTIVOS' ? this.empleadosAct : this.empleadosInact;
  }

  cargarDatosAdmin() {
    // Cargar desde API
  }
}
