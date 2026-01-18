import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../../Admin/app/services/notification.service';
import { InstitucionService } from '../../../../../Admin/app/services/institucion.service';
import { SalaLactanciaService } from '../../../../../Admin/app/services/sala-lactancia.service';
import { Institucion, SalaLactancia } from '../../../../../../models/database.models';
import Swal from 'sweetalert2';

declare var google: any;

@Component({
  selector: 'app-lactarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lactarios.component.html',
  styleUrls: ['./lactarios.component.css'],
})
export class LactariosComponent implements OnInit {
  lactarios: SalaLactancia[] = [];
  instituciones: Institucion[] = [];
  lactariosFiltrados: SalaLactancia[] = [];

  busqueda = '';
  estadoFiltro = '';
  mostrarModalInstitucion = false;
  modoEdicionInstitucion = false;
  institucionActual: Partial<Institucion> = {};
  logoUrl: string = '';
  loadingLactarios = true;
  loadingInstitucion = true;

  // ======== VARIABLES PARA FORMULARIO DE SALA ========
  mostrarFormularioSala = false;
  modoEdicionSala = false;
  salaActual: SalaLactancia = this.getSalaVacia();
  numeroCubiculos: number = 1;
  institucionSeleccionada: number = 0;

  // Google Maps
  map: any;
  marker: any;
  mapCenter = { lat: -2.1894, lng: -79.8886 };

  constructor(
    private notificationService: NotificationService,
    private institucionService: InstitucionService,
    private salaLactanciaService: SalaLactanciaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarInstituciones();
    this.cargarLactarios();
  }

  // ======== FUNCIONES AUXILIARES ========
  getSalaVacia(): SalaLactancia {
    return {
      nombreCMedico: '',
      direccionCMedico: '',
      correoCMedico: '',
      telefonoCMedico: '',
      latitudCMedico: '-2.1894',
      longitudCMedico: '-79.8886',
      estado: 'ACTIVO',
      horarioSala: {
        horaApertura: '08:00',
        horaCierre: '12:00',
        horaInicioDescanso: '14:00',
        horaFinDescanso: '18:00',
      },
      diasLaborablesSala: {
        diaLunes: true,
        diaMartes: true,
        diaMiercoles: true,
        diaJueves: true,
        diaViernes: true,
        diaSabado: false,
        diaDomingo: false,
      },
    };
  }

  cargarLactarios() {
    this.loadingLactarios = true;
    this.salaLactanciaService.getAll().subscribe({
      next: (data) => {
        console.log('✅ Lactarios cargados:', data);
        this.lactarios = data || [];
        this.lactariosFiltrados = [...this.lactarios];
        this.loadingLactarios = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar lactarios:', err);
        this.lactarios = [];
        this.lactariosFiltrados = [];
        this.loadingLactarios = false;

        if (err.status === 500) {
          this.notificationService.error('Error del servidor. Contacte al administrador.');
        } else if (err.status === 0) {
          this.notificationService.error('No se puede conectar al servidor.');
        } else {
          this.notificationService.error('Error al cargar las salas de lactancia');
        }
      },
    });
  }

  cargarInstituciones() {
    this.institucionService.getInstituciones().subscribe({
      next: (instituciones) => {
        console.log('✅ Instituciones cargadas:', instituciones);
        this.instituciones = instituciones;
        this.loadingInstitucion = false;
      },
      error: (err) => {
        console.error('❌ Error instituciones:', err);
        this.loadingInstitucion = false;
      },
    });
  }

  defaultImage = 'https://i.imgur.com/6a98hzu.png';

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage;
    img.onerror = null;
  }

  /**
   * ✅ Obtener URL del logo para mostrar en <img>
   * Solo maneja URLs - NO maneja Base64
   * Formatos soportados:
   * 1. URL completa: https://i.imgur.com/abc123.png
   * 2. URL sin protocolo: imgur.com/abc123.png o i.imgur.com/abc123.png
   */
  getLogoUrl(institucion: Institucion | undefined): string {
    // Si no hay institución o no hay logo, devolver imagen por defecto
    if (!institucion || !institucion.logoInstitucion || institucion.logoInstitucion.trim() === '') {
      return this.defaultImage;
    }

    const logo = institucion.logoInstitucion.trim();

    // CASO 1: URL con protocolo completo (https:// o http://)
    if (logo.startsWith('https://') || logo.startsWith('http://')) {
      return logo;
    }

    // CASO 2: URL sin protocolo que contiene imgur.com
    if (logo.includes('imgur.com')) {
      // Agregar https:// si falta
      return `https://${logo}`;
    }

    // Si no es ninguno de los casos anteriores, usar imagen por defecto
    console.warn('⚠️ Formato no reconocido:', logo.substring(0, 50));
    return this.defaultImage;
  }

  filtrarLactarios() {
    this.lactariosFiltrados = this.lactarios.filter((item) => {
      const coincideBusqueda =
        item.nombreCMedico?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        item.direccionCMedico?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        item.institucion?.nombreInstitucion?.toLowerCase().includes(this.busqueda.toLowerCase());

      const coincideEstado = !this.estadoFiltro || item.estado === this.estadoFiltro;

      return coincideBusqueda && coincideEstado;
    });
  }

  // ======== FUNCIONES DEL FORMULARIO DE SALA ========
  abrirFormularioNuevo() {
    this.modoEdicionSala = false;
    this.salaActual = this.getSalaVacia();
    this.numeroCubiculos = 1;
    this.institucionSeleccionada = 0;
    this.mostrarFormularioSala = true;

    setTimeout(() => this.initMap(), 500);
  }

  editarLactario(id: number) {
    this.salaLactanciaService.getById(id).subscribe({
      next: (data) => {
        this.modoEdicionSala = true;
        this.salaActual = data;

        if (data.institucion) {
          this.institucionSeleccionada = data.institucion.idInstitucion;
        }

        if (data.latitudCMedico && data.longitudCMedico) {
          this.mapCenter = {
            lat: parseFloat(data.latitudCMedico),
            lng: parseFloat(data.longitudCMedico),
          };
        }

        if (data.cubiculos) {
          this.numeroCubiculos = data.cubiculos.length;
        }

        this.mostrarFormularioSala = true;

        setTimeout(() => {
          this.initMap();
          this.updateMapPosition();
        }, 500);
      },
      error: (err) => {
        console.error('❌ Error al cargar sala:', err);
        this.notificationService.error('Error al cargar la sala');
      },
    });
  }

  cerrarFormularioSala() {
    this.mostrarFormularioSala = false;
    this.salaActual = this.getSalaVacia();
    this.institucionSeleccionada = 0;
    this.numeroCubiculos = 1;
  }

  // ======== GOOGLE MAPS ========
  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    try {
      this.map = new google.maps.Map(mapElement, {
        center: this.mapCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });

      this.marker = new google.maps.Marker({
        position: this.mapCenter,
        map: this.map,
        draggable: true,
        title: 'Ubicación de la Sala',
      });

      this.marker.addListener('dragend', () => {
        const position = this.marker.getPosition();
        this.salaActual.latitudCMedico = position.lat().toFixed(6);
        this.salaActual.longitudCMedico = position.lng().toFixed(6);
      });

      this.map.addListener('click', (event: any) => {
        this.marker.setPosition(event.latLng);
        this.salaActual.latitudCMedico = event.latLng.lat().toFixed(6);
        this.salaActual.longitudCMedico = event.latLng.lng().toFixed(6);
      });
    } catch (error) {
      console.error('Error al inicializar Google Maps:', error);
      this.notificationService.warning('El mapa no está disponible temporalmente');
    }
  }

  updateMapPosition() {
    if (this.map && this.marker) {
      const newPos = {
        lat: parseFloat(this.salaActual.latitudCMedico),
        lng: parseFloat(this.salaActual.longitudCMedico),
      };
      this.map.setCenter(newPos);
      this.marker.setPosition(newPos);
    }
  }

  onCoordinateChange() {
    if (this.salaActual.latitudCMedico && this.salaActual.longitudCMedico) {
      this.updateMapPosition();
    }
  }

  incrementarCubiculos() {
    if (this.numeroCubiculos < 50) {
      this.numeroCubiculos++;
    }
  }

  decrementarCubiculos() {
    if (this.numeroCubiculos > 0) {
      this.numeroCubiculos--;
    }
  }

  validarFormularioSala(): boolean {
    if (!this.salaActual.nombreCMedico.trim()) {
      this.notificationService.warning('El nombre es requerido');
      return false;
    }

    if (!this.salaActual.direccionCMedico.trim()) {
      this.notificationService.warning('La dirección es requerida');
      return false;
    }

    if (!this.salaActual.correoCMedico.trim()) {
      this.notificationService.warning('El correo es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.salaActual.correoCMedico)) {
      this.notificationService.warning('El formato del correo no es válido');
      return false;
    }

    if (!this.salaActual.telefonoCMedico.trim()) {
      this.notificationService.warning('El teléfono es requerido');
      return false;
    }

    if (!this.salaActual.estado || this.salaActual.estado === '') {
      this.notificationService.warning('Debe seleccionar un estado');
      return false;
    }

    if (!this.institucionSeleccionada || this.institucionSeleccionada === 0) {
      this.notificationService.warning('Debe seleccionar una institución');
      return false;
    }

    return true;
  }

  guardarSala() {
    if (!this.validarFormularioSala()) {
      return;
    }

    this.salaActual.institucion = {
      idInstitucion: this.institucionSeleccionada,
      nombreInstitucion: '',
    };

    if (this.modoEdicionSala && this.salaActual.idLactario) {
      this.salaLactanciaService.update(this.salaActual.idLactario, this.salaActual).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: '✅ Actualizado',
            text: 'Sala de lactancia actualizada exitosamente',
            confirmButtonColor: '#4caf50',
          });
          this.cerrarFormularioSala();
          this.cargarLactarios();
        },
        error: (err) => {
          console.error('❌ Error al actualizar:', err);
          this.notificationService.error('Error al actualizar la sala');
        },
      });
    } else {
      const dto = {
        salaLactancia: this.salaActual,
        numeroCubiculos: this.numeroCubiculos,
      };

      console.log('📤 Enviando DTO:', dto);

      this.salaLactanciaService.createConCubiculos(dto).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: '✅ Creado',
            text: `Sala de lactancia creada con ${this.numeroCubiculos} cubículos`,
            confirmButtonColor: '#4caf50',
          });
          this.cerrarFormularioSala();
          this.cargarLactarios();
        },
        error: (err) => {
          console.error('❌ Error al crear:', err);

          if (err.error && err.error.error) {
            this.notificationService.error(err.error.error);
          } else {
            this.notificationService.error('Error al crear la sala');
          }
        },
      });
    }
  }

  // ======== OTRAS FUNCIONES DE LACTARIOS ========
  verDetalles(lactario: SalaLactancia) {
    const horario = this.obtenerHorario(lactario);
    const dias = this.obtenerDiasLaborables(lactario);

    Swal.fire({
      title: lactario.nombreCMedico,
      html: `
      <div style="text-align: left;">
        <p><strong>🏢 Institución:</strong> ${
          lactario.institucion?.nombreInstitucion || 'No asignada'
        }</p>
        <p><strong>📍 Dirección:</strong> ${lactario.direccionCMedico}</p>
        <p><strong>📞 Teléfono:</strong> ${lactario.telefonoCMedico}</p>
        <p><strong>📧 Correo:</strong> ${lactario.correoCMedico}</p>
        <p><strong>⏰ Horario:</strong> ${horario}</p>
        <p><strong>📅 Días:</strong> ${dias}</p>
        <p><strong>🚪 Cubículos:</strong> ${lactario.cubiculos?.length || 0}</p>
        <p><strong>📊 Estado:</strong> <span style="color: ${
          lactario.estado === 'ACTIVO' ? 'green' : 'red'
        };">${lactario.estado}</span></p>
      </div>
    `,
      icon: 'info',
      confirmButtonColor: '#6b4fa3',
    });
  }

  obtenerDiasLaborables(lactario: SalaLactancia): string {
    if (!lactario.diasLaborablesSala) return 'No especificado';

    const dias = lactario.diasLaborablesSala;
    const diasSeleccionados = [];

    if (dias.diaLunes) diasSeleccionados.push('Lun');
    if (dias.diaMartes) diasSeleccionados.push('Mar');
    if (dias.diaMiercoles) diasSeleccionados.push('Mié');
    if (dias.diaJueves) diasSeleccionados.push('Jue');
    if (dias.diaViernes) diasSeleccionados.push('Vie');
    if (dias.diaSabado) diasSeleccionados.push('Sáb');
    if (dias.diaDomingo) diasSeleccionados.push('Dom');

    return diasSeleccionados.length > 0 ? diasSeleccionados.join(', ') : 'No especificado';
  }

  async cambiarEstadoLactario(lactario: SalaLactancia) {
    const nuevoEstado = lactario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar';

    const confirmado = await this.notificationService.confirm(
      `¿Está seguro de ${accion} la sala "${lactario.nombreCMedico}"?`,
      `${accion.charAt(0).toUpperCase() + accion.slice(1)} Sala`
    );

    if (!confirmado) return;

    const observable =
      nuevoEstado === 'ACTIVO'
        ? this.salaLactanciaService.activar(lactario.idLactario!)
        : this.salaLactanciaService.desactivar(lactario.idLactario!);

    observable.subscribe({
      next: () => {
        this.notificationService.success(
          `Sala ${accion === 'activar' ? 'activada' : 'desactivada'} exitosamente`
        );
        this.cargarLactarios();
      },
      error: (err) => {
        console.error(`❌ Error al ${accion} sala:`, err);
        this.notificationService.error(`Error al ${accion} la sala`);
      },
    });
  }

  eliminarLactario(id: number) {
    const lactario = this.lactarios.find((l) => l.idLactario === id);
    if (!lactario) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará permanentemente la sala "${lactario.nombreCMedico}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b4fa3',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.salaLactanciaService.delete(id).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado',
              `La sala "${lactario.nombreCMedico}" ha sido eliminada.`,
              'success'
            );
            this.cargarLactarios();
          },
          error: (err) => {
            console.error('❌ Error al eliminar:', err);
            this.notificationService.error('Error al eliminar la sala');
          },
        });
      }
    });
  }

  // ======== FUNCIONES DE INSTITUCIONES ========
  abrirModalInstitucion() {
    this.modoEdicionInstitucion = false;
    this.institucionActual = {
      idInstitucion: 0,
      nombreInstitucion: '',
      logoInstitucion: '',
    };
    this.logoUrl = '';
    this.urlImagen = '';
    this.mostrarModalInstitucion = true;
  }

  editarInstitucion(item: Institucion) {
    this.modoEdicionInstitucion = true;
    this.institucionActual = { ...item };

    // ✅ CORRECCIÓN: Usar la función getLogoUrl para cargar el preview correctamente
    this.logoUrl = this.getLogoUrl(item);

    // Si es una URL, también cargarla en el campo de URL
    if (
      item.logoInstitucion &&
      (item.logoInstitucion.startsWith('http://') || item.logoInstitucion.startsWith('https://'))
    ) {
      this.urlImagen = item.logoInstitucion;
    } else {
      this.urlImagen = '';
    }

    console.log('📝 Editando institución:', {
      nombre: item.nombreInstitucion,
      logoOriginal: item.logoInstitucion,
      logoUrl: this.logoUrl,
    });

    this.mostrarModalInstitucion = true;
  }

  /**
   * ✅ Manejo de archivos de imagen
   * Ya no convierte a Base64, solo muestra advertencia
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.notificationService.warning(
      'Por favor sube la imagen a Imgur y pega la URL en el campo correspondiente'
    );

    // Limpiar el input
    input.value = '';
  }

  /**
   * ✅ Permitir pegar URL directamente (de Imgur u otro servicio)
   * Agrega automáticamente https:// si falta
   */
  urlImagen: string = '';

  onUrlPasted() {
    if (this.urlImagen && this.urlImagen.trim()) {
      let url = this.urlImagen.trim();

      // Si la URL no tiene protocolo, agregarlo
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
        console.log('🔗 Protocolo agregado automáticamente:', url);
      }

      this.institucionActual = {
        ...this.institucionActual,
        logoInstitucion: url,
      };
      this.logoUrl = url;

      console.log('✅ URL configurada:', url);
    }
  }

  guardarInstitucion() {
    if (!this.institucionActual.nombreInstitucion?.trim()) {
      this.notificationService.warning('Por favor completa el campo de Nombre');
      return;
    }

    const payload: Partial<Institucion> = {
      nombreInstitucion: this.institucionActual.nombreInstitucion,
      logoInstitucion: this.institucionActual.logoInstitucion,
    };

    console.log('💾 Guardando institución:', payload.nombreInstitucion);

    if (this.modoEdicionInstitucion) {
      this.institucionService.update(payload, this.institucionActual.idInstitucion!).subscribe({
        next: (institucionActualizada) => {
          Swal.fire(
            'Institución editada',
            `Institución ${institucionActualizada.nombreInstitucion} editada con éxito`,
            'success'
          );
          this.cargarInstituciones();
          this.cerrarModalInstitucion();
        },
        error: (err) => {
          console.error('❌ Error al editar institución:', err);
          this.notificationService.error('Error al editar la institución');
        },
      });
    } else {
      this.institucionService.create(payload).subscribe({
        next: (institucionGuardada) => {
          console.log('✅ Institución guardada:', institucionGuardada);
          this.instituciones.push(institucionGuardada);
          this.notificationService.success('Institución creada exitosamente');
          this.cerrarModalInstitucion();
        },
        error: (err) => {
          console.error('❌ Error al guardar institución:', err);
          this.notificationService.error('Error al guardar la institución');
        },
      });
    }
  }

  eliminarInstitucion(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.institucionService.delete(id).subscribe({
          next: () => {
            this.instituciones = this.instituciones.filter((c) => c.idInstitucion !== id);
            Swal.fire('Eliminado', 'Institución eliminada con éxito', 'success');
          },
          error: (err) => {
            console.error('❌ Error al eliminar institución:', err);
            this.notificationService.error('Error al eliminar la institución');
          },
        });
      }
    });
  }

  cerrarModalInstitucion() {
    this.mostrarModalInstitucion = false;
    this.institucionActual = {};
    this.logoUrl = '';
    this.urlImagen = '';
  }

  /**
   * ✅ Obtener el horario formateado de una sala
   */
  obtenerHorario(lactario: SalaLactancia): string {
    if (!lactario.horarioSala) {
      return 'No definido';
    }

    const horario = lactario.horarioSala;
    let resultado = `${horario.horaApertura} - ${horario.horaCierre}`;

    if (horario.horaInicioDescanso && horario.horaFinDescanso) {
      resultado += ` (Descanso: ${horario.horaInicioDescanso} - ${horario.horaFinDescanso})`;
    }

    return resultado;
  }
}
