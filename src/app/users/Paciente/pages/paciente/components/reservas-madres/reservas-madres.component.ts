import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface Sala {
  id: number;
  nombre: string;
  ubicacion: string;
}

interface Cubiculo {
  id: number;
  nombreCubiculo: string;
  estadoCubiculo: string;
  idSalaLactancia: number;
  nombreSala: string;
}

interface HorarioDisponible {
  hora: string;
  disponible: boolean;
  estado: string;
}

interface ReservaLocal {
  id?: number;
  sala: string;
  cubiculo?: string;
  ubicacion: string;
  fecha: string;
  hora: string;
  duracion: string;
  estado: string;
  idSala?: number;
  idCubiculo?: number;
  horaInicio?: string;
  horaFin?: string;
}

@Component({
  selector: 'app-reservas-madres',
  templateUrl: './reservas-madres.component.html',
  styleUrls: ['./reservas-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ReservasMadresComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api';

  // Datos del paciente
  pacienteInfo = {
    cedula: '',
    nombreCompleto: '',
    idPaciente: null as number | null,
  };

  // Listas
  reservas: ReservaLocal[] = [];
  salasDisponibles: Sala[] = [];
  cubiculosDisponibles: Cubiculo[] = [];
  cubiculosFiltrados: Cubiculo[] = [];
  horariosDisponibles: HorarioDisponible[] = [];
  horariosOcupados: string[] = [];

  // Estados
  loading = false;
  mostrarModal = false;
  mostrarPanelFormulario = false;
  fechaMinima = '';
  modoEdicion = false; // NUEVO
  reservaEditando: ReservaLocal | null = null; // NUEVO

  // Filtros de búsqueda
  filtros = {
    idSala: null as number | null,
    idCubiculo: null as number | null,
    fecha: null as string | null,
    estado: '',
  };

  // Formulario de nueva/editar reserva
  nuevaReservaForm = {
    id: null as number | null, // NUEVO: para edición
    idSala: null as number | null,
    idCubiculo: null as number | null,
    fecha: null as string | null,
    horaInicio: null as string | null,
  };

  // Estado del formulario
  formValidation = {
    salaValida: false,
    cubiculoValido: false,
    fechaValida: false,
    horaValida: false,
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.establecerFechaMinima();
    this.cargarDatosPaciente();
    this.cargarSalasDisponibles();
    this.cargarReservas();
  }

  // ===========================
  // CARGAR DATOS
  // ===========================

  establecerFechaMinima(): void {
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  cargarDatosPaciente(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.pacienteInfo.idPaciente = currentUser.id;
      this.pacienteInfo.cedula = currentUser.cedula || 'Sin cédula';
      this.pacienteInfo.nombreCompleto = `${currentUser.primerNombre || ''} ${
        currentUser.segundoNombre || ''
      } ${currentUser.primerApellido || ''} ${currentUser.segundoApellido || ''}`.trim();
    }
  }

  cargarSalasDisponibles(): void {
    this.http.get<any[]>(`${this.apiUrl}/lactarios/activos`).subscribe({
      next: (salas) => {
        this.salasDisponibles = salas.map((s) => ({
          id: Number(s.idLactario),
          nombre: s.nombreCMedico,
          ubicacion: s.direccionCMedico,
        }));
        console.log('✅ Salas cargadas:', this.salasDisponibles);
      },
      error: (error) => {
        console.error('❌ Error cargando salas:', error);
        this.notificationService?.error('Error al cargar salas');
      },
    });
  }

  cargarReservas(): void {
    if (!this.pacienteInfo.idPaciente) return;
    this.loading = true;

    this.http
      .get<any[]>(`${this.apiUrl}/reservas/paciente/${this.pacienteInfo.idPaciente}`)
      .subscribe({
        next: (reservas) => {
          this.reservas = reservas.map((r) => ({
            id: r.idReserva,
            sala: r.nombreSala || 'Sin sala',
            cubiculo: r.nombreCubiculo || 'Sin cubículo', // ✅ CORREGIDO: Ahora sí se muestra
            ubicacion: r.nombreInstitucion || 'Sin ubicación',
            fecha: this.formatearFechaISO(r.fecha),
            hora: `${r.horaInicio} - ${r.horaFin}`,
            horaInicio: r.horaInicio,
            horaFin: r.horaFin,
            duracion: this.calcularDuracion(r.horaInicio, r.horaFin),
            estado: r.estado,
            idSala: r.idSala,
            idCubiculo: r.idCubiculo,
          }));
          this.loading = false;
          console.log('✅ Reservas cargadas:', this.reservas);
        },
        error: (error) => {
          console.error('❌ Error cargando reservas:', error);
          this.loading = false;
        },
      });
  }

  // ===========================
  // FILTROS - CORREGIDO
  // ===========================

  onSalaChange(): void {
    this.filtros.idCubiculo = null;

    if (this.filtros.idSala) {
      console.log('🔍 Cargando cubículos para sala:', this.filtros.idSala);

      this.http.get<Cubiculo[]>(`${this.apiUrl}/cubiculos/sala/${this.filtros.idSala}`).subscribe({
        next: (cubiculos) => {
          console.log('✅ Cubículos recibidos para filtro:', cubiculos);
          this.cubiculosFiltrados = cubiculos;
        },
        error: (error) => {
          console.error('❌ Error cargando cubículos para filtro:', error);
          this.cubiculosFiltrados = [];
        },
      });
    } else {
      this.cubiculosFiltrados = [];
    }

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    // Los filtros se aplican automáticamente en el getter
    console.log('🔍 Aplicando filtros:', this.filtros);
  }

  limpiarFiltros(): void {
    this.filtros = {
      idSala: null,
      idCubiculo: null,
      fecha: null,
      estado: '',
    };
    this.cubiculosFiltrados = [];
  }

  get reservasFiltradas(): ReservaLocal[] {
    let filtradas = [...this.reservas];

    if (this.filtros.idSala) {
      filtradas = filtradas.filter((r) => r.idSala === this.filtros.idSala);
    }

    if (this.filtros.idCubiculo) {
      filtradas = filtradas.filter((r) => r.idCubiculo === this.filtros.idCubiculo);
    }

    if (this.filtros.fecha) {
      filtradas = filtradas.filter((r) => r.fecha === this.filtros.fecha);
    }

    if (this.filtros.estado) {
      filtradas = filtradas.filter((r) => r.estado === this.filtros.estado);
    }

    return filtradas;
  }

  // ===========================
  // MODAL Y FORMULARIO
  // ===========================

  abrirModalNueva(): void {
    this.modoEdicion = false;
    this.reservaEditando = null;
    this.mostrarModal = true;
    this.mostrarPanelFormulario = false;
    this.resetearFormulario();
  }

  // NUEVO: Abrir modal para editar
  abrirModalEditar(reserva: ReservaLocal): void {
    console.log('📝 Editando reserva:', reserva);

    this.modoEdicion = true;
    this.reservaEditando = reserva;
    this.mostrarModal = true;
    this.mostrarPanelFormulario = true;

    // Pre-llenar el formulario
    this.nuevaReservaForm = {
      id: reserva.id || null,
      idSala: reserva.idSala || null,
      idCubiculo: reserva.idCubiculo || null,
      fecha: reserva.fecha,
      horaInicio: reserva.horaInicio || null,
    };

    // Validar campos pre-llenados
    this.formValidation = {
      salaValida: !!reserva.idSala,
      cubiculoValido: !!reserva.idCubiculo,
      fechaValida: !!reserva.fecha,
      horaValida: !!reserva.horaInicio,
    };

    // Cargar cubículos de la sala
    if (reserva.idSala) {
      this.cargarCubiculosParaEdicion(reserva.idSala);
    }

    // Cargar horarios disponibles
    if (reserva.idCubiculo && reserva.fecha) {
      this.cargarHorariosDisponibles();
    }
  }

  // NUEVO: Cargar cubículos para edición
  cargarCubiculosParaEdicion(idSala: number): void {
    this.http.get<Cubiculo[]>(`${this.apiUrl}/cubiculos/sala/${idSala}`).subscribe({
      next: (cubiculos) => {
        this.cubiculosDisponibles = cubiculos.filter(
          (c) => c.estadoCubiculo && c.estadoCubiculo.toUpperCase() !== 'INACTIVO'
        );
      },
      error: (error) => {
        console.error('❌ Error cargando cubículos:', error);
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.mostrarPanelFormulario = false;
    this.modoEdicion = false;
    this.reservaEditando = null;
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.nuevaReservaForm = {
      id: null,
      idSala: null,
      idCubiculo: null,
      fecha: null,
      horaInicio: null,
    };
    this.cubiculosDisponibles = [];
    this.horariosDisponibles = [];
    this.horariosOcupados = [];
    this.formValidation = {
      salaValida: false,
      cubiculoValido: false,
      fechaValida: false,
      horaValida: false,
    };
  }

  togglePanelFormulario(): void {
    this.mostrarPanelFormulario = !this.mostrarPanelFormulario;
  }

  onSalaSeleccionada(): void {
    const idSala = Number(this.nuevaReservaForm.idSala);

    if (!idSala || isNaN(idSala)) {
      this.formValidation.salaValida = false;
      return;
    }

    const salaExiste = this.salasDisponibles.find((s) => s.id === idSala);
    if (!salaExiste) {
      this.formValidation.salaValida = false;
      return;
    }

    this.formValidation.salaValida = true;
    this.nuevaReservaForm.idSala = idSala;

    // Reset de campos dependientes
    this.nuevaReservaForm.idCubiculo = null;
    this.formValidation.cubiculoValido = false;
    this.cubiculosDisponibles = [];
    this.horariosDisponibles = [];
    this.horariosOcupados = [];

    // Cargar cubículos
    this.loading = true;
    this.http.get<Cubiculo[]>(`${this.apiUrl}/cubiculos/sala/${idSala}`).subscribe({
      next: (cubiculos) => {
        console.log('✅ Cubículos recibidos:', cubiculos);
        this.cubiculosDisponibles = cubiculos.filter((c) => {
          const disponible = c.estadoCubiculo && c.estadoCubiculo.toUpperCase() !== 'INACTIVO';
          return disponible;
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando cubículos:', error);
        this.notificationService?.error('❌ Error al cargar cubículos');
        this.cubiculosDisponibles = [];
        this.loading = false;
      },
    });
  }

  onCubiculoSeleccionado(): void {
    const idCubiculo = Number(this.nuevaReservaForm.idCubiculo);

    if (!idCubiculo || isNaN(idCubiculo)) {
      this.formValidation.cubiculoValido = false;
      return;
    }

    this.formValidation.cubiculoValido = true;
    this.nuevaReservaForm.idCubiculo = idCubiculo;

    if (this.nuevaReservaForm.fecha) {
      this.cargarHorariosDisponibles();
    }
  }

  onFechaSeleccionada(): void {
    const fecha = this.nuevaReservaForm.fecha;

    if (!fecha) {
      this.formValidation.fechaValida = false;
      return;
    }

    this.formValidation.fechaValida = true;
    this.horariosDisponibles = [];
    this.horariosOcupados = [];
    this.nuevaReservaForm.horaInicio = null;
    this.formValidation.horaValida = false;

    if (this.nuevaReservaForm.idCubiculo) {
      this.cargarHorariosDisponibles();
    }
  }

  onHoraSeleccionada(): void {
    const hora = this.nuevaReservaForm.horaInicio;
    this.formValidation.horaValida = !!hora;
  }

  cargarHorariosDisponibles(): void {
    const { idCubiculo, fecha } = this.nuevaReservaForm;

    if (!idCubiculo || !fecha) return;

    this.loading = true;

    this.http
      .get<HorarioDisponible[]>(`${this.apiUrl}/cubiculos/${idCubiculo}/disponibilidad/${fecha}`)
      .subscribe({
        next: (horarios) => {
          this.horariosDisponibles = horarios;
          this.horariosOcupados = horarios
            .filter((h) => !h.disponible)
            .map((h) => `${h.hora} (${h.estado})`);

          this.loading = false;
          console.log('✅ Horarios cargados:', horarios.length);
        },
        error: (error) => {
          console.error('❌ Error cargando horarios:', error);
          this.notificationService?.error('Error al cargar horarios');
          this.loading = false;
        },
      });
  }

  get formularioValido(): boolean {
    return (
      this.formValidation.salaValida &&
      this.formValidation.cubiculoValido &&
      this.formValidation.fechaValida &&
      this.formValidation.horaValida
    );
  }

  // ===========================
  // CREAR/ACTUALIZAR RESERVA
  // ===========================

  crearReserva(): void {
    if (!this.formularioValido) {
      this.notificationService?.error('⚠️ Complete todos los campos correctamente');
      return;
    }

    if (this.modoEdicion) {
      this.actualizarReserva();
    } else {
      this.crearNuevaReserva();
    }
  }

  crearNuevaReserva(): void {
    const { idSala, idCubiculo, fecha, horaInicio } = this.nuevaReservaForm;

    if (!this.pacienteInfo.idPaciente) {
      this.notificationService?.error('⚠️ No se pudo identificar al paciente');
      return;
    }

    const request = {
      idPersonaPaciente: Number(this.pacienteInfo.idPaciente),
      idSalaLactancia: Number(idSala),
      idCubiculo: Number(idCubiculo),
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: this.calcularHoraFin(horaInicio!),
      estado: 'EN RESERVA',
    };

    this.loading = true;

    this.http.post(`${this.apiUrl}/reservas/con-cubiculo`, request).subscribe({
      next: (response) => {
        console.log('✅ Reserva creada:', response);
        this.notificationService?.success('✅ Reserva creada exitosamente');
        this.cerrarModal();
        this.cargarReservas();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error creando reserva:', error);
        const mensaje = error.error?.error || error.error?.message || 'Error al crear reserva';
        this.notificationService?.error('❌ ' + mensaje);
        this.loading = false;
      },
    });
  }

  // NUEVO: Actualizar reserva existente
  actualizarReserva(): void {
    const { id, idSala, idCubiculo, fecha, horaInicio } = this.nuevaReservaForm;

    if (!id || !this.pacienteInfo.idPaciente) {
      this.notificationService?.error('⚠️ Datos incompletos');
      return;
    }

    const request = {
      estado: this.reservaEditando?.estado || 'EN RESERVA',
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: this.calcularHoraFin(horaInicio!),
      personaPaciente: { id: this.pacienteInfo.idPaciente },
      salaLactancia: { idLactario: Number(idSala) },
      cubiculo: { id: Number(idCubiculo) },
    };

    this.loading = true;

    this.http.put(`${this.apiUrl}/reservas/${id}`, request).subscribe({
      next: (response) => {
        console.log('✅ Reserva actualizada:', response);
        this.notificationService?.success('✅ Reserva actualizada exitosamente');
        this.cerrarModal();
        this.cargarReservas();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error actualizando reserva:', error);
        const mensaje = error.error?.error || error.error?.message || 'Error al actualizar reserva';
        this.notificationService?.error('❌ ' + mensaje);
        this.loading = false;
      },
    });
  }

  calcularHoraFin(horaInicio: string): string {
    try {
      const [horas, minutos] = horaInicio.split(':').map(Number);
      const fecha = new Date();
      fecha.setHours(horas, minutos + 30, 0, 0);
      return fecha.toTimeString().slice(0, 5);
    } catch {
      return horaInicio;
    }
  }

  // ===========================
  // ACCIONES DE RESERVA - ACTUALIZADO
  // ===========================

  // NUEVO: Determinar si se puede editar
  puedeEditar(reserva: ReservaLocal): boolean {
    const estadosEditables = ['EN RESERVA'];
    return estadosEditables.includes(reserva.estado);
  }

  // NUEVO: Determinar si se puede eliminar
  puedeEliminar(reserva: ReservaLocal): boolean {
    return reserva.estado === 'ANULADO';
  }

  // NUEVO: Determinar si se puede cambiar estado
  puedeCambiarEstado(reserva: ReservaLocal): boolean {
    const estadosInmutables = ['FINALIZADO', 'ACTIVO', 'ANULADO'];
    return !estadosInmutables.includes(reserva.estado);
  }

  activarReserva(reserva: ReservaLocal): void {
    if (!reserva.id) return;
    this.cambiarEstado(reserva.id, 'ACTIVO');
  }

  cancelarReserva(reserva: ReservaLocal): void {
    if (!confirm('¿Está seguro que desea anular esta reserva?')) return;
    if (!reserva.id) return;
    this.cambiarEstado(reserva.id, 'ANULADO');
  }

  eliminarReserva(reserva: ReservaLocal): void {
    if (!confirm('¿Eliminar esta reserva permanentemente?')) return;
    if (!reserva.id) return;

    this.loading = true;

    this.http.delete(`${this.apiUrl}/reservas/${reserva.id}`).subscribe({
      next: () => {
        this.notificationService?.success('✅ Reserva eliminada');
        this.cargarReservas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error eliminando:', error);
        this.notificationService?.error('❌ Error al eliminar');
        this.loading = false;
      },
    });
  }

  cambiarEstado(idReserva: number, nuevoEstado: string): void {
    this.loading = true;

    this.http
      .patch(`${this.apiUrl}/reservas/${idReserva}/estado?nuevoEstado=${nuevoEstado}`, {})
      .subscribe({
        next: () => {
          this.notificationService?.success(`✅ Estado cambiado a ${nuevoEstado}`);
          this.cargarReservas();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error cambiando estado:', error);
          this.notificationService?.error('❌ Error al cambiar estado');
          this.loading = false;
        },
      });
  }

  // ===========================
  // UTILIDADES
  // ===========================

  formatearFechaISO(fecha: any): string {
    if (!fecha) return '';
    if (Array.isArray(fecha)) {
      const [year, month, day] = fecha;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    if (typeof fecha === 'string') {
      return fecha.split('T')[0];
    }
    return '';
  }

  calcularDuracion(horaInicio: string, horaFin: string): string {
    if (!horaInicio || !horaFin) return '30 minutos';

    try {
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFin.split(':').map(Number);
      const duracion = h2 * 60 + m2 - (h1 * 60 + m1);
      return `${duracion} minutos`;
    } catch {
      return '30 minutos';
    }
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      ACTIVO: 'estado-activo',
      'EN RESERVA': 'estado-reserva',
      ANULADO: 'estado-anulado',
      COMPLETADA: 'estado-completada',
      FINALIZADO: 'estado-finalizado', // NUEVO
    };
    return clases[estado] || '';
  }

  getEstadoIcon(estado: string): string {
    const iconos: any = {
      ACTIVO: '✅',
      'EN RESERVA': '⏳',
      ANULADO: '❌',
      COMPLETADA: '✔️',
      FINALIZADO: '🏁', // NUEVO
    };
    return iconos[estado] || '📋';
  }

  formatearFecha(fecha: string): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha + 'T00:00:00');
    return dias[fechaObj.getDay()];
  }

  obtenerNombreSala(): string {
    if (!this.nuevaReservaForm.idSala) return '';
    const sala = this.salasDisponibles.find((s) => s.id === this.nuevaReservaForm.idSala);
    return sala ? sala.nombre : '';
  }

  obtenerNombreCubiculo(): string {
    if (!this.nuevaReservaForm.idCubiculo) return '';
    const cubiculo = this.cubiculosDisponibles.find(
      (c) => c.id === this.nuevaReservaForm.idCubiculo
    );
    return cubiculo ? cubiculo.nombreCubiculo : '';
  }
}
