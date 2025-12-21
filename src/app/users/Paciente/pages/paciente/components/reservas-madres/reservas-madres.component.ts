import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

export interface Reserva {
  id: number;
  sala: string;
  ubicacion: string;
  fecha: Date;
  hora: string;
  duracion: string;
  estado: 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Completada';
  notas?: string;
}

@Component({
  selector: 'app-reservas-madres',
  templateUrl: './reservas-madres.component.html',
  styleUrls: ['./reservas-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ReservasMadresComponent implements OnInit {
  reservas: Reserva[] = [];
  filtroEstado: string = 'Todas';
  mostrarModal = false;
  modoEdicion = false;
  reservaActual: Reserva | null = null;

  // Formulario de nueva reserva
  nuevaReservaForm = {
    sala: '',
    fecha: '',
    hora: '',
    duracion: '60',
    notas: ''
  };

  salasDisponibles = [
    { id: 1, nombre: 'Sala de Lactancia Principal', ubicacion: 'Piso 2' },
    { id: 2, nombre: 'Sala Privada A', ubicacion: 'Piso 3' },
    { id: 3, nombre: 'Sala Privada B', ubicacion: 'Piso 3' },
    { id: 4, nombre: 'Sala Compartida', ubicacion: 'Piso 1' }
  ];

  horariosDisponibles = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    const stored = localStorage.getItem('reservasPaciente');
    if (stored) {
      try {
        this.reservas = JSON.parse(stored).map((r: any) => ({
          ...r,
          fecha: new Date(r.fecha)
        }));
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      }
    } else {
      // Datos de ejemplo
      this.reservas = [
        {
          id: 1,
          sala: 'Sala de Lactancia Principal',
          ubicacion: 'Piso 2',
          fecha: new Date('2024-12-20'),
          hora: '10:00',
          duracion: '60 min',
          estado: 'Confirmada',
          notas: 'Primera extracción del día'
        },
        {
          id: 2,
          sala: 'Sala Privada A',
          ubicacion: 'Piso 3',
          fecha: new Date('2024-12-22'),
          hora: '14:00',
          duracion: '60 min',
          estado: 'Pendiente'
        }
      ];
      this.guardarReservas();
    }
  }

  guardarReservas(): void {
    try {
      localStorage.setItem('reservasPaciente', JSON.stringify(this.reservas));
    } catch (error) {
      console.error('Error al guardar reservas:', error);
    }
  }

  get reservasFiltradas(): Reserva[] {
    if (this.filtroEstado === 'Todas') {
      return this.reservas;
    }
    return this.reservas.filter(r => r.estado === this.filtroEstado);
  }

  abrirModalNueva(): void {
    this.modoEdicion = false;
    this.reservaActual = null;
    this.nuevaReservaForm = {
      sala: '',
      fecha: '',
      hora: '',
      duracion: '60',
      notas: ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.modoEdicion = false;
    this.reservaActual = null;
  }

  crearReserva(): void {
    if (!this.validarFormulario()) {
      return;
    }

    const salaSeleccionada = this.salasDisponibles.find(s => s.nombre === this.nuevaReservaForm.sala);
    
    const nuevaReserva: Reserva = {
      id: Date.now(),
      sala: this.nuevaReservaForm.sala,
      ubicacion: salaSeleccionada?.ubicacion || '',
      fecha: new Date(this.nuevaReservaForm.fecha),
      hora: this.nuevaReservaForm.hora,
      duracion: `${this.nuevaReservaForm.duracion} min`,
      estado: 'Pendiente',
      notas: this.nuevaReservaForm.notas
    };

    this.reservas.unshift(nuevaReserva);
    this.guardarReservas();
    this.cerrarModal();
    this.notificationService.success('✅ Reserva creada exitosamente');
  }

  private validarFormulario(): boolean {
    if (!this.nuevaReservaForm.sala) {
      this.notificationService.error('❌ Debes seleccionar una sala');
      return false;
    }
    if (!this.nuevaReservaForm.fecha) {
      this.notificationService.error('❌ Debes seleccionar una fecha');
      return false;
    }
    if (!this.nuevaReservaForm.hora) {
      this.notificationService.error('❌ Debes seleccionar una hora');
      return false;
    }

    const fechaSeleccionada = new Date(this.nuevaReservaForm.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      this.notificationService.error('❌ No puedes reservar en fechas pasadas');
      return false;
    }

    return true;
  }

  cancelarReserva(reserva: Reserva): void {
    if (reserva.estado === 'Cancelada') {
      this.notificationService.warning('⚠️ Esta reserva ya está cancelada');
      return;
    }

    const mensaje = `¿Estás segura de que deseas cancelar la reserva de "${reserva.sala}" el ${this.formatearFecha(reserva.fecha)}?`;
    
    if (confirm(mensaje)) {
      reserva.estado = 'Cancelada';
      this.guardarReservas();
      this.notificationService.success('✅ Reserva cancelada exitosamente');
    }
  }

  confirmarReserva(reserva: Reserva): void {
    if (reserva.estado !== 'Pendiente') {
      return;
    }

    reserva.estado = 'Confirmada';
    this.guardarReservas();
    this.notificationService.success('✅ Reserva confirmada');
  }

  eliminarReserva(reserva: Reserva): void {
    if (confirm('¿Estás segura de eliminar permanentemente esta reserva?')) {
      this.reservas = this.reservas.filter(r => r.id !== reserva.id);
      this.guardarReservas();
      this.notificationService.success('🗑️ Reserva eliminada');
    }
  }

  formatearFecha(fecha: Date): string {
    const d = new Date(fecha);
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    if (d.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    }
    if (d.toDateString() === manana.toDateString()) {
      return 'Mañana';
    }

    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  }

  getEstadoClass(estado: string): string {
    return {
      'Confirmada': 'confirmada',
      'Pendiente': 'pendiente',
      'Cancelada': 'cancelada',
      'Completada': 'completada'
    }[estado] || 'pendiente';
  }

  getEstadoIcon(estado: string): string {
    return {
      'Confirmada': '✅',
      'Pendiente': '⏳',
      'Cancelada': '❌',
      'Completada': '✔️'
    }[estado] || '⏳';
  }
}