import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

interface Sala {
  Id_Lactario: number;
  Nombre_CMedico: string;
  Direccion_CMedico: string;
  Telefono_CMedico: string;
  Horario_CMedico: string;
  Disponible: boolean;
  Capacidad: number;
  Ocupadas: number;
  Servicios: string[];
  Calificacion: number;
  Imagen?: string;
}

@Component({
  selector: 'app-salas-madres',
  templateUrl: './salas-madres.component.html',
  styleUrls: ['./salas-madres.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SalasMadresComponent implements OnInit {
  salas: Sala[] = [
    {
      Id_Lactario: 1,
      Nombre_CMedico: 'Lactario Central',
      Direccion_CMedico: 'Av. Amazonas N23-45, Edificio Principal',
      Telefono_CMedico: '022222222',
      Horario_CMedico: '08:00 - 18:00',
      Disponible: true,
      Capacidad: 5,
      Ocupadas: 2,
      Servicios: ['Refrigerador', 'Privacidad', 'Silla cómoda', 'Toma corriente'],
      Calificacion: 4.5,
      Imagen: 'assets/sala-1.jpg'
    },
    {
      Id_Lactario: 2,
      Nombre_CMedico: 'Lactario Pediátrico',
      Direccion_CMedico: 'Av. Patria N45-67, Piso 3',
      Telefono_CMedico: '023333333',
      Horario_CMedico: '07:00 - 17:00',
      Disponible: true,
      Capacidad: 3,
      Ocupadas: 0,
      Servicios: ['Refrigerador', 'Música relajante', 'Área privada', 'Cambiador'],
      Calificacion: 4.8,
      Imagen: 'assets/sala-2.jpg'
    },
    {
      Id_Lactario: 3,
      Nombre_CMedico: 'Lactario Especializado',
      Direccion_CMedico: 'Calle 10 de Agosto, Torre A',
      Telefono_CMedico: '024444444',
      Horario_CMedico: '09:00 - 19:00',
      Disponible: false,
      Capacidad: 4,
      Ocupadas: 4,
      Servicios: ['Refrigerador', 'Extractor eléctrico', 'TV', 'WiFi'],
      Calificacion: 4.3,
      Imagen: 'assets/sala-3.jpg'
    },
    {
      Id_Lactario: 4,
      Nombre_CMedico: 'Sala Privada Premium',
      Direccion_CMedico: 'Av. González Suárez N12-34',
      Telefono_CMedico: '025555555',
      Horario_CMedico: '24 horas',
      Disponible: true,
      Capacidad: 2,
      Ocupadas: 1,
      Servicios: ['Refrigerador', 'Baño privado', 'Ducha', 'Sofá cama', 'Climatización'],
      Calificacion: 5.0,
      Imagen: 'assets/sala-4.jpg'
    }
  ];

  filtroDisponibilidad: string = 'Todas';
  salaSeleccionada: Sala | null = null;
  mostrarDetalle = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    const stored = localStorage.getItem('salas_lactancia');
    if (stored) {
      try {
        this.salas = JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar salas:', error);
      }
    }
  }

  guardarDatos(): void {
    try {
      localStorage.setItem('salas_lactancia', JSON.stringify(this.salas));
    } catch (error) {
      console.error('Error al guardar salas:', error);
    }
  }

  get salasFiltradas(): Sala[] {
    switch(this.filtroDisponibilidad) {
      case 'Disponibles':
        return this.salas.filter(s => s.Disponible);
      case 'Ocupadas':
        return this.salas.filter(s => !s.Disponible);
      default:
        return this.salas;
    }
  }

  reservarSala(sala: Sala): void {
    if (!sala.Disponible) {
      this.notificationService.warning('⚠️ Esta sala no está disponible en este momento');
      return;
    }

    const confirmacion = confirm(
      `¿Deseas reservar "${sala.Nombre_CMedico}"?\n\n` +
      `📍 ${sala.Direccion_CMedico}\n` +
      `🕐 ${sala.Horario_CMedico}\n` +
      `👥 Disponibilidad: ${sala.Capacidad - sala.Ocupadas}/${sala.Capacidad} espacios`
    );

    if (confirmacion) {
      // Crear reserva
      const nuevaReserva = {
        id: Date.now(),
        salaId: sala.Id_Lactario,
        sala: sala.Nombre_CMedico,
        ubicacion: sala.Direccion_CMedico,
        fecha: new Date(),
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        duracion: '60 min',
        estado: 'Confirmada'
      };

      // Guardar en localStorage
      const reservasExistentes = localStorage.getItem('reservasPaciente');
      const reservas = reservasExistentes ? JSON.parse(reservasExistentes) : [];
      reservas.push(nuevaReserva);
      localStorage.setItem('reservasPaciente', JSON.stringify(reservas));

      // Actualizar ocupación
      sala.Ocupadas++;
      if (sala.Ocupadas >= sala.Capacidad) {
        sala.Disponible = false;
      }
      this.guardarDatos();

      this.notificationService.success('✅ Reserva realizada exitosamente');
    }
  }

  verDetalle(sala: Sala): void {
    this.salaSeleccionada = sala;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.salaSeleccionada = null;
  }

  verMapa(sala: Sala): void {
    // Construir URL de Google Maps
    const direccion = encodeURIComponent(sala.Direccion_CMedico);
    const url = `https://www.google.com/maps/search/?api=1&query=${direccion}`;
    
    window.open(url, '_blank');
    this.notificationService.info('🗺️ Abriendo Google Maps...');
  }

  llamarSala(sala: Sala): void {
    if (confirm(`¿Deseas llamar a ${sala.Nombre_CMedico}?\n\nTeléfono: ${sala.Telefono_CMedico}`)) {
      window.location.href = `tel:${sala.Telefono_CMedico}`;
    }
  }

  getDisponibilidadTexto(sala: Sala): string {
    const disponibles = sala.Capacidad - sala.Ocupadas;
    if (disponibles === 0) return 'No disponible';
    if (disponibles === 1) return '1 espacio disponible';
    return `${disponibles} espacios disponibles`;
  }

  getDisponibilidadClass(sala: Sala): string {
    const disponibles = sala.Capacidad - sala.Ocupadas;
    const porcentaje = (disponibles / sala.Capacidad) * 100;
    
    if (porcentaje === 0) return 'no-disponible';
    if (porcentaje <= 25) return 'casi-lleno';
    if (porcentaje <= 50) return 'medio-disponible';
    return 'muy-disponible';
  }

  generarEstrellas(calificacion: number): string {
    const estrellasLlenas = Math.floor(calificacion);
    const tieneMedia = calificacion % 1 !== 0;
    let estrellas = '⭐'.repeat(estrellasLlenas);
    if (tieneMedia) estrellas += '½';
    return estrellas;
  }

  marcarFavorito(sala: Sala): void {
    const favoritos = JSON.parse(localStorage.getItem('salas_favoritas') || '[]');
    const index = favoritos.indexOf(sala.Id_Lactario);
    
    if (index > -1) {
      favoritos.splice(index, 1);
      this.notificationService.info('💔 Eliminado de favoritos');
    } else {
      favoritos.push(sala.Id_Lactario);
      this.notificationService.success('💖 Agregado a favoritos');
    }
    
    localStorage.setItem('salas_favoritas', JSON.stringify(favoritos));
  }

  esFavorita(sala: Sala): boolean {
    const favoritos = JSON.parse(localStorage.getItem('salas_favoritas') || '[]');
    return favoritos.includes(sala.Id_Lactario);
  }
}