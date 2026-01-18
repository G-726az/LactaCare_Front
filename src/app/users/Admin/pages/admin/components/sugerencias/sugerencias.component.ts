import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../app/services/notification.service';
import { Sugerencia } from '../../../../../../models/database.models';
import Swal from 'sweetalert2';
import { SugerenciaService } from '../../../../app/services/sugerencia.service';
import { FilterPipe } from '../../../../../../guards/filter.pipe';

@Component({
  selector: 'app-sugerencias',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPipe],
  templateUrl: './sugerencias.component.html',
  styleUrls: ['./sugerencias.component.css'],
})
export class SugerenciasComponent implements OnInit {
  sugerencias: Sugerencia[] = [];

  sugerenciasFiltradas: Sugerencia[] = [];
  busqueda = '';
  mostrarModal = false;
  modoEdicion = false;
  sugerenciaActual: Partial<Sugerencia> = {};
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private sugerenciaService: SugerenciaService
  ) {}

  ngOnInit() {
    this.cargarSugerencias();
    this.sugerenciasFiltradas = [...this.sugerencias];
    this.notificationService.info('📝 Gestión de sugerencias cargada');
  }

  cargarSugerencias() {
    this.loading = true;
    this.sugerenciaService.getAll().subscribe({
      next: (sugerencias) => {
        this.sugerencias = sugerencias;
      },
      error: (err) => {
        this.notificationService.error('Error al cargar sugerencias', err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  getTipoColor(rol: string): string {
    const colores: { [key: string]: string } = {
      NOTIFICACION: '#6b4fa3',
      SUGERENCIA: '#759932',
    };
    return colores[rol] || '#9A9595';
  }

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      ACTIVO: '#2ECC71',
      INACTIVO: '#ADB5BD',
    };
    return colores[estado] || '#9A9595';
  }

  changeEstado(id: number) {
    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
    this.sugerenciaService.switchEstado(id).subscribe({
      next: () => {
        Swal.close();
        this.notificationService.success('Se cambió el estado');
        this.cargarSugerencias();
      },
      error: (err) => {
        Swal.close();
        this.notificationService.error(`No se pudo cambiar el estado ${err}`);
        console.log('Error cambio estado: ', err);
        this.cargarSugerencias();
      },
    });
  }

  filtrarSugerencias() {
    this.sugerenciasFiltradas = this.sugerencias.filter(
      (sug) =>
        sug.tituloSugerencias.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        sug.detalleSugerencias.toLowerCase().includes(this.busqueda.toLowerCase())
    );

    if (this.busqueda && this.sugerenciasFiltradas.length === 0) {
      this.notificationService.info('🔍 No se encontraron sugerencias con esa búsqueda');
    }
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.sugerenciaActual = {
      tituloSugerencias: '',
      detalleSugerencias: '',
      tipo_sugerencia: '',
      linkImagen: '',
      estado: 'ACTIVO',
    };
    this.mostrarModal = true;
    this.notificationService.info('💡 Abriendo formulario para nueva sugerencia');
  }

  editarSugerencia(sugerencia: Sugerencia) {
    this.modoEdicion = true;
    this.sugerenciaActual = { ...sugerencia };
    this.mostrarModal = true;
    this.notificationService.info(`✏️ Editando sugerencia: ${sugerencia.tituloSugerencias}`);
  }

  eliminarSugerencia(id: number) {
    const sugerencia = this.sugerencias.find((s) => s.idSugerencias === id);
    if (!sugerencia) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sugerenciaService.delete(id).subscribe({
          next: () => {
            this.cargarSugerencias();
            Swal.fire('Eliminado', 'Sugerencia eliminada con éxito', 'success');
          },
          error: (err) => {
            Swal.fire(
              'Eliminado',
              'No se pudo eliminar la sugerencia. Intente nuevamente',
              'error'
            );
          },
        });
      }
    });
  }

  guardarSugerencia() {
    // Validaciones agrupadas
    if (!this.sugerenciaActual.tituloSugerencias) {
      this.notificationService.warning('⚠️ Por favor ingresa un título para la sugerencia');
      return;
    }

    if (!this.sugerenciaActual.detalleSugerencias) {
      this.notificationService.warning('⚠️ Por favor ingresa una descripción');
      return;
    }

    if (
      this.sugerenciaActual.tipo_sugerencia === 'SUGERENCIA' &&
      !this.sugerenciaActual.linkImagen
    ) {
      this.notificationService.error('⚠️ Para tipo sugerencias es obligatorio una imagen');
      return;
    }

    if (
      this.sugerenciaActual.tipo_sugerencia === 'SUGERENCIA' &&
      !this.validarURL(this.sugerenciaActual.linkImagen!)
    ) {
      this.notificationService.error('⚠️ Para tipo sugerencias es obligatorio una imagen');
      return;
    }

    // Mostrar indicador de carga
    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    // Preparar payload
    const payload: Partial<Sugerencia> = {
      estado: 'ACTIVO',
      detalleSugerencias: this.sugerenciaActual.detalleSugerencias,
      linkImagen:
        this.sugerenciaActual.tipo_sugerencia === 'SUGERENCIA'
          ? this.sugerenciaActual.linkImagen!
          : this.sugerenciaActual.linkImagen || '',
      tipo_sugerencia: this.sugerenciaActual.tipo_sugerencia,
      tituloSugerencias: this.sugerenciaActual.tituloSugerencias,
    };

    const operacion$ = this.modoEdicion
      ? this.sugerenciaService.update(payload, this.sugerenciaActual.idSugerencias!)
      : this.sugerenciaService.create(payload);

    operacion$.subscribe({
      next: (resultado) => {
        const accion = this.modoEdicion ? 'editada' : 'creada';
        const titulo = resultado.tituloSugerencias || this.sugerenciaActual.tituloSugerencias;

        Swal.fire('Sugerencia', `Sugerencia "${titulo}" ${accion} con éxito`, 'success');

        this.cargarSugerencias();
        this.filtrarSugerencias();
        this.cerrarModal();
      },
      error: (err) => {
        const accion = this.modoEdicion ? 'editar' : 'crear';

        Swal.fire('Error', `No se pudo ${accion} la sugerencia. Intente nuevamente.`, 'error');

        this.notificationService.error(`Error al ${accion} la sugerencia: ${err.message || err}`);
        console.error(`Error al ${accion} sugerencia:`, err);
      },
    });
  }

  validarURL(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.sugerenciaActual = {};
  }
}
