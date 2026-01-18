import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { ContenedorService, ContenedorLeche } from '../services/contenedor-leche.service';
import { AuthService } from '../../../../../../services/auth.service';

/* ===============================
   MODELO LOCAL DE EXTRACCIÓN
   =============================== */
interface Extraccion {
  id?: number;
  cantidad: number;
  fecha: Date;
  hora: string;
  tipo: 'Refrigerada' | 'Por Caducar';
  estado: 'activa' | 'por-retirar' | 'retirada';
  estadoOriginal?: 'Refrigerada' | 'Congelada'; // Para restaurar al cancelar
  fechaCaducidad?: Date;
  diasHastaCaducidad?: number;
  fechaProgramadaRetiro?: Date; // Fecha en que se marcó como "por retirar"
}

@Component({
  selector: 'app-control-madres',
  templateUrl: './control-madres.component.html',
  styleUrls: ['./control-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ControlMadresComponent implements OnInit, OnDestroy {

  extracciones: Extraccion[] = [];
  extraccionesFiltradas: Extraccion[] = [];
  loading = false;
  filtroActivo = 'Todo';

  /* ===============================
     PANEL DE RETIRO DE CONTENEDORES
     =============================== */
  mostrarPanelRetiro = false;
  mostrarConfirmacionRetiro = false;
  contenedoresSeleccionados: number[] = [];

  /* ===============================
     CANCELACIÓN DE RETIRO
     =============================== */
  mostrarConfirmacionCancelacion = false;
  contenedorACancelar: number | null = null;

  private refreshInterval: any;
  private verificacionRetiroInterval: any;

  constructor(
    private notificationService: NotificationService,
    private contenedorService: ContenedorService,
    private authService: AuthService
  ) {}

  /* ===============================
     CICLO DE VIDA
     =============================== */
  ngOnInit(): void {
    this.cargarExtraccionesDesdeBackend();

    // Actualizar cada 3 minutos
    this.refreshInterval = setInterval(() => {
      this.cargarExtraccionesDesdeBackend(true);
    }, 180000);

    // Verificar contenedores "por retirar" cada minuto
    this.verificacionRetiroInterval = setInterval(() => {
      this.verificarContenedoresPorRetirar();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.verificacionRetiroInterval) {
      clearInterval(this.verificacionRetiroInterval);
    }
  }

  /* ===============================
     CARGAR DATOS DESDE BACKEND
     =============================== */
  cargarExtraccionesDesdeBackend(silencioso: boolean = false): void {
    if (!silencioso) this.loading = true;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser?.id) {
      console.warn('⚠️ Usuario no autenticado');
      this.notificationService.warning('⚠️ Debes iniciar sesión');
      this.loading = false;
      return;
    }

    console.log('🔄 Cargando extracciones del paciente:', currentUser.id);

    this.contenedorService.getContenedoresByPaciente(currentUser.id).subscribe({
      next: (contenedores) => {
        console.log('✅ Contenedores recibidos:', contenedores.length);

        if (contenedores.length === 0) {
          console.log('🔭 No hay contenedores para este paciente');
        }

        // Mapear contenedores a extracciones
        this.extracciones = contenedores.map(c =>
          this.mapearContenedorAExtraccion(c)
        );

        // Ordenar por fecha (más reciente primero)
        this.extracciones.sort(
          (a, b) => b.fecha.getTime() - a.fecha.getTime()
        );

        // Aplicar filtro actual
        this.aplicarFiltro(this.filtroActivo);

        if (!silencioso) {
          this.verificarAlertasCaducidad();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error cargando extracciones:', error);
        this.notificationService.error('❌ No se pudieron cargar las extracciones');
        this.loading = false;
      }
    });
  }

  /* ===============================
     MAPEO: BACKEND → FRONTEND
     =============================== */
  mapearContenedorAExtraccion(contenedor: ContenedorLeche): Extraccion {
    const fechaExtraccion = new Date(contenedor.fechaHoraExtraccion);
    const fechaCaducidad = new Date(contenedor.fechaHoraCaducidad);
    const ahora = new Date();

    // Calcular días hasta caducidad
    const diasHastaCaducidad = Math.floor(
      (fechaCaducidad.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determinar tipo según días restantes
    let tipo: 'Refrigerada' | 'Por Caducar';
    if (diasHastaCaducidad <= 2) {
      tipo = 'Por Caducar';
    } else {
      tipo = 'Refrigerada';
    }

    // Determinar estado (activa, por-retirar o retirada)
    let estado: 'activa' | 'por-retirar' | 'retirada';
    if (contenedor.estado === 'Retirada' || contenedor.estado === 'Caducada') {
      estado = 'retirada';
    } else if (contenedor.estado === 'PorRetirar') {
      estado = 'por-retirar';
    } else {
      estado = 'activa';
    }

    return {
      id: contenedor.id,
      cantidad: Number(contenedor.cantidadMililitros) || 0,
      fecha: fechaExtraccion,
      hora: fechaExtraccion.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      tipo,
      estado,
      estadoOriginal: contenedor.estado as 'Refrigerada' | 'Congelada',
      fechaCaducidad,
      diasHastaCaducidad,
      fechaProgramadaRetiro: estado === 'por-retirar' ? new Date() : undefined
    };
  }

  /* ===============================
     VERIFICAR CONTENEDORES POR RETIRAR (24H)
     =============================== */
  verificarContenedoresPorRetirar(): void {
    const ahora = new Date();
    const contenedoresPorRetirar = this.extracciones.filter(
      e => e.estado === 'por-retirar' && e.fechaProgramadaRetiro
    );

    contenedoresPorRetirar.forEach(contenedor => {
      if (!contenedor.fechaProgramadaRetiro || !contenedor.id) return;

      const horasTranscurridas = 
        (ahora.getTime() - contenedor.fechaProgramadaRetiro.getTime()) / (1000 * 60 * 60);

      // Si han pasado 24 horas, marcar como "retirado"
      if (horasTranscurridas >= 24) {
        this.marcarComoRetirado(contenedor.id);
      }
    });
  }

  /* ===============================
     MARCAR COMO RETIRADO (AUTOMÁTICO)
     =============================== */
  marcarComoRetirado(idContenedor: number): void {
    console.log('⏰ Marcando contenedor como retirado automáticamente:', idContenedor);

    this.contenedorService.actualizarEstado(idContenedor, 'Retirada').subscribe({
      next: () => {
        console.log('✅ Contenedor marcado como retirado');

        const currentUser = this.authService.currentUserValue;
        
        // Registrar notificación de retiro
        this.notificationService.registrarRetiro(
          'RETIRADO',
          idContenedor,
          this.obtenerExtraccionPorId(idContenedor)?.cantidad || 0,
          currentUser?.id,
          `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim(),
          currentUser?.cedula
        );

        this.notificationService.success('✅ Contenedor marcado como retirado');
        this.cargarExtraccionesDesdeBackend(true);
      },
      error: (error) => {
        console.error('❌ Error al marcar como retirado:', error);
      }
    });
  }

  /* ===============================
     PANEL: RETIRO DE CONTENEDORES
     =============================== */
  abrirPanelRetiroContenedores(): void {
    if (this.extraccionesDisponibles.length === 0) {
      this.notificationService.info('ℹ️ No hay contenedores disponibles para retirar');
      return;
    }

    this.mostrarPanelRetiro = true;
    this.contenedoresSeleccionados = [];
  }

  cerrarPanelRetiro(): void {
    this.mostrarPanelRetiro = false;
    this.contenedoresSeleccionados = [];
  }

  toggleSeleccion(id: number): void {
    const index = this.contenedoresSeleccionados.indexOf(id);
    
    if (index > -1) {
      this.contenedoresSeleccionados.splice(index, 1);
    } else {
      this.contenedoresSeleccionados.push(id);
    }
  }

  estaSeleccionado(id: number): boolean {
    return this.contenedoresSeleccionados.includes(id);
  }

  seleccionarTodos(): void {
    this.contenedoresSeleccionados = this.extraccionesDisponibles
      .map(e => e.id!)
      .filter(id => id !== undefined);
  }

  deseleccionarTodos(): void {
    this.contenedoresSeleccionados = [];
  }

  confirmarRetiroContenedores(): void {
    if (this.contenedoresSeleccionados.length === 0) {
      this.notificationService.warning('⚠️ Selecciona al menos un contenedor');
      return;
    }

    this.mostrarPanelRetiro = false;
    this.mostrarConfirmacionRetiro = true;
  }

  cancelarConfirmacion(): void {
    this.mostrarConfirmacionRetiro = false;
    this.mostrarPanelRetiro = true;
  }

  ejecutarRetiroContenedores(): void {
    this.loading = true;

    console.log('📦 Marcando contenedores como "Por Retirar":', this.contenedoresSeleccionados);

    let procesados = 0;
    const total = this.contenedoresSeleccionados.length;
    const currentUser = this.authService.currentUserValue;

    this.contenedoresSeleccionados.forEach(id => {
      this.contenedorService.actualizarEstado(id, 'PorRetirar').subscribe({
        next: (contenedor) => {
          procesados++;
          console.log(`✅ Contenedor ${id} marcado como "Por Retirar"`);

          // Registrar notificación
          this.notificationService.registrarRetiro(
            'POR_RETIRAR',
            id,
            Number(contenedor.cantidadMililitros) || 0,
            currentUser?.id,
            `${currentUser?.nombre || ''} ${currentUser?.apellido || ''}`.trim(),
            currentUser?.cedula
          );

          if (procesados === total) {
            this.finalizarRetiro();
          }
        },
        error: (error) => {
          procesados++;
          console.error(`❌ Error al marcar contenedor ${id}:`, error);

          if (procesados === total) {
            this.finalizarRetiro();
          }
        }
      });
    });
  }

  private finalizarRetiro(): void {
    this.notificationService.success(
      `✅ ${this.contenedoresSeleccionados.length} contenedor(es) marcado(s) para retiro`
    );

    this.contenedoresSeleccionados = [];
    this.mostrarConfirmacionRetiro = false;
    this.loading = false;

    this.cargarExtraccionesDesdeBackend();
  }

  /* ===============================
     CANCELAR RETIRO
     =============================== */
  abrirConfirmacionCancelacion(idContenedor: number, event: Event): void {
    event.stopPropagation();
    this.contenedorACancelar = idContenedor;
    this.mostrarConfirmacionCancelacion = true;
  }

  cerrarConfirmacionCancelacion(): void {
    this.mostrarConfirmacionCancelacion = false;
    this.contenedorACancelar = null;
  }

  ejecutarCancelacionRetiro(): void {
    if (!this.contenedorACancelar) return;

    this.loading = true;

    const extraccion = this.obtenerExtraccionPorId(this.contenedorACancelar);
    const estadoOriginal = extraccion?.estadoOriginal || 'Refrigerada';

    console.log('🔄 Cancelando retiro del contenedor:', this.contenedorACancelar);

    this.contenedorService.actualizarEstado(this.contenedorACancelar, estadoOriginal).subscribe({
      next: () => {
        console.log('✅ Retiro cancelado exitosamente');
        this.notificationService.success('✅ Retiro cancelado exitosamente');
        this.cerrarConfirmacionCancelacion();
        this.loading = false;
        this.cargarExtraccionesDesdeBackend();
      },
      error: (error) => {
        console.error('❌ Error al cancelar retiro:', error);
        this.notificationService.error('❌ No se pudo cancelar el retiro');
        this.loading = false;
      }
    });
  }

  obtenerExtraccionPorId(id: number): Extraccion | undefined {
    return this.extracciones.find(e => e.id === id);
  }

  /* ===============================
     FILTROS Y MÉTRICAS
     =============================== */
  aplicarFiltro(filtro: string): void {
    this.filtroActivo = filtro;

    switch (filtro) {
      case 'Refrigerada':
      case 'Por Caducar':
        this.extraccionesFiltradas = this.extracciones.filter(
          e => e.tipo === filtro && e.estado === 'activa'
        );
        break;
      
      case 'Por Retirar':
        this.extraccionesFiltradas = this.extracciones.filter(
          e => e.estado === 'por-retirar'
        );
        break;
      
      case 'Retirada':
        this.extraccionesFiltradas = this.extracciones.filter(
          e => e.estado === 'retirada'
        );
        break;
      
      default: // 'Todo'
        this.extraccionesFiltradas = this.extracciones.filter(
          e => e.estado === 'activa'
        );
    }
  }

  verificarAlertasCaducidad(): void {
    const porCaducar = this.extracciones.filter(
      e => e.tipo === 'Por Caducar' && e.estado === 'activa'
    );

    if (porCaducar.length > 0) {
      const total = porCaducar.reduce((sum, e) => sum + e.cantidad, 0);
      this.notificationService.warning(
        `⚠️ ${porCaducar.length} contenedor${porCaducar.length > 1 ? 'es' : ''} por caducar (${total} ml)`
      );
    }
  }

  /* ===============================
     GETTERS CALCULADOS
     =============================== */
  get totalML(): number {
    return this.extracciones
      .filter(e => e.estado === 'activa')
      .reduce((sum, e) => sum + e.cantidad, 0);
  }

  get porCaducarML(): number {
    return this.extracciones
      .filter(e => e.tipo === 'Por Caducar' && e.estado === 'activa')
      .reduce((sum, e) => sum + e.cantidad, 0);
  }

  get retiradosML(): number {
    return this.extracciones
      .filter(e => e.estado === 'retirada')
      .reduce((sum, e) => sum + e.cantidad, 0);
  }

  get porRetirarML(): number {
    return this.extracciones
      .filter(e => e.estado === 'por-retirar')
      .reduce((sum, e) => sum + e.cantidad, 0);
  }

  get extraccionesDisponibles(): Extraccion[] {
    return this.extracciones.filter(e => e.estado === 'activa');
  }

  get totalMLSeleccionados(): number {
    return this.contenedoresSeleccionados
      .map(id => this.obtenerExtraccionPorId(id))
      .filter(e => e !== undefined)
      .reduce((sum, e) => sum + e!.cantidad, 0);
  }

  get todoSeleccionado(): boolean {
    return this.contenedoresSeleccionados.length === this.extraccionesDisponibles.length &&
           this.extraccionesDisponibles.length > 0;
  }
}