import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioSesion } from '../../../../core/models/database.models';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DialogService } from '../../../../core/services/dialog.service';
import { WelcomeModalComponent } from '../../../../shared/components/modals/welcome-modal/welcome-modal.component';
import { ReportModalComponent } from '../../../../shared/components/modals/report-modal/report-modal.component';
import { ProfileModalComponent } from '../../../../shared/components/modals/profile-modal/profile-modal.component';

@Component({
  selector: 'app-universal-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    WelcomeModalComponent,
    ReportModalComponent,
    ProfileModalComponent
  ],
  templateUrl: './universal-dashboard.component.html',
  styleUrls: ['./universal-dashboard.component.scss']
})
export class MedicoComponent implements OnInit, OnDestroy {
  @Input() userData: UsuarioSesion | null = null;
  
  // Estados para modales
  showWelcomeModal = false;
  showReportModal = false;
  showProfileModal = false;
  
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
    extraccionesHoy: 0,
    temperaturaPromedio: '4.2°C',
    alertasActivas: 1
  };
  
  // Datos de ejemplo
  lactarios = [
    { Id_Lactario: 1, Nombre_CMedico: 'Lactario Central', Direccion_CMedico: 'Av. Amazonas N23-45', Telefono_CMedico: '022222222' },
    { Id_Lactario: 2, Nombre_CMedico: 'Lactario Pediátrico', Direccion_CMedico: 'Av. Patria N45-67', Telefono_CMedico: '023333333' }
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
    { Id_contenedor: 1, Id_paciente: 1, Cantidad_contendor: 120, Fechaextraccion_contenedor: new Date(), Estado_contenedor: 'Almacenado' },
    { Id_contenedor: 2, Id_paciente: 2, Cantidad_contendor: 90, Fechaextraccion_contenedor: new Date(), Estado_contenedor: 'Almacenado' }
  ];
  
  // Estado UI
  menuAbierto = true;
  seccionActiva = 'dashboard';
  private temperaturaInterval: any;

  constructor(
    private modalService: ModalService,
    private notificationService: NotificationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    if (this.userData) {
      this.cargarDatosIniciales();
      this.iniciarMonitoreoTemperatura();
      
      // Mostrar modal de bienvenida después del login
      setTimeout(() => {
        this.showWelcomeModal = true;
      }, 500);
    }

    // Suscribirse al servicio de modales
    this.modalService.modal$.subscribe((modal) => {
      if (modal.type === 'welcome') {
        this.showWelcomeModal = true;
      } else if (modal.type === 'report') {
        this.showReportModal = true;
      } else if (modal.type === 'profile') {
        this.showProfileModal = true;
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
  }
  
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }
  
  logout(): void {
    localStorage.removeItem('lactaCareUser');
    window.location.reload();
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
  
  // Métodos específicos
  async registrarExtraccion(): Promise<void> {
    if (this.tienePermiso('registrarAtenciones')) {
      try {
        const result = await this.dialogService.input(
          'Ingrese la cantidad (ml):',
          'Registrar Extracción',
          ''
        );
        
        if (result.confirmed && result.value) {
          const cantidad = parseFloat(result.value);
          if (!isNaN(cantidad)) {
            await this.dialogService.success(
              `✅ Extracción registrada exitosamente: ${cantidad}ml`,
              'Extracción Registrada'
            );
            
            // Aquí agregarías la lógica para guardar la extracción
            // this.guardarExtraccion(cantidad);
          } else {
            await this.dialogService.error(
              'Por favor, ingrese un valor numérico válido',
              'Valor Inválido'
            );
          }
        } else {
          await this.dialogService.info(
            'La extracción no fue registrada',
            'Operación Cancelada'
          );
        }
      } catch (error) {
        await this.dialogService.error(
          'Ocurrió un error al registrar la extracción',
          'Error'
        );
      }
    }
  }
  
  monitorearTemperatura(): void {
    if (this.tienePermiso('monitorearTemperatura')) {
      this.notificationService.showInfo(
        'Monitoreo de Temperatura',
        '🔍 Monitoreando temperatura de refrigeradores...'
      );
      // En una aplicación real, aquí se haría una petición al backend
    }
  }
  
  iniciarMonitoreoTemperatura(): void {
    if (this.tienePermiso('monitorearTemperatura')) {
      // Simular monitoreo en tiempo real cada 30 segundos
      this.temperaturaInterval = setInterval(() => {
        this.refrigeradores.forEach(ref => {
          // Simular variación de temperatura
          const tempActual = this.getTemperaturaNumero(ref.temperaturaActual);
          const variacion = (Math.random() * 0.6) - 0.3; // ±0.3°C
          let nuevaTemp = Math.max(2, Math.min(8, tempActual + variacion));
          
          ref.temperaturaActual = nuevaTemp.toFixed(1) + '°C';
          ref.ultimaActualizacion = new Date();
          
          // Actualizar estado según temperatura
          if (nuevaTemp > 7) {
            ref.estado = 'Crítico';
            // Mostrar notificación para temperatura crítica
            this.notificationService.showWarning(
              'Temperatura Crítica',
              `Refrigerador ${ref.Id_refrigerador} tiene temperatura crítica: ${nuevaTemp.toFixed(1)}°C`
            );
          } else if (nuevaTemp > 5) {
            ref.estado = 'Alerta';
          } else {
            ref.estado = 'Óptimo';
          }
        });
        
        // Actualizar estadísticas
        this.calcularTemperaturaPromedio();
        this.estadisticas.alertasActivas = this.refrigeradores.filter(ref => 
          ref.estado === 'Alerta' || ref.estado === 'Crítico'
        ).length;
        
      }, 30000); // Cada 30 segundos
    }
  }
  
  generarReporte(): void {
    if (this.tienePermiso('verReportes')) {
      this.showReportModal = true;
    }
  }
  
  // Método para mostrar información del usuario
  verMiInformacion(): void {
    this.showProfileModal = true;
  }
  
  // Método para manejar actualización del perfil
  onProfileUpdated(updatedProfile: any): void {
    if (this.userData) {
      Object.assign(this.userData, updatedProfile);
      localStorage.setItem('lactaCareUser', JSON.stringify(this.userData));
      
      // Mostrar notificación de éxito
      this.notificationService.showSuccess(
        'Perfil Actualizado',
        '✅ Tu perfil ha sido actualizado exitosamente'
      );
    }
  }
  
  // Métodos para controlar modales
  closeAllModals(): void {
    this.showWelcomeModal = false;
    this.showReportModal = false;
    this.showProfileModal = false;
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
      medico: this.userData?.nombre_completo,
      lactariosActivos: this.estadisticas.totalLactarios,
      refrigeradores: this.estadisticas.refrigeradoresActivos,
      temperaturaPromedio: this.estadisticas.temperaturaPromedio,
      alertasActivas: this.estadisticas.alertasActivas
    };
  }
}