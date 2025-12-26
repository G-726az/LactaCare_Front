import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';
import { NotificationService } from './components/services/notification.service';
import { ChatbotMadresComponent } from './components/chatbot-madres/chatbot-madres.component';
import { ControlMadresComponent } from './components/control-madres/control-madres.component';
import { MonitoreoLotComponent } from './components/monitoreo-lot/monitoreo-lot.component';
import { PerfilMadresComponent } from './components/perfil-madres/perfil-madres.component';
import { ReservasMadresComponent } from './components/reservas-madres/reservas-madres.component';
import { SalasMadresComponent } from './components/salas-madres/salas-madres.component';
import { PacienteHeaderComponent } from './components/paciente-header/paciente-header.component';
import { AuthService } from '../../../../services/auth.service';
import { PacienteService } from '../../../../services/paciente.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

interface Stats {
  totalUsuarios: number;
  totalLactarios: number;
  lactariosActivos: number;
  reservasHoy: number;
  reservasPendientes: number;
  totalContenedores: number;
  contenedoresDisponibles: number;
  reservasActivas: number;
  proximaReserva: string;
  extraccionesTotales: number;
  ultimaExtraccion: string;
  salasDisponibles: number;
  alertasPendientes: number;
}

@Component({
  selector: 'app-paciente',
  standalone: true,
  imports: [
    CommonModule,
    ChatbotMadresComponent,
    NotificationComponent,
    ControlMadresComponent,
    MonitoreoLotComponent,
    PerfilMadresComponent,
    ReservasMadresComponent,
    SalasMadresComponent,
    PacienteHeaderComponent,
  ],
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css'],
})
export class PacienteComponent implements OnInit {
  sidebarCollapsed = false;
  showProfileMenu = false;
  seccionActiva = 'dashboard';
  cargandoDatos = true;

  pacienteData = {
    Id_paciente: 0,
    Nombre_paciente: '',
    Apellido_paciente: '',
    nombreCompleto: '',
    nombre: '',
    Cedula_paciente: '',
    Email_paciente: '',
    email: '',
    Telefono_paciente: '',
    telefono: '',
    Direccion_paciente: '',
    foto: 'assets/user-avatar.png',
    rol: 'Madre Lactante',
  };

  stats: Stats = {
    totalUsuarios: 0,
    totalLactarios: 0,
    lactariosActivos: 0,
    reservasHoy: 0,
    reservasPendientes: 0,
    totalContenedores: 0,
    contenedoresDisponibles: 0,
    reservasActivas: 0,
    proximaReserva: 'Sin reservas',
    extraccionesTotales: 0,
    ultimaExtraccion: 'Sin registros',
    salasDisponibles: 0,
    alertasPendientes: 0,
  };

  menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'Perfil', label: 'Mi Perfil', icon: '👤' },
    { id: 'Reservas', label: 'Mis Reservas', icon: '📅' },
    { id: 'Salas', label: 'Salas Disponibles', icon: '🏥' },
    { id: 'control', label: 'Control Extracciones', icon: '🍼' },
    { id: 'Monitoreo', label: 'Monitoreo IoT', icon: '🌡️' },
    { id: 'chatbot', label: 'Asistente Virtual', icon: '🤖' },
  ];

  notificaciones: any[] = [];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private pacienteService: PacienteService
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

    console.log('✅ Usuario autenticado:', currentUser);
    this.cargarDatosUsuarioDesdeBackend(currentUser.id);
  }

  // ============================================================
  // 📦 CARGAR DATOS DESDE BACKEND - ACTUALIZADO
  // ============================================================
  cargarDatosUsuarioDesdeBackend(idPaciente: number): void {
    this.cargandoDatos = true;

    this.pacienteService.getPacienteById(idPaciente).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('✅ Datos del paciente obtenidos:', response.data);

          // Construir nombre completo manejando valores null/undefined
          const nombreCompleto = [
            response.data.primerNombre,
            response.data.segundoNombre,
            response.data.primerApellido,
            response.data.segundoApellido,
          ]
            .filter(Boolean)
            .join(' ');

          // Mapear datos del backend al formato del componente
          this.pacienteData = {
            Id_paciente: response.data.id,
            Nombre_paciente: response.data.primerNombre || '',
            Apellido_paciente: response.data.primerApellido || '',
            nombreCompleto: nombreCompleto,
            nombre: nombreCompleto,
            Cedula_paciente: response.data.cedula || '',
            Email_paciente: response.data.correo || '',
            email: response.data.correo || '',
            Telefono_paciente: response.data.telefono || '',
            telefono: response.data.telefono || '',
            Direccion_paciente: '',
            foto: response.data.imagenPerfil || 'assets/user-avatar.png',
            rol: 'Madre Lactante',
          };

          // Guardar en localStorage para acceso posterior
          localStorage.setItem('userData', JSON.stringify(response.data));

          // Cargar estadísticas y notificaciones
          this.cargarEstadisticas();
          this.verificarNotificaciones();
          this.mostrarMensajeBienvenida();

          this.cargandoDatos = false;
        } else {
          console.error('❌ Error en respuesta del servidor:', response.message);
          this.notificationService.error('❌ Error al cargar tus datos');
          this.cargandoDatos = false;
        }
      },
      error: (error) => {
        console.error('❌ Error obteniendo datos del paciente:', error);
        this.notificationService.error('❌ Error de conexión al cargar tus datos');
        this.cargandoDatos = false;

        // Intentar cargar desde localStorage como fallback
        this.cargarDatosUsuarioLocal();
      },
    });
  }

  // ============================================================
  // 💾 CARGAR DATOS LOCALES (FALLBACK) - ACTUALIZADO
  // ============================================================
  cargarDatosUsuarioLocal(): void {
    const storedUser = localStorage.getItem('lactaCareUser');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        // Construir nombre completo
        const nombreCompleto = [
          user.primerNombre || user.primer_nombre,
          user.segundoNombre || user.segundo_nombre,
          user.primerApellido || user.primer_apellido,
          user.segundoApellido || user.segundo_apellido,
        ]
          .filter(Boolean)
          .join(' ');

        this.pacienteData = {
          Id_paciente: user.id || 0,
          Nombre_paciente: user.primerNombre || user.primer_nombre || '',
          Apellido_paciente: user.primerApellido || user.primer_apellido || '',
          nombreCompleto: nombreCompleto,
          nombre: nombreCompleto,
          Cedula_paciente: user.cedula || '',
          Email_paciente: user.correo || '',
          email: user.correo || '',
          Telefono_paciente: user.telefono || '',
          telefono: user.telefono || '',
          Direccion_paciente: '',
          foto: user.imagenPerfil || user.perfil_img || 'assets/user-avatar.png',
          rol: 'Madre Lactante',
        };

        this.cargarEstadisticas();
        this.verificarNotificaciones();
        this.mostrarMensajeBienvenida();
      } catch (error) {
        console.error('Error al cargar datos del usuario desde localStorage:', error);
      }
    }
  }

  // ============================================================
  // 🚪 CERRAR SESIÓN ACTUALIZADO
  // ============================================================
  cerrarSesion() {
    if (confirm('⚠️ ¿Estás segura de que deseas cerrar sesión?')) {
      // Usar el método del AuthService
      this.authService.logout();

      // Limpiar datos adicionales
      localStorage.removeItem('userData');
      localStorage.removeItem('extracciones_paciente');
      localStorage.removeItem('reservasPaciente');
      localStorage.removeItem('chatbot_historial');

      this.notificationService.success('✨ Sesión cerrada exitosamente. ¡Hasta pronto!');

      this.ocultarHeaderFooterGenerales(false);

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    }
  }

  // ============================================================
  // MÉTODOS EXISTENTES (sin cambios)
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
      dashboard: '📊 Dashboard cargado',
      Perfil: '👤 Visualizando tu perfil',
      Reservas: '📅 Mis reservas',
      Salas: '🏥 Explorando salas disponibles',
      control: '🍼 Control de extracciones',
      Monitoreo: '🌡️ Monitoreo IoT activo',
      chatbot: '🤖 Asistente virtual listo',
    };

    if (mensajes[seccion]) {
      this.notificationService.info(mensajes[seccion]);
    }
  }

  getTituloSeccion(): string {
    const item = this.menuItems.find((m) => m.id === this.seccionActiva);
    return item ? item.label : 'Dashboard';
  }

  editarPerfil() {
    this.cambiarSeccion('Perfil');
    this.showProfileMenu = false;
  }

  cargarEstadisticas() {
    const reservasStr = localStorage.getItem('reservasPaciente');
    if (reservasStr) {
      try {
        const reservas = JSON.parse(reservasStr);
        this.stats.reservasActivas = reservas.filter((r: any) => r.estado === 'Confirmada').length;
        this.stats.reservasPendientes = reservas.filter(
          (r: any) => r.estado === 'Pendiente'
        ).length;

        const hoy = new Date().toDateString();
        this.stats.reservasHoy = reservas.filter((r: any) => {
          const fechaReserva = new Date(r.fecha).toDateString();
          return fechaReserva === hoy && r.estado !== 'Cancelada';
        }).length;

        const reservasConfirmadas = reservas
          .filter((r: any) => r.estado === 'Confirmada')
          .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        if (reservasConfirmadas.length > 0) {
          const proxima = reservasConfirmadas[0];
          const fecha = new Date(proxima.fecha);
          const hoy = new Date();

          if (fecha.toDateString() === hoy.toDateString()) {
            this.stats.proximaReserva = `Hoy, ${proxima.hora}`;
          } else {
            const manana = new Date(hoy);
            manana.setDate(manana.getDate() + 1);
            if (fecha.toDateString() === manana.toDateString()) {
              this.stats.proximaReserva = `Mañana, ${proxima.hora}`;
            } else {
              this.stats.proximaReserva = `${fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
              })}, ${proxima.hora}`;
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      }
    }

    const extraccionesStr = localStorage.getItem('extracciones_paciente');
    if (extraccionesStr) {
      try {
        const extracciones = JSON.parse(extraccionesStr);
        this.stats.extraccionesTotales = extracciones.length;
        this.stats.totalContenedores = extracciones.length;
        this.stats.contenedoresDisponibles = extracciones.filter(
          (e: any) => e.estado === 'activa'
        ).length;

        if (extracciones.length > 0) {
          const ultima = extracciones[0];
          const fechaUltima = new Date(ultima.fecha);
          const ahora = new Date();
          const diffMs = ahora.getTime() - fechaUltima.getTime();
          const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));

          if (diffHoras < 1) {
            const diffMinutos = Math.floor(diffMs / (1000 * 60));
            this.stats.ultimaExtraccion = `Hace ${diffMinutos} minuto${
              diffMinutos !== 1 ? 's' : ''
            }`;
          } else if (diffHoras < 24) {
            this.stats.ultimaExtraccion = `Hace ${diffHoras} hora${diffHoras !== 1 ? 's' : ''}`;
          } else {
            const diffDias = Math.floor(diffHoras / 24);
            this.stats.ultimaExtraccion = `Hace ${diffDias} día${diffDias !== 1 ? 's' : ''}`;
          }
        }
      } catch (error) {
        console.error('Error al cargar extracciones:', error);
      }
    }

    const salasStr = localStorage.getItem('salas_lactancia');
    if (salasStr) {
      try {
        const salas = JSON.parse(salasStr);
        this.stats.salasDisponibles = salas.filter((s: any) => s.Disponible).length;
        this.stats.totalLactarios = salas.length;
        this.stats.lactariosActivos = salas.filter((s: any) => s.Disponible).length;
      } catch (error) {
        console.error('Error al cargar salas:', error);
      }
    }

    const refrigeradoresStr = localStorage.getItem('monitoreo_refrigeradores');
    if (refrigeradoresStr) {
      try {
        const refrigeradores = JSON.parse(refrigeradoresStr);
        this.stats.alertasPendientes = refrigeradores.filter(
          (r: any) => r.estado === 'Alerta'
        ).length;
      } catch (error) {
        console.error('Error al cargar refrigeradores:', error);
      }
    }

    this.stats.totalUsuarios = 1;
  }

  verificarNotificaciones() {
    const refrigeradoresStr = localStorage.getItem('monitoreo_refrigeradores');
    if (refrigeradoresStr) {
      try {
        const refrigeradores = JSON.parse(refrigeradoresStr);
        const alertasTemperatura = refrigeradores.filter((r: any) => r.estado === 'Alerta');

        if (alertasTemperatura.length > 0) {
          this.notificationService.warning(
            `⚠️ ${alertasTemperatura.length} refrigerador(es) con alertas de temperatura`
          );
        }
      } catch (error) {
        console.error('Error al verificar refrigeradores:', error);
      }
    }

    if (this.stats.reservasHoy > 0) {
      this.notificationService.info(
        `📅 Tienes ${this.stats.reservasHoy} reserva${
          this.stats.reservasHoy > 1 ? 's' : ''
        } para hoy`
      );
    }
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

    this.notificationService.success(`${saludo}, ${this.pacienteData.Nombre_paciente}! 👋`);
  }

  mostrarNotificaciones() {
    this.notificationService.info('🔔 Sistema de notificaciones activo');
  }

  get notificacionesPendientes(): number {
    return this.stats.alertasPendientes + this.stats.reservasPendientes;
  }

  irARecurso(recursoId: number): void {
    console.log('Navegando a recurso:', recursoId);
    this.notificationService.info(`📚 Abriendo recurso #${recursoId}`);
  }

  reservarSala(): void {
    this.cambiarSeccion('Salas');
  }

  registrarExtraccion(): void {
    this.cambiarSeccion('control');
  }

  buscarSala(): void {
    this.cambiarSeccion('Salas');
  }

  verReservas(): void {
    this.cambiarSeccion('Reservas');
  }

  verMonitoreo(): void {
    this.cambiarSeccion('Monitoreo');
  }

  abrirChatbot(): void {
    this.cambiarSeccion('chatbot');
  }
}
