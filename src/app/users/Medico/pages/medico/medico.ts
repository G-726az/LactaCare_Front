import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { EmpleadoService } from '../medico/components/services/empleado.service';
import { NotificationService } from '../medico/components/services/notification.service';
import { NotificationComponent } from '../medico/components/notification/notification.component';

// Componentes
import { CabeceraComponent } from '../medico/components/cabecera/cabecera';
import { PrincipalComponent } from '../medico/components/principal/principal';
import { AtencionesComponent } from '../medico/components/atenciones/atenciones';
import { PacientesComponent } from '../medico/components/pacientes/pacientes';
import { ControlExtraccionesComponent } from '../medico/components/controlextracciones/controlextracciones';
import { TemperaturaComponent } from '../medico/components/temperatura/temperatura';
import { ReportesComponent } from '../medico/components/reportes/reportes';
import { MiInformacionComponent } from '../medico/components/miinformacion/miinformacion';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

interface Stats {
  totalAtenciones: number;
  atencionesHoy: number;
  pacientesAtendidos: number;
  reservasHoy: number;
  extraccionesRegistradas: number;
  alertasTemperatura: number;
  proximaReserva: string;
  salasActivas: number;
}

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [
    CommonModule,
    NotificationComponent,
    CabeceraComponent,
    PrincipalComponent,
    AtencionesComponent,
    PacientesComponent,
    ControlExtraccionesComponent,
    TemperaturaComponent,
    ReportesComponent,
    MiInformacionComponent,
  ],
  templateUrl: './medico.html',
  styleUrls: ['./medico.css'],
})
export class MedicoComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  showProfileMenu = false;
  seccionActiva = 'principal';
  cargandoDatos = true;

  medicoData = {
    Id_empleado: 0,
    Nombre_empleado: '',
    Apellido_empleado: '',
    nombreCompleto: '',
    nombre: '',
    Cedula_empleado: '',
    Email_empleado: '',
    email: '',
    Telefono_empleado: '',
    telefono: '',
    foto: 'assets/user-avatar.png',
    rol: 'Médico',
    especialidad: 'Pediatría - Lactancia',
  };

  stats: Stats = {
    totalAtenciones: 0,
    atencionesHoy: 0,
    pacientesAtendidos: 0,
    reservasHoy: 0,
    extraccionesRegistradas: 0,
    alertasTemperatura: 0,
    proximaReserva: 'Sin reservas',
    salasActivas: 0,
  };

  menuItems: MenuItem[] = [
    { id: 'principal', label: 'Principal', icon: '🏠' },
    { id: 'atenciones', label: 'Atenciones', icon: '📋' },
    { id: 'pacientes', label: 'Pacientes', icon: '👥' },
    { id: 'controlextracciones', label: 'Control Extracciones', icon: '🍼' },
    { id: 'temperatura', label: 'Temperatura', icon: '🌡️' },
    { id: 'reportes', label: 'Reportes', icon: '📊' },
    { id: 'miinformacion', label: 'Mi Información', icon: '👤' },
  ];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private empleadoService: EmpleadoService
  ) {}

  ngOnInit() {
    this.ocultarHeaderFooterGenerales(true);
    this.verificarAutenticacion();
  }

  ngOnDestroy() {
    this.ocultarHeaderFooterGenerales(false);
  }

  // ============================================================
  // 🔐 VERIFICAR AUTENTICACIÓN Y CARGAR DATOS
  // ============================================================
  verificarAutenticacion(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser || !currentUser.id) {
      console.error('❌ Usuario no autenticado');
      this.notificationService.error('⚠️ Sesión no válida. Por favor inicia sesión nuevamente.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Verificar que sea médico
    if (currentUser.rol !== 'MEDICO' && currentUser.rol !== 'MÉDICO') {
      console.error('❌ Acceso denegado - No es médico');
      this.notificationService.error('⚠️ No tiene permisos para acceder a esta sección');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    console.log('✅ Médico autenticado:', currentUser);
    this.cargarDatosUsuarioDesdeBackend(currentUser.id);
  }

  // ============================================================
  // 📦 CARGAR DATOS DESDE BACKEND
  // ============================================================
  cargarDatosUsuarioDesdeBackend(idEmpleado: number): void {
    this.cargandoDatos = true;

    this.empleadoService.getEmpleadoById(idEmpleado).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('✅ Datos del médico obtenidos:', response.data);

          const nombreCompleto = [
            response.data.primerNombre,
            response.data.segundoNombre,
            response.data.primerApellido,
            response.data.segundoApellido,
          ]
            .filter(Boolean)
            .join(' ');

          this.medicoData = {
            Id_empleado: response.data.id,
            Nombre_empleado: response.data.primerNombre || '',
            Apellido_empleado: response.data.primerApellido || '',
            nombreCompleto: nombreCompleto,
            nombre: nombreCompleto,
            Cedula_empleado: response.data.cedula || '',
            Email_empleado: response.data.correo || '',
            email: response.data.correo || '',
            Telefono_empleado: response.data.telefono || '',
            telefono: response.data.telefono || '',
            foto: response.data.perfilEmpleadoImg || 'assets/user-avatar.png',
            rol: response.data.rol?.nombreRol || 'Médico',
            especialidad: 'Pediatría - Lactancia',
          };

          localStorage.setItem('medicoData', JSON.stringify(response.data));

          this.cargarEstadisticas();
          this.mostrarMensajeBienvenida();
          this.cargandoDatos = false;
        } else {
          console.error('❌ Error en respuesta del servidor:', response.message);
          this.notificationService.error('❌ Error al cargar tus datos');
          this.cargandoDatos = false;
        }
      },
      error: (error) => {
        console.error('❌ Error obteniendo datos del médico:', error);
        this.notificationService.error('❌ Error de conexión al cargar tus datos');
        this.cargandoDatos = false;
        this.cargarDatosUsuarioLocal();
      },
    });
  }

  // ============================================================
  // 💾 CARGAR DATOS LOCALES (FALLBACK)
  // ============================================================
  cargarDatosUsuarioLocal(): void {
    const storedUser = localStorage.getItem('lactaCareUser');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        const nombreCompleto = [
          user.primerNombre || user.primer_nombre,
          user.segundoNombre || user.segundo_nombre,
          user.primerApellido || user.primer_apellido,
          user.segundoApellido || user.segundo_apellido,
        ]
          .filter(Boolean)
          .join(' ');

        this.medicoData = {
          Id_empleado: user.id || 0,
          Nombre_empleado: user.primerNombre || user.primer_nombre || '',
          Apellido_empleado: user.primerApellido || user.primer_apellido || '',
          nombreCompleto: nombreCompleto,
          nombre: nombreCompleto,
          Cedula_empleado: user.cedula || '',
          Email_empleado: user.correo || '',
          email: user.correo || '',
          Telefono_empleado: user.telefono || '',
          telefono: user.telefono || '',
          foto: user.imagenPerfil || user.perfil_img || 'assets/user-avatar.png',
          rol: user.rol || 'Médico',
          especialidad: 'Pediatría - Lactancia',
        };

        this.cargarEstadisticas();
        this.mostrarMensajeBienvenida();
      } catch (error) {
        console.error('Error al cargar datos del usuario desde localStorage:', error);
      }
    }
  }

  // ============================================================
  // 🚪 CERRAR SESIÓN
  // ============================================================
  cerrarSesion() {
    if (confirm('⚠️ ¿Está seguro de que desea cerrar sesión?')) {
      this.authService.logout();
      localStorage.removeItem('medicoData');
      localStorage.removeItem('atenciones_medico');
      localStorage.removeItem('extracciones_medico');

      this.notificationService.success('✨ Sesión cerrada exitosamente. ¡Hasta pronto!');
      this.ocultarHeaderFooterGenerales(false);

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    }
  }

  // ============================================================
  // MÉTODOS AUXILIARES
  // ============================================================

  ocultarHeaderFooterGenerales(ocultar: boolean) {
    const header = document.querySelector('app-header');
    const footer = document.querySelector('app-footer');

    if (header) {
      (header as HTMLElement).style.display = ocultar ? 'none' : 'block';
    }
    if (footer) {
      (footer as HTMLElement).style.display = ocultar ? 'none' : 'block';
    }
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

    const mensajes: { [key: string]: string } = {
      principal: '🏠 Panel principal',
      atenciones: '📋 Gestión de atenciones',
      pacientes: '👥 Gestión de pacientes',
      controlextracciones: '🍼 Control de extracciones',
      temperatura: '🌡️ Monitoreo de temperatura',
      reportes: '📊 Reportes y estadísticas',
      miinformacion: '👤 Mi información personal',
    };

    if (mensajes[seccion]) {
      this.notificationService.info(mensajes[seccion]);
    }
  }

  getTituloSeccion(): string {
    const item = this.menuItems.find((m) => m.id === this.seccionActiva);
    return item ? item.label : 'Principal';
  }

  editarPerfil() {
    this.cambiarSeccion('miinformacion');
    this.showProfileMenu = false;
  }

  cargarEstadisticas() {
    // Cargar atenciones
    const atencionesStr = localStorage.getItem('atenciones_medico');
    if (atencionesStr) {
      try {
        const atenciones = JSON.parse(atencionesStr);
        this.stats.totalAtenciones = atenciones.length;

        const hoy = new Date().toDateString();
        this.stats.atencionesHoy = atenciones.filter((a: any) => {
          const fechaAtencion = new Date(a.fecha).toDateString();
          return fechaAtencion === hoy;
        }).length;
      } catch (error) {
        console.error('Error al cargar atenciones:', error);
      }
    }

    // Cargar extracciones
    const extraccionesStr = localStorage.getItem('extracciones_medico');
    if (extraccionesStr) {
      try {
        const extracciones = JSON.parse(extraccionesStr);
        this.stats.extraccionesRegistradas = extracciones.length;
      } catch (error) {
        console.error('Error al cargar extracciones:', error);
      }
    }

    this.stats.salasActivas = 1; // Por defecto
  }

  mostrarMensajeBienvenida() {
    const hora = new Date().getHours();
    let saludo = '';

    if (hora < 12) {
      saludo = 'Buenos días';
    } else if (hora < 19) {
      saludo = 'Buenas tardes';
    } else {
      saludo = 'Buenas noches';
    }

    this.notificationService.success(`${saludo}, Dr. ${this.medicoData.Apellido_empleado}! 👋`);
  }

  mostrarNotificaciones() {
    this.notificationService.info('🔔 Sistema de notificaciones activo');
  }

  get notificacionesPendientes(): number {
    return this.stats.alertasTemperatura;
  }

  // Métodos de navegación rápida
  irAAtenciones(): void {
    this.cambiarSeccion('atenciones');
  }

  irAPacientes(): void {
    this.cambiarSeccion('pacientes');
  }

  irATemperatura(): void {
    this.cambiarSeccion('temperatura');
  }

  irAReportes(): void {
    this.cambiarSeccion('reportes');
  }

  nuevaAtencion(): void {
    this.cambiarSeccion('atenciones');
    // Aquí se podría emitir un evento para abrir directamente el formulario
  }
}
