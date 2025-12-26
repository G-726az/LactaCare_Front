import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UsuarioSesion } from '../../../../core/models/database.models';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { WelcomeModalComponent } from '../../../../shared/components/modals/welcome-modal/welcome-modal.component';
import { ReportModalComponent } from '../../../../shared/components/modals/report-modal/report-modal.component';
import { ProfileModalComponent } from '../../../../shared/components/modals/profile-modal/profile-modal.component';
import { LactariosReportModalComponent } from '../../../../shared/components/modals/lactarios-report-modal/lactarios-report-modal.component';
import { ExtraccionesReportModalComponent } from '../../../../shared/components/modals/extracciones-report-modal/extracciones-report-modal.component';
import { TemperaturaReportModalComponent } from '../../../../shared/components/modals/temperatura-report-modal/temperatura-report-modal.component';
import { FooterMedicoComponent } from '../../../../shared/components/footer/footer-medico.component';
import { HeaderMedicoComponent } from '../../../../shared/components/header/header-medico.component';

// Componentes de secciones
import { DashboardSectionComponent } from './components dashboard/dashboard-section/dashboard-section.component';
import { LactariosSectionComponent } from './components dashboard/lactarios-section/lactarios-section.component';
import { RefrigeradoresSectionComponent } from './components dashboard/refrigeradores-section/refrigeradores-section.component';
import { TemperaturaSectionComponent } from './components dashboard/temperatura-section/temperatura-section.component';
import { ExtraccionesSectionComponent } from './components dashboard/extracciones-section/extracciones-section.component';
import { ReportesSectionComponent } from './components dashboard/reportes-section/reportes-section.component';
import { SidebarComponent } from './components dashboard/sidebar/sidebar.component';
@Component({
  selector: 'app-universal-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    WelcomeModalComponent,
    ReportModalComponent,
    ProfileModalComponent,
    LactariosReportModalComponent,
    ExtraccionesReportModalComponent,
    TemperaturaReportModalComponent,
    FooterMedicoComponent,
    HeaderMedicoComponent,
    // Componentes de secciones
    DashboardSectionComponent,
    LactariosSectionComponent,
    RefrigeradoresSectionComponent,
    TemperaturaSectionComponent,
    ExtraccionesSectionComponent,
    ReportesSectionComponent,
    SidebarComponent
  ],
  templateUrl: './universal-dashboard.component.html',
  styleUrls: ['./universal-dashboard.component.scss']
})
export class UniversalDashboardComponent implements OnInit, OnDestroy {
  // Datos del usuario obtenidos de localStorage
  userData: UsuarioSesion | null = null;
  
  // Estados para modales
  showWelcomeModal = false;
  showReportModal = false;
  showProfileModal = false;
  showLactariosReportModal = false;
  showExtraccionesReportModal = false;
  showTemperaturaReportModal = false;
  showLactariosDetails = false;
  
  // Variables para reportes
  currentReportData: any = null;
  currentExtraccionesReportData: any = null;
  currentReportType: 'temperatura' | 'extracciones' | 'lactarios' = 'lactarios';
  
  // Configuración para médico
  roleConfig = {
    permissions: {
      verLactarios: true,
      verRefrigeradores: true,
      verReservas: true,
      verExtracciones: true,
      verReportes: true,
      registrarAtenciones: true,
      monitorearTemperatura: true,
      verMiInformacion: true
    },
    menuItems: [
      { icon: 'fas fa-home', label: 'Dashboard', seccion: 'dashboard' },
      { icon: 'fas fa-baby', label: 'Lactarios', seccion: 'lactarios' },
      { icon: 'fas fa-prescription-bottle', label: 'Extracciones', seccion: 'extracciones' },
      { icon: 'fas fa-thermometer-half', label: 'Temperatura', seccion: 'temperatura' },
      { icon: 'fas fa-chart-line', label: 'Reportes', seccion: 'reportes' }
    ],
    colorTheme: 'blue',
    title: 'Panel Médico',
    icon: 'fa-user-md'
  };
  
  // Datos del dashboard
  estadisticas = {
    totalLactarios: 2,
    refrigeradoresActivos: 3,
    reservasHoy: 0,
    extraccionesHoy: 2,
    temperaturaPromedio: '4.2°C',
    alertasActivas: 1
  };
  
  // DATOS DE EJEMPLO
  lactarios = [
    { 
      Id_Lactario: 1, 
      Nombre_CMedico: 'Lactario Central', 
      Direccion_CMedico: 'Av. Amazonas N23-45', 
      Telefono_CMedico: '022222222',
      horario: '08:00 - 18:00',
      capacidadTotal: 100,
      temperaturaPromedio: '4.2°C',
      estado: 'Activo',
      tipo: 'General',
      observaciones: ''
    },
    { 
      Id_Lactario: 2, 
      Nombre_CMedico: 'Lactario Pediátrico', 
      Direccion_CMedico: 'Av. Patria N45-67', 
      Telefono_CMedico: '023333333',
      horario: '08:00 - 18:00',
      capacidadTotal: 40,
      temperaturaPromedio: '6.2°C',
      estado: 'Activo',
      tipo: 'Pediatrico',
      observaciones: ''
    }
  ];
  
  refrigeradores = [
    { 
      Id_refrigerador: 1, 
      Id_Lactario: 1, 
      Capacidad_max_refri: 50, 
      Piso_refrigerador: 1, 
      temperaturaActual: '4.0°C', 
      estado: 'Óptimo',
      ultimaActualizacion: new Date()
    },
    { 
      Id_refrigerador: 2, 
      Id_Lactario: 1, 
      Capacidad_max_refri: 50, 
      Piso_refrigerador: 1, 
      temperaturaActual: '4.5°C', 
      estado: 'Óptimo',
      ultimaActualizacion: new Date()
    },
    { 
      Id_refrigerador: 3, 
      Id_Lactario: 2, 
      Capacidad_max_refri: 40, 
      Piso_refrigerador: 1, 
      temperaturaActual: '6.2°C', 
      estado: 'Alerta',
      ultimaActualizacion: new Date()
    }
  ];
  
  extracciones = [
    { 
      Id_contenedor: 1, 
      Id_paciente: 1, 
      Cantidad_contendor: 120, 
      Fechaextraccion_contenedor: new Date(), 
      Estado_contenedor: 'Almacenado',
      observaciones: '',
      Lactario: 'Central'
    },
    { 
      Id_contenedor: 2, 
      Id_paciente: 2, 
      Cantidad_contendor: 90, 
      Fechaextraccion_contenedor: new Date(), 
      Estado_contenedor: 'Almacenado',
      observaciones: '',
      Lactario: 'Pediátrico'
    },
    { 
      Id_contenedor: 3, 
      Id_paciente: 3, 
      Cantidad_contendor: 150, 
      Fechaextraccion_contenedor: new Date(), 
      Estado_contenedor: 'Almacenado',
      observaciones: '',
      Lactario: 'Central'
    },
    { 
      Id_contenedor: 4, 
      Id_paciente: 4, 
      Cantidad_contendor: 80, 
      Fechaextraccion_contenedor: new Date(Date.now() - 86400000),
      Estado_contenedor: 'Consumido',
      observaciones: '',
      Lactario: 'Pediátrico'
    },
    { 
      Id_contenedor: 5, 
      Id_paciente: 5, 
      Cantidad_contendor: 200, 
      Fechaextraccion_contenedor: new Date(Date.now() - 172800000),
      Estado_contenedor: 'Almacenado',
      observaciones: '',
      Lactario: 'Central'
    }
  ];
  
  // Estado UI
  menuAbierto = true;
  seccionActiva = 'dashboard';
  private temperaturaInterval: any;

  constructor(
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Obtener datos del usuario desde localStorage
    this.cargarUsuarioDesdeLocalStorage();
    
    if (this.userData) {
      this.cargarDatosIniciales();
      this.iniciarMonitoreoTemperatura();
      
      // Mostrar bienvenida con SweetAlert2 después de 1 segundo
      setTimeout(() => {
        this.mostrarBienvenidaSweetAlert();
      }, 1000);
    } else {
      // Si no hay usuario, usar datos de ejemplo para desarrollo
      this.userData = this.getUsuarioEjemplo();
      
      // Mostrar bienvenida de ejemplo
      setTimeout(() => {
        this.mostrarBienvenidaSweetAlert();
      }, 1000);
    }

    // Suscribirse al servicio de modales
    this.modalService.modal$.subscribe((modal) => {
      if (modal.type === 'welcome') {
        // No mostrar automáticamente, ya usamos SweetAlert2
      } else if (modal.type === 'report') {
        this.showReportModal = true;
      } else if (modal.type === 'profile') {
        this.showProfileModal = true;
      } else if (modal.type === 'lactarios-report') {
        this.showLactariosReportModal = true;
      } else if (modal.type === 'extracciones-report') {
        this.showExtraccionesReportModal = true;
      } else if (modal.type === 'temperatura-report') {
        this.showTemperaturaReportModal = true;
      } else if (modal.type === 'close') {
        this.closeAllModals();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.temperaturaInterval) {
      clearInterval(this.temperaturaInterval);
    }
  }
  
  // Método para mostrar bienvenida con SweetAlert2
  private mostrarBienvenidaSweetAlert(): void {
    if (this.userData) {
      Swal.fire({
        title: `¡Bienvenido/a, ${this.userData.nombre_completo}!`,
        html: `
          <div class="text-left">
            <div class="mb-3">
              <i class="fas fa-user-md mr-2"></i>
              <strong>Rol:</strong> ${this.userData.rol}
            </div>
            <div class="mb-3">
              <i class="fas fa-calendar-check mr-2"></i>
              <strong>Último acceso:</strong> ${new Date().toLocaleDateString('es-ES')}
            </div>
            <hr class="my-3">
            <div class="mt-3">
              <p><i class="fas fa-check-circle text-success mr-2"></i> Acceso como médico especialista</p>
              <p><i class="fas fa-check-circle text-success mr-2"></i> Puedes ver lactarios, extracciones y temperatura de refrigeradores</p>
              <p><i class="fas fa-check-circle text-success mr-2"></i> Generar reportes médicos</p>
              <p><i class="fas fa-check-circle text-success mr-2"></i> Registrar nuevas extracciones</p>
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#1976d2',
        confirmButtonText: 'Aceptar y continuar',
        width: '600px',
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        }
      });
    }
  }
  
  cargarUsuarioDesdeLocalStorage(): void {
    try {
      const usuarioGuardado = localStorage.getItem('lactaCareUser');
      if (usuarioGuardado) {
        this.userData = JSON.parse(usuarioGuardado);
      }
    } catch (error) {
      console.error('Error al cargar usuario desde localStorage:', error);
      this.userData = this.getUsuarioEjemplo();
    }
  }
  
  getUsuarioEjemplo(): UsuarioSesion {
    return {
      id_usuario: 1,
      primer_nombre: 'Carlos',
      segundo_nombre: '',
      primer_apellido: 'Ruiz',
      segundo_apellido: '',
      cedula: '1723456789',
      correo: 'c.ruiz@lactacare.com',
      telefono: '0987654321',
      fecha_nacimiento: '1978-11-22',
      rol: 'Médico',
      nombre_completo: 'Carlos Ruiz',
      usuario: 'c.ruiz',
      estado: 'Activo',
      fecha_registro: new Date().toISOString(),
      ultimo_acceso: new Date().toISOString()
    };
  }
  
  cargarDatosIniciales(): void {
    // Calcular estadísticas
    this.estadisticas.totalLactarios = this.lactarios.length;
    this.estadisticas.refrigeradoresActivos = this.refrigeradores.length;
    
    const hoy = new Date().toDateString();
    this.estadisticas.extraccionesHoy = this.extracciones.filter(e => 
      new Date(e.Fechaextraccion_contenedor).toDateString() === hoy
    ).length;
    
    // Calcular temperatura promedio
    this.calcularTemperaturaPromedio();
  }
  
  // Métodos de UI
  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    // Ocultar detalles al cambiar de sección
    if (seccion !== 'reportes') {
      this.showLactariosDetails = false;
    }
  }
  
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }
  
  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres salir del sistema?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-popup-custom',
        container: 'swal2-container-custom'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('lactaCareUser');
        window.location.reload();
      }
    });
  }
  
  // Métodos de verificación de permisos
  tienePermiso(permiso: keyof typeof this.roleConfig.permissions): boolean {
    return this.roleConfig.permissions[permiso];
  }
  
  tienePermisoParaSeccion(): boolean {
    // Verificar si el usuario tiene permiso para la sección activa
    switch(this.seccionActiva) {
      case 'lactarios': return this.tienePermiso('verLactarios');
      case 'refrigeradores': return this.tienePermiso('verRefrigeradores');
      case 'temperatura': return this.tienePermiso('monitorearTemperatura');
      case 'extracciones': return this.tienePermiso('verExtracciones');
      case 'reportes': return this.tienePermiso('verReportes');
      case 'dashboard': return true;
      default: return true;
    }
  }
  
  // Método para parsear temperatura
  getTemperaturaNumero(temperaturaStr: string): number {
    return parseFloat(temperaturaStr.replace('°C', ''));
  }
  
  calcularTemperaturaPromedio(): void {
    const totalTemp = this.refrigeradores.reduce((sum, ref) => {
      return sum + this.getTemperaturaNumero(ref.temperaturaActual);
    }, 0);
    
    const promedio = totalTemp / this.refrigeradores.length;
    this.estadisticas.temperaturaPromedio = promedio.toFixed(1) + '°C';
  }
  
  // Método para obtener refrigeradores por lactario
  getRefrigeradoresPorLactario(idLactario: number): number {
    return this.refrigeradores.filter(ref => ref.Id_Lactario === idLactario).length;
  }
  
  // Método para obtener capacidad por lactario
  getCapacidadPorLactario(idLactario: number): number {
    const refs = this.refrigeradores.filter(ref => ref.Id_Lactario === idLactario);
    return refs.reduce((total, ref) => total + ref.Capacidad_max_refri, 0);
  }
  
  // Método para obtener extracciones por lactario
  getExtraccionesPorLactario(idLactario: number): number {
    const hoy = new Date().toDateString();
    return this.extracciones.filter(e => {
      const lactarioAsignado = e.Id_contenedor % 2 === 0 ? 2 : 1;
      return lactarioAsignado === idLactario && 
             new Date(e.Fechaextraccion_contenedor).toDateString() === hoy;
    }).length;
  }

  // Métodos para manejar acciones
  verMiInformacion(): void {
    if (this.userData) {
      this.showProfileModal = true;
    } else {
      // Cargar datos de ejemplo si no hay usuario
      this.userData = this.getUsuarioEjemplo();
      this.showProfileModal = true;
    }
  }
  
  onProfileUpdated(updatedProfile: any): void {
    if (this.userData) {
      Object.assign(this.userData, updatedProfile);
      localStorage.setItem('lactaCareUser', JSON.stringify(this.userData));
      
      Swal.fire({
        title: '¡Perfil Actualizado!',
        text: 'Tu perfil ha sido actualizado exitosamente',
        icon: 'success',
        confirmButtonColor: '#1976d2',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        }
      });
    }
  }
  
  // Métodos para controlar modales
  closeAllModals(): void {
    this.showWelcomeModal = false;
    this.showReportModal = false;
    this.showProfileModal = false;
    this.showLactariosReportModal = false;
    this.showExtraccionesReportModal = false;
    this.showTemperaturaReportModal = false;
  }
  
  getTemperaturaClass(temperatura: string): string {
    const tempNum = this.getTemperaturaNumero(temperatura);
    if (tempNum > 7) return 'temp-critica';
    if (tempNum > 5) return 'temp-alerta';
    return 'temp-optima';
  }
  
  getTiempoDesde(fecha: Date): string {
    const ahora = new Date();
    const diffMs = ahora.getTime() - new Date(fecha).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
    return `Hace ${Math.floor(diffMins / 1440)} d`;
  }

  getReportData() {
    return {
      fecha: new Date().toISOString(),
      medico: this.userData?.nombre_completo || 'Dr. Carlos Ruiz',
      lactariosActivos: this.estadisticas.totalLactarios,
      refrigeradores: this.estadisticas.refrigeradoresActivos,
      temperaturaPromedio: this.estadisticas.temperaturaPromedio,
      alertasActivas: this.estadisticas.alertasActivas
    };
  }

  toggleLactariosDetails(): void {
    this.showLactariosDetails = !this.showLactariosDetails;
  }

  // Método para obtener datos del reporte de lactarios
  getLactariosReportData(periodo: string): any {
    const fecha = new Date();
    
    return {
      fecha: fecha.toISOString(),
      periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
      medico: this.userData?.nombre_completo || 'Dr. Médico',
      totalLactarios: this.lactarios.length,
      totalRefrigeradores: this.refrigeradores.length,
      capacidadTotal: this.refrigeradores.reduce((sum, ref) => sum + ref.Capacidad_max_refri, 0),
      lactarios: this.lactarios.map(lactario => {
        const refrigeradores = this.refrigeradores.filter(ref => ref.Id_Lactario === lactario.Id_Lactario);
        const capacidadTotal = refrigeradores.reduce((sum, ref) => sum + ref.Capacidad_max_refri, 0);
        const temperaturaPromedio = refrigeradores.length > 0 
          ? (refrigeradores.reduce((sum, ref) => sum + this.getTemperaturaNumero(ref.temperaturaActual), 0) / refrigeradores.length).toFixed(1) + '°C'
          : 'N/A';
        
        return {
          ...lactario,
          refrigeradores: refrigeradores.length,
          capacidadTotal,
          temperaturaPromedio,
          estado: refrigeradores.every(ref => ref.estado === 'Óptimo') ? 'Óptimo' : 'Revisión'
        };
      }),
      estadisticas: {
        temperaturaPromedioSistema: this.estadisticas.temperaturaPromedio,
        alertasActivas: this.estadisticas.alertasActivas,
        refrigeradoresOptimos: this.refrigeradores.filter(ref => ref.estado === 'Óptimo').length,
        refrigeradoresAlerta: this.refrigeradores.filter(ref => ref.estado === 'Alerta').length,
        refrigeradoresCriticos: this.refrigeradores.filter(ref => ref.estado === 'Crítico').length
      }
    };
  }

  // Método para obtener datos del reporte de temperatura
  getTemperaturaReportData(periodo: string): any {
    const fecha = new Date();
    
    return {
      fecha: fecha.toISOString(),
      periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
      medico: this.userData?.nombre_completo || 'Dr. Médico',
      temperaturaPromedio: this.estadisticas.temperaturaPromedio,
      totalRefrigeradores: this.refrigeradores.length,
      refrigeradores: this.refrigeradores.map(ref => ({
        ...ref,
        ultimaActualizacion: new Date()
      })),
      estadisticas: {
        refrigeradoresOptimos: this.refrigeradores.filter(ref => ref.estado === 'Óptimo').length,
        refrigeradoresAlerta: this.refrigeradores.filter(ref => ref.estado === 'Alerta').length,
        refrigeradoresCriticos: this.refrigeradores.filter(ref => ref.estado === 'Crítico').length
      }
    };
  }

  // Método para obtener datos del reporte de extracciones
  getExtraccionesReportData(periodo: string): any {
    const fecha = new Date();
    
    // Filtrar extracciones según el período
    let extraccionesFiltradas = [...this.extracciones];
    const hoy = new Date();
    
    switch(periodo) {
      case 'hoy':
        extraccionesFiltradas = this.extracciones.filter(e => 
          new Date(e.Fechaextraccion_contenedor).toDateString() === hoy.toDateString()
        );
        break;
      case 'semanal':
        const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        extraccionesFiltradas = this.extracciones.filter(e => 
          new Date(e.Fechaextraccion_contenedor) >= hace7Dias
        );
        break;
      case 'mensual':
        const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
        extraccionesFiltradas = this.extracciones.filter(e => 
          new Date(e.Fechaextraccion_contenedor) >= hace30Dias
        );
        break;
    }
    
    const volumenTotal = extraccionesFiltradas.reduce((sum, e) => sum + e.Cantidad_contendor, 0);
    const dias = periodo === 'hoy' ? 1 : periodo === 'semanal' ? 7 : 30;
    
    return {
      fecha: fecha.toISOString(),
      periodo: periodo.charAt(0).toUpperCase() + periodo.slice(1),
      medico: this.userData?.nombre_completo || 'Dr. Médico',
      totalExtracciones: extraccionesFiltradas.length,
      volumenTotal: volumenTotal,
      promedioDiario: Math.round(volumenTotal / dias),
      extracciones: extraccionesFiltradas.map(e => ({
        ...e,
        Lactario: e.Id_contenedor % 2 === 0 ? 'Pediátrico' : 'Central',
        Paciente: `Paciente ${e.Id_paciente}`
      })),
      estadisticas: {
        almacenado: extraccionesFiltradas.filter(e => e.Estado_contenedor === 'Almacenado').length,
        consumido: extraccionesFiltradas.filter(e => e.Estado_contenedor === 'Consumido').length,
        descartado: extraccionesFiltradas.filter(e => e.Estado_contenedor === 'Descartado').length,
        lactarioCentral: extraccionesFiltradas.filter(e => e.Id_contenedor % 2 !== 0).length,
        lactarioPediatrico: extraccionesFiltradas.filter(e => e.Id_contenedor % 2 === 0).length
      }
    };
  }

  // Método para iniciar monitoreo de temperatura
  iniciarMonitoreoTemperatura(): void {
    if (this.tienePermiso('monitorearTemperatura')) {
      this.temperaturaInterval = setInterval(() => {
        this.refrigeradores.forEach(ref => {
          const tempActual = this.getTemperaturaNumero(ref.temperaturaActual);
          const variacion = (Math.random() * 0.6) - 0.3;
          let nuevaTemp = Math.max(2, Math.min(8, tempActual + variacion));
          
          ref.temperaturaActual = nuevaTemp.toFixed(1) + '°C';
          ref.ultimaActualizacion = new Date();
          
          if (nuevaTemp > 7) {
            ref.estado = 'Crítico';
            Swal.fire({
              title: '⚠️ Temperatura Crítica',
              text: `Refrigerador ${ref.Id_refrigerador} tiene temperatura crítica: ${nuevaTemp.toFixed(1)}°C`,
              icon: 'warning',
              confirmButtonColor: '#dc3545',
              confirmButtonText: 'Entendido',
              customClass: {
                popup: 'swal2-popup-custom',
                container: 'swal2-container-custom'
              }
            });
          } else if (nuevaTemp > 5) {
            ref.estado = 'Alerta';
          } else {
            ref.estado = 'Óptimo';
          }
        });
        
        this.calcularTemperaturaPromedio();
        this.estadisticas.alertasActivas = this.refrigeradores.filter(ref => 
          ref.estado === 'Alerta' || ref.estado === 'Crítico'
        ).length;
        
      }, 30000);
    }
  }

  // Notificar al usuario
  notifyUser(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: type,
      timer: 3000,
      showConfirmButton: false,
      customClass: {
        popup: 'swal2-popup-custom',
        container: 'swal2-container-custom'
      }
    });
  }

  // Métodos que faltan
  cargarEstadisticas(): void {
    this.cargarDatosIniciales();
    this.notifyUser('Estadísticas Actualizadas', 'Las estadísticas han sido actualizadas correctamente', 'success');
  }

  registrarExtraccion(): void {
    if (this.tienePermiso('registrarAtenciones')) {
      Swal.fire({
        title: 'Registrar Extracción',
        html: '<p>Ingrese la cantidad en mililitros (ml):</p>',
        input: 'number',
        inputLabel: 'Cantidad (ml)',
        inputPlaceholder: 'Ej: 150',
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#6c757d',
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        },
        inputValidator: (value) => {
          if (!value) {
            return 'Debe ingresar una cantidad';
          }
          if (parseFloat(value) <= 0) {
            return 'La cantidad debe ser mayor a 0';
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const cantidad = result.value;
          Swal.fire({
            title: '¡Extracción Registrada!',
            text: `Se registró exitosamente una extracción de ${cantidad} ml`,
            icon: 'success',
            confirmButtonColor: '#1976d2',
            confirmButtonText: 'Aceptar',
            customClass: {
              popup: 'swal2-popup-custom',
              container: 'swal2-container-custom'
            }
          });
        }
      });
    }
  }

  monitorearTemperatura(): void {
    if (this.tienePermiso('monitorearTemperatura')) {
      Swal.fire({
        title: 'Monitoreando Temperatura',
        text: 'Actualizando datos de temperatura de refrigeradores...',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        }
      }).then(() => {
        Swal.fire({
          title: 'Datos Actualizados',
          text: 'La información de temperatura ha sido actualizada',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#1976d2',
          customClass: {
            popup: 'swal2-popup-custom',
            container: 'swal2-container-custom'
          }
        });
      });
    }
  }

  generarReporte(): void {
    if (this.tienePermiso('verReportes')) {
      this.showReportModal = true;
    }
  }

  generarReporteLactarios(): void {
    if (this.tienePermiso('verReportes')) {
      Swal.fire({
        title: 'Generar Reporte de Lactarios',
        html: `
          <div class="text-left">
            <p class="mb-3">Seleccione el período del reporte:</p>
            <div class="mb-4">
              <label class="block mb-2">
                <input type="radio" name="periodoLactarios" value="hoy" checked class="mr-2">
                Hoy
              </label>
              <label class="block mb-2">
                <input type="radio" name="periodoLactarios" value="semanal" class="mr-2">
                Semanal
              </label>
              <label class="block mb-2">
                <input type="radio" name="periodoLactarios" value="mensual" class="mr-2">
                Mensual
              </label>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Generar Reporte',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        },
        preConfirm: () => {
          const periodo = (document.querySelector('input[name="periodoLactarios"]:checked') as HTMLInputElement)?.value;
          return { periodo };
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const { periodo } = result.value;
          
          // Mostrar loading
          Swal.fire({
            title: 'Generando Reporte...',
            text: 'Por favor espera un momento',
            allowOutsideClick: false,
            showConfirmButton: false,
            customClass: {
              popup: 'swal2-popup-custom',
              container: 'swal2-container-custom'
            },
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          // Simular generación de reporte
          setTimeout(() => {
            Swal.close();
            
            // Crear datos del reporte
            const reportData = this.getLactariosReportData(periodo);
            
            // Mostrar modal de reporte de lactarios
            this.showLactariosReportModal = true;
            this.currentReportData = reportData;
            this.currentReportType = 'lactarios';
            
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '✅ Reporte Generado',
              text: 'El reporte de lactarios ha sido generado exitosamente',
              icon: 'success',
              confirmButtonColor: '#1976d2',
              confirmButtonText: 'Ver Reporte',
              customClass: {
                popup: 'swal2-popup-custom',
                container: 'swal2-container-custom'
              }
            });
          }, 1500);
        }
      });
    }
  }

  generarReporteTemperatura(): void {
    if (this.tienePermiso('verReportes')) {
      Swal.fire({
        title: 'Generar Reporte de Temperatura',
        html: `
          <div class="text-left">
            <p class="mb-3">Seleccione el período del reporte:</p>
            <div class="mb-4">
              <label class="block mb-2">
                <input type="radio" name="periodoTemperatura" value="hoy" checked class="mr-2">
                Hoy
              </label>
              <label class="block mb-2">
                <input type="radio" name="periodoTemperatura" value="semanal" class="mr-2">
                Semanal
              </label>
              <label class="block mb-2">
                <input type="radio" name="periodoTemperatura" value="mensual" class="mr-2">
                Mensual
              </label>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Generar Reporte',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        },
        preConfirm: () => {
          const periodo = (document.querySelector('input[name="periodoTemperatura"]:checked') as HTMLInputElement)?.value;
          return { periodo };
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const { periodo } = result.value;
          
          // Mostrar loading
          Swal.fire({
            title: 'Generando Reporte...',
            text: 'Por favor espera un momento',
            allowOutsideClick: false,
            showConfirmButton: false,
            customClass: {
              popup: 'swal2-popup-custom',
              container: 'swal2-container-custom'
            },
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          // Simular generación de reporte
          setTimeout(() => {
            Swal.close();
            
            // Crear datos del reporte
            const reportData = this.getTemperaturaReportData(periodo);
            
            // Mostrar modal de reporte de temperatura
            this.showTemperaturaReportModal = true;
            this.currentReportData = reportData;
            this.currentReportType = 'temperatura';
            
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '✅ Reporte Generado',
              text: 'El reporte de temperatura ha sido generado exitosamente',
              icon: 'success',
              confirmButtonColor: '#1976d2',
              confirmButtonText: 'Ver Reporte',
              customClass: {
                popup: 'swal2-popup-custom',
                container: 'swal2-container-custom'
              }
            });
          }, 1500);
        }
      });
    }
  }

  generarReporteExtracciones(): void {
    if (this.tienePermiso('verReportes')) {
      Swal.fire({
        title: 'Generar Reporte de Extracciones',
        html: `
          <div class="text-left">
            <p class="mb-3">Seleccione el período del reporte:</p>
            <div class="mb-4">
              <label class="block mb-2">
                <input type="radio" name="periodoExtracciones" value="hoy" checked class="mr-2">
                Hoy
              </label>
              <label class="block mb-2">
                <input type="radio" name="periodoExtracciones" value="semanal" class="mr-2">
                Semanal
              </label>
              <label class="block mb-2">
                <input type="radio" name="periodoExtracciones" value="mensual" class="mr-2">
                Mensual
              </label>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Generar Reporte',
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'swal2-popup-custom',
          container: 'swal2-container-custom'
        },
        preConfirm: () => {
          const periodo = (document.querySelector('input[name="periodoExtracciones"]:checked') as HTMLInputElement)?.value;
          return { periodo };
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const { periodo } = result.value;
          
          // Mostrar loading
          Swal.fire({
            title: 'Generando Reporte...',
            text: 'Por favor espera un momento',
            allowOutsideClick: false,
            showConfirmButton: false,
            customClass: {
              popup: 'swal2-popup-custom',
              container: 'swal2-container-custom'
            },
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          // Simular generación de reporte
          setTimeout(() => {
            Swal.close();
            
            // Crear datos del reporte
            const reportData = this.getExtraccionesReportData(periodo);
            
            // Mostrar modal de reporte de extracciones
            this.showExtraccionesReportModal = true;
            this.currentExtraccionesReportData = reportData;
            
            // Mostrar mensaje de éxito
            Swal.fire({
              title: '✅ Reporte Generado',
              text: 'El reporte de extracciones ha sido generado exitosamente',
              icon: 'success',
              confirmButtonColor: '#1976d2',
              confirmButtonText: 'Ver Reporte',
              customClass: {
                popup: 'swal2-popup-custom',
                container: 'swal2-container-custom'
              }
            });
          }, 1500);
        }
      });
    }
  }

  verDetalleLactario(lactario: any): void {
    const refrigeradores = this.refrigeradores.filter(ref => ref.Id_Lactario === lactario.Id_Lactario);
    const capacidadTotal = refrigeradores.reduce((sum, ref) => sum + ref.Capacidad_max_refri, 0);
    const temperaturaPromedio = refrigeradores.length > 0 
      ? (refrigeradores.reduce((sum, ref) => sum + this.getTemperaturaNumero(ref.temperaturaActual), 0) / refrigeradores.length).toFixed(1) + '°C'
      : 'N/A';
    
    Swal.fire({
      title: '🏥 Detalle de Lactario',
      html: `
        <div class="text-left">
          <div class="detail-section mb-4">
            <h4 class="text-primary mb-2">Información General</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>ID Lactario:</strong>
                <span>#${lactario.Id_Lactario}</span>
              </div>
              <div class="detail-item">
                <strong>Nombre:</strong>
                <span>${lactario.Nombre_CMedico}</span>
              </div>
              <div class="detail-item">
                <strong>Estado:</strong>
                <span class="badge badge-success">${lactario.estado || 'Activo'}</span>
              </div>
              <div class="detail-item">
                <strong>Horario:</strong>
                <span>${lactario.horario || '08:00 - 18:00'}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section mb-4">
            <h4 class="text-primary mb-2">Ubicación y Contacto</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong><i class="fas fa-map-marker-alt"></i> Dirección:</strong>
                <span>${lactario.Direccion_CMedico}</span>
              </div>
              <div class="detail-item">
                <strong><i class="fas fa-phone"></i> Teléfono:</strong>
                <span>${lactario.Telefono_CMedico}</span>
              </div>
              <div class="detail-item">
                <strong><i class="fas fa-clock"></i> Horario Atención:</strong>
                <span>${lactario.horario || '08:00 - 18:00'}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section mb-4">
            <h4 class="text-primary mb-2">Estadísticas</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Refrigeradores:</strong>
                <span>${refrigeradores.length} unidades</span>
              </div>
              <div class="detail-item">
                <strong>Capacidad Total:</strong>
                <span>${capacidadTotal}L</span>
              </div>
              <div class="detail-item">
                <strong>Temperatura Promedio:</strong>
                <span>${temperaturaPromedio}</span>
              </div>
              <div class="detail-item">
                <strong>Extracciones Hoy:</strong>
                <span>${this.getExtraccionesPorLactario(lactario.Id_Lactario)}</span>
              </div>
            </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '700px',
      customClass: {
        popup: 'swal2-popup-custom',
        container: 'swal2-container-custom'
      }
    });
  }

  editarLactario(lactario: any): void {
    const refrigeradores = this.refrigeradores.filter(ref => ref.Id_Lactario === lactario.Id_Lactario);
    
    Swal.fire({
      title: '✏️ Editar Lactario',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <p class="mb-2"><strong>Lactario:</strong> ${lactario.Nombre_CMedico}</p>
            <p><strong>ID:</strong> #${lactario.Id_Lactario}</p>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Nombre del Lactario</label>
            <input type="text" 
                   id="nombreEdit" 
                   class="swal2-input" 
                   value="${lactario.Nombre_CMedico}"
                   placeholder="Ej: Lactario Central">
          </div>
          
          <div class="mb-4">
            <label class="form-label">Dirección</label>
            <input type="text" 
                   id="direccionEdit" 
                   class="swal2-input" 
                   value="${lactario.Direccion_CMedico}"
                   placeholder="Av. Amazonas N23-45">
          </div>
          
          <div class="mb-4">
            <label class="form-label">Teléfono</label>
            <input type="tel" 
                   id="telefonoEdit" 
                   class="swal2-input" 
                   value="${lactario.Telefono_CMedico}"
                   placeholder="022222222">
          </div>
          
          <div class="mb-4">
            <label class="form-label">Horario de Atención</label>
            <input type="text" 
                   id="horarioEdit" 
                   class="swal2-input" 
                   value="${lactario.horario || '08:00 - 18:00'}"
                   placeholder="08:00 - 18:00">
          </div>
          
          <div class="mb-4">
            <label class="form-label">Capacidad Total (L)</label>
            <input type="number" 
                   id="capacidadEdit" 
                   class="swal2-input" 
                   value="${lactario.capacidadTotal || refrigeradores.reduce((sum, ref) => sum + ref.Capacidad_max_refri, 0)}"
                   min="1"
                   max="1000"
                   step="10">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const nombre = (document.getElementById('nombreEdit') as HTMLInputElement)?.value;
        const direccion = (document.getElementById('direccionEdit') as HTMLInputElement)?.value;
        const telefono = (document.getElementById('telefonoEdit') as HTMLInputElement)?.value;
        const horario = (document.getElementById('horarioEdit') as HTMLInputElement)?.value;
        const capacidad = (document.getElementById('capacidadEdit') as HTMLInputElement)?.value;
        
        // Validaciones
        if (!nombre?.trim()) {
          Swal.showValidationMessage('El nombre del lactario es requerido');
          return false;
        }
        
        if (!direccion?.trim()) {
          Swal.showValidationMessage('La dirección es requerida');
          return false;
        }
        
        if (!telefono?.trim()) {
          Swal.showValidationMessage('El teléfono es requerido');
          return false;
        }
        
        if (!/^\d{7,10}$/.test(telefono.replace(/\D/g, ''))) {
          Swal.showValidationMessage('Ingrese un número de teléfono válido');
          return false;
        }
        
        if (!horario?.trim()) {
          Swal.showValidationMessage('El horario es requerido');
          return false;
        }
        
        return { nombre, direccion, telefono, horario, capacidad };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { nombre, direccion, telefono, horario, capacidad } = result.value;
        
        // Actualizar el lactario en el array
        const index = this.lactarios.findIndex(l => l.Id_Lactario === lactario.Id_Lactario);
        if (index !== -1) {
          this.lactarios[index] = {
            ...this.lactarios[index],
            Nombre_CMedico: nombre,
            Direccion_CMedico: direccion,
            Telefono_CMedico: telefono,
            horario: horario,
            capacidadTotal: parseInt(capacidad)
          };
        }
        
        Swal.fire({
          title: '✅ Lactario Actualizado',
          html: `
            <div class="text-center">
              <p>El lactario <strong>"${nombre}"</strong> ha sido actualizado exitosamente.</p>
              <div class="mt-3">
                <p><strong>Nuevos datos:</strong></p>
                <p><i class="fas fa-map-marker-alt"></i> ${direccion}</p>
                <p><i class="fas fa-phone"></i> ${telefono}</p>
                <p><i class="fas fa-clock"></i> ${horario}</p>
                <p><i class="fas fa-box"></i> Capacidad: ${capacidad}L</p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#1976d2',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  agregarLactario(): void {
    Swal.fire({
      title: '➕ Agregar Nuevo Lactario',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <label class="form-label">Nombre del Lactario *</label>
            <input type="text" 
                   id="nombreNuevo" 
                   class="swal2-input" 
                   placeholder="Ej: Lactario Maternidad"
                   required>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Dirección *</label>
            <input type="text" 
                   id="direccionNuevo" 
                   class="swal2-input" 
                   placeholder="Av. Principal N123-45"
                   required>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Teléfono *</label>
            <input type="tel" 
                   id="telefonoNuevo" 
                   class="swal2-input" 
                   placeholder="022333444"
                   required>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Horario de Atención *</label>
            <input type="text" 
                   id="horarioNuevo" 
                   class="swal2-input" 
                   placeholder="08:00 - 18:00"
                   value="08:00 - 18:00"
                   required>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Lactario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const nombre = (document.getElementById('nombreNuevo') as HTMLInputElement)?.value;
        const direccion = (document.getElementById('direccionNuevo') as HTMLInputElement)?.value;
        const telefono = (document.getElementById('telefonoNuevo') as HTMLInputElement)?.value;
        const horario = (document.getElementById('horarioNuevo') as HTMLInputElement)?.value;
        
        // Validaciones
        if (!nombre?.trim()) {
          Swal.showValidationMessage('El nombre del lactario es requerido');
          return false;
        }
        
        if (!direccion?.trim()) {
          Swal.showValidationMessage('La dirección es requerida');
          return false;
        }
        
        if (!telefono?.trim()) {
          Swal.showValidationMessage('El teléfono es requerido');
          return false;
        }
        
        if (!/^\d{7,10}$/.test(telefono.replace(/\D/g, ''))) {
          Swal.showValidationMessage('Ingrese un número de teléfono válido');
          return false;
        }
        
        if (!horario?.trim()) {
          Swal.showValidationMessage('El horario es requerido');
          return false;
        }
        
        return { nombre, direccion, telefono, horario };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { nombre, direccion, telefono, horario } = result.value;
        
        // Crear nuevo ID
        const nuevoId = Math.max(...this.lactarios.map(l => l.Id_Lactario)) + 1;
        
        // Agregar nuevo lactario
        const nuevoLactario = {
          Id_Lactario: nuevoId,
          Nombre_CMedico: nombre,
          Direccion_CMedico: direccion,
          Telefono_CMedico: telefono,
          horario: horario,
          capacidadTotal: 50,
          temperaturaPromedio: '4.0°C',
          tipo: 'General',
          estado: 'Activo',
          observaciones: ''
        };
        
        this.lactarios.push(nuevoLactario);
        
        Swal.fire({
          title: '✅ ¡Nuevo Lactario Creado!',
          html: `
            <div class="text-center">
              <div class="mb-3">
                <i class="fas fa-hospital"></i>
              </div>
              <p>El nuevo lactario <strong>"${nombre}"</strong> ha sido creado exitosamente.</p>
              <div class="mt-3">
                <p><strong>Detalles del lactario:</strong></p>
                <p><i class="fas fa-map-marker-alt"></i> ${direccion}</p>
                <p><i class="fas fa-phone"></i> ${telefono}</p>
                <p><i class="fas fa-clock"></i> ${horario}</p>
                <p><i class="fas fa-box"></i> Capacidad: 50L</p>
                <p><i class="fas fa-thermometer-half"></i> Temperatura: 4.0°C</p>
                <p>Estado: <span class="badge badge-success">Activo</span></p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#1976d2',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          // Actualizar estadísticas
          this.cargarDatosIniciales();
        });
      }
    });
  }

  verDetalleExtraccion(extraccion: any): void {
    Swal.fire({
      title: '📋 Detalle de Extracción',
      html: `
        <div class="text-left">
          <div class="detail-section mb-3">
            <h4 class="text-primary mb-2">Información General</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>ID Extracción:</strong>
                <span>#${extraccion.Id_contenedor}</span>
              </div>
              <div class="detail-item">
                <strong>ID Paciente:</strong>
                <span>${extraccion.Id_paciente}</span>
              </div>
              <div class="detail-item">
                <strong>Fecha:</strong>
                <span>${new Date(extraccion.Fechaextraccion_contenedor).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div class="detail-item">
                <strong>Lactario:</strong>
                <span>Lactario ${extraccion.Id_contenedor % 2 + 1}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section mb-3">
            <h4 class="text-primary mb-2">Datos de la Extracción</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <strong>Cantidad:</strong>
                <span class="badge badge-info">${extraccion.Cantidad_contendor} ml</span>
              </div>
              <div class="detail-item">
                <strong>Estado:</strong>
                <span class="badge ${extraccion.Estado_contenedor === 'Almacenado' ? 'badge-success' : 
                                extraccion.Estado_contenedor === 'Consumido' ? 'badge-warning' : 
                                'badge-danger'}">
                  ${extraccion.Estado_contenedor}
                </span>
              </div>
              <div class="detail-item">
                <strong>Tiempo desde extracción:</strong>
                <span>${this.getTiempoDesde(extraccion.Fechaextraccion_contenedor)}</span>
              </div>
            </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px',
      customClass: {
        popup: 'swal2-popup-custom',
        container: 'swal2-container-custom'
      }
    });
  }

  editarExtraccion(extraccion: any): void {
    Swal.fire({
      title: '✏️ Editar Extracción',
      html: `
        <div class="text-left">
          <div class="mb-4">
            <p class="mb-2"><strong>Extracción:</strong> #${extraccion.Id_contenedor}</p>
            <p class="mb-2"><strong>Paciente:</strong> ${extraccion.Id_paciente}</p>
            <p><strong>Fecha:</strong> ${new Date(extraccion.Fechaextraccion_contenedor).toLocaleDateString('es-ES')}</p>
          </div>
          
          <div class="mb-4">
            <label class="form-label">Cantidad (ml)</label>
            <input type="number" 
                   id="cantidadEdit" 
                   class="swal2-input" 
                   value="${extraccion.Cantidad_contendor}"
                   min="1"
                   max="500"
                   step="10">
          </div>
          
          <div class="mb-4">
            <label class="form-label">Estado</label>
            <select id="estadoEdit" class="swal2-select">
              <option value="Almacenado" ${extraccion.Estado_contenedor === 'Almacenado' ? 'selected' : ''}>Almacenado</option>
              <option value="Consumido" ${extraccion.Estado_contenedor === 'Consumido' ? 'selected' : ''}>Consumido</option>
              <option value="Descartado" ${extraccion.Estado_contenedor === 'Descartado' ? 'selected' : ''}>Descartado</option>
              <option value="Donado" ${extraccion.Estado_contenedor === 'Donado' ? 'selected' : ''}>Donado</option>
          </select>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar Cambios',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#1976d2',
    cancelButtonColor: '#6c757d',
    preConfirm: () => {
      const cantidad = (document.getElementById('cantidadEdit') as HTMLInputElement)?.value;
      const estado = (document.getElementById('estadoEdit') as HTMLSelectElement)?.value;
      
      // Validaciones
      if (!cantidad || parseFloat(cantidad) <= 0) {
        Swal.showValidationMessage('La cantidad debe ser mayor a 0 ml');
        return false;
      }
      
      if (parseFloat(cantidad) > 500) {
        Swal.showValidationMessage('La cantidad no puede exceder 500 ml');
        return false;
      }
      
      if (!estado) {
        Swal.showValidationMessage('Seleccione un estado');
        return false;
      }
      
      return { cantidad, estado };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { cantidad, estado } = result.value;
      
      // Actualizar la extracción en el array
      const index = this.extracciones.findIndex(e => e.Id_contenedor === extraccion.Id_contenedor);
      if (index !== -1) {
        this.extracciones[index] = {
          ...this.extracciones[index],
          Cantidad_contendor: parseInt(cantidad),
          Estado_contenedor: estado
        };
      }
      
      Swal.fire({
        title: '✅ Extracción Actualizada',
        html: `
          <div class="text-center">
            <p>La extracción #${extraccion.Id_contenedor} ha sido actualizada exitosamente.</p>
            <div class="mt-3">
              <p><strong>Nuevos datos:</strong></p>
              <p>Cantidad: <span class="badge badge-info">${cantidad} ml</span></p>
              <p>Estado: <span class="badge ${estado === 'Almacenado' ? 'badge-success' : 
                                      estado === 'Consumido' ? 'badge-warning' : 
                                      'badge-danger'}">${estado}</span></p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#1976d2',
        confirmButtonText: 'Aceptar'
      });
    }
  });
}

getTotalExtraccionesPaciente(idPaciente: number): number {
  return this.extracciones.filter(e => e.Id_paciente === idPaciente).length;
}
}