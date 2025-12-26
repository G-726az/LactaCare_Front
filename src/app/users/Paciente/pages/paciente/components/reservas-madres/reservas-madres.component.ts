import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService, Reserva, SalaLactancia } from '../../../../../../services/reserva.service';
import { AuthService } from '../../../../../../services/auth.service';
import { NotificationService } from '../services/notification.service';

interface ReservaLocal {
  id?: number;
  sala: string;
  ubicacion: string;
  fecha: string;
  hora: string;
  duracion: string;
  estado: string;
  notas?: string;
}

@Component({
  selector: 'app-reservas-madres',
  templateUrl: './reservas-madres.component.html',
  styleUrls: ['./reservas-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ReservasMadresComponent implements OnInit {
  reservas: ReservaLocal[] = [];
  salasDisponibles: any[] = [];

  horariosDisponibles: string[] = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
  ];

  filtroEstado: string = 'Todas';
  loading = false;
  mostrarModal = false;
  modoEdicion = false;

  nuevaReservaForm: any = {
    sala: '',
    fecha: '',
    hora: '',
    duracion: '60',
    notas: '',
  };

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarSalasDisponibles();
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;

    // Obtener ID del usuario autenticado
    const currentUser = this.authService.currentUserValue;

    if (!currentUser || !currentUser.id) {
      console.error('❌ Usuario no autenticado');
      this.loading = false;
      return;
    }

    const idPaciente = currentUser.id;

    console.log('🔄 Cargando reservas para paciente ID:', idPaciente);

    this.reservaService.getReservasByPaciente(idPaciente).subscribe({
      next: (reservas) => {
        console.log('✅ Reservas recibidas del backend:', reservas);

        // Mapear las reservas al formato del HTML
        this.reservas = reservas.map((r: Reserva) => ({
          id: r.id,
          sala: r.sala?.nombreCMedico || 'Sala sin nombre',
          ubicacion: r.sala?.direccionCMedico || 'Ubicación no especificada',
          fecha: this.formatearFechaISO(r.fecha),
          hora: `${r.horaInicio} - ${r.horaFin}`,
          duracion: this.calcularDuracion(r.horaInicio, r.horaFin),
          estado: r.estado,
          notas: '',
        }));

        console.log('✅ Reservas mapeadas:', this.reservas);

        // Guardar en localStorage para estadísticas
        localStorage.setItem('reservasPaciente', JSON.stringify(this.reservas));

        this.loading = false;

        if (this.reservas.length === 0) {
          console.log('ℹ️ No hay reservas para este paciente');
        }
      },
      error: (error) => {
        console.error('❌ Error cargando reservas:', error);

        if (this.notificationService) {
          this.notificationService.error('❌ Error al cargar reservas');
        }

        this.loading = false;
        // Intentar cargar datos demo o desde localStorage
        this.cargarReservasLocales();
      },
    });
  }

  cargarReservasLocales(): void {
    console.log('🔄 Intentando cargar reservas desde localStorage');

    const reservasStr = localStorage.getItem('reservasPaciente');
    if (reservasStr) {
      try {
        this.reservas = JSON.parse(reservasStr);
        console.log('✅ Reservas cargadas desde localStorage:', this.reservas);
      } catch (error) {
        console.error('❌ Error al parsear reservas locales:', error);
        this.reservas = [];
      }
    } else {
      console.log('ℹ️ No hay reservas en localStorage');
      this.reservas = [];
    }
  }

  formatearFechaISO(fecha: any): string {
    if (!fecha) return '';

    // Si es un array [año, mes, día]
    if (Array.isArray(fecha)) {
      const [year, month, day] = fecha;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Si es una cadena ISO
    if (typeof fecha === 'string') {
      return fecha.split('T')[0];
    }

    return '';
  }

  calcularDuracion(horaInicio: string, horaFin: string): string {
    if (!horaInicio || !horaFin) return '60 minutos';

    try {
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFin.split(':').map(Number);

      const minutos1 = h1 * 60 + m1;
      const minutos2 = h2 * 60 + m2;

      const duracionMinutos = minutos2 - minutos1;

      return `${duracionMinutos} minutos`;
    } catch (error) {
      console.error('Error calculando duración:', error);
      return '60 minutos';
    }
  }

  cargarSalasDisponibles(): void {
    console.log('🔄 Cargando salas disponibles');

    this.reservaService.getSalasDisponibles().subscribe({
      next: (salas) => {
        console.log('✅ Salas recibidas del backend:', salas);

        this.salasDisponibles = salas.map((s: SalaLactancia) => ({
          id: s.idLactario,
          nombre: s.nombreCMedico,
          ubicacion: s.direccionCMedico,
        }));

        console.log('✅ Salas mapeadas:', this.salasDisponibles);
      },
      error: (error) => {
        console.error('❌ Error cargando salas:', error);

        // Usar datos por defecto
        this.salasDisponibles = [
          { id: 1, nombre: 'Sala Principal', ubicacion: 'Piso 1, Área A' },
          { id: 2, nombre: 'Sala Secundaria', ubicacion: 'Piso 2, Área B' },
          { id: 3, nombre: 'Sala VIP', ubicacion: 'Piso 3, Área Premium' },
        ];
      },
    });
  }

  get reservasFiltradas(): ReservaLocal[] {
    if (this.filtroEstado === 'Todas') {
      return this.reservas;
    }
    return this.reservas.filter((r) => r.estado === this.filtroEstado);
  }

  abrirModalNueva(): void {
    this.mostrarModal = true;
    this.modoEdicion = false;
    this.nuevaReservaForm = {
      sala: '',
      fecha: '',
      hora: '',
      duracion: '60',
      notas: '',
    };
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.nuevaReservaForm = {
      sala: '',
      fecha: '',
      hora: '',
      duracion: '60',
      notas: '',
    };
  }

  crearReserva(): void {
    if (
      !this.nuevaReservaForm.sala ||
      !this.nuevaReservaForm.fecha ||
      !this.nuevaReservaForm.hora
    ) {
      alert('⚠️ Por favor completa todos los campos obligatorios');
      return;
    }

    this.loading = true;

    const currentUser = this.authService.currentUserValue;

    if (!currentUser || !currentUser.id) {
      alert('❌ No se encontró información del usuario');
      this.loading = false;
      return;
    }

    // Calcular hora fin basada en duración
    const [hora, minutos] = this.nuevaReservaForm.hora.split(':');
    const horaInicio = new Date();
    horaInicio.setHours(parseInt(hora), parseInt(minutos));

    const horaFin = new Date(horaInicio);
    horaFin.setMinutes(horaFin.getMinutes() + parseInt(this.nuevaReservaForm.duracion));

    const request = {
      idPersonaPaciente: currentUser.id,
      idSala: parseInt(this.nuevaReservaForm.sala),
      fecha: this.nuevaReservaForm.fecha,
      horaInicio: this.nuevaReservaForm.hora,
      horaFin: `${horaFin.getHours()}:${String(horaFin.getMinutes()).padStart(2, '0')}`,
      estado: 'Pendiente',
    };

    console.log('📤 Creando reserva:', request);

    this.reservaService.crearReserva(request).subscribe({
      next: (response) => {
        console.log('✅ Reserva creada:', response);

        if (this.notificationService) {
          this.notificationService.success('✅ Reserva creada exitosamente');
        } else {
          alert('✅ Reserva creada exitosamente');
        }

        this.cerrarModal();
        this.cargarReservas();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error creando reserva:', error);

        if (this.notificationService) {
          this.notificationService.error('❌ Error al crear la reserva');
        } else {
          alert('❌ Error al crear la reserva');
        }

        this.loading = false;
      },
    });
  }

  confirmarReserva(reserva: ReservaLocal): void {
    if (!reserva.id) return;

    this.loading = true;
    console.log('✅ Confirmando reserva ID:', reserva.id);

    this.reservaService.confirmarReserva(reserva.id).subscribe({
      next: (response) => {
        console.log('✅ Reserva confirmada:', response);

        if (this.notificationService) {
          this.notificationService.success('✅ Reserva confirmada exitosamente');
        } else {
          alert('✅ Reserva confirmada exitosamente');
        }

        this.cargarReservas();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error confirmando reserva:', error);

        if (this.notificationService) {
          this.notificationService.error('❌ Error al confirmar la reserva');
        } else {
          alert('❌ Error al confirmar la reserva');
        }

        this.loading = false;
      },
    });
  }

  cancelarReserva(reserva: ReservaLocal): void {
    if (!confirm('¿Está seguro que desea cancelar esta reserva?')) {
      return;
    }

    if (!reserva.id) return;

    this.loading = true;
    console.log('❌ Cancelando reserva ID:', reserva.id);

    this.reservaService.cancelarReserva(reserva.id).subscribe({
      next: (response) => {
        console.log('✅ Reserva cancelada:', response);

        if (this.notificationService) {
          this.notificationService.success('✅ Reserva cancelada exitosamente');
        } else {
          alert('✅ Reserva cancelada exitosamente');
        }

        this.cargarReservas();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cancelando reserva:', error);

        if (this.notificationService) {
          this.notificationService.error('❌ Error al cancelar la reserva');
        } else {
          alert('❌ Error al cancelar la reserva');
        }

        this.loading = false;
      },
    });
  }

  eliminarReserva(reserva: ReservaLocal): void {
    if (
      !confirm('¿Está seguro que desea eliminar esta reserva? Esta acción no se puede deshacer.')
    ) {
      return;
    }

    console.log('🗑️ Eliminar reserva:', reserva.id);
    // TODO: Implementar método delete en el servicio si existe en tu API
  }

  // Métodos auxiliares para el HTML
  getEstadoClass(estado: string): string {
    const clases: any = {
      Confirmada: 'confirmada',
      Pendiente: 'pendiente',
      Cancelada: 'cancelada',
      Completada: 'completada',
    };
    return clases[estado] || '';
  }

  getEstadoIcon(estado: string): string {
    const iconos: any = {
      Confirmada: '✅',
      Pendiente: '⏳',
      Cancelada: '❌',
      Completada: '✔️',
    };
    return iconos[estado] || '📋';
  }

  formatearFecha(fecha: string): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha + 'T00:00:00');
    return dias[fechaObj.getDay()];
  }
}
