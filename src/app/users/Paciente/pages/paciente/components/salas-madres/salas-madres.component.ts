import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { SalaService, SalaLactancia } from '../services/sala.service';
import { ReservaService } from '../../../../../../services/reserva.service';
import { AuthService } from '../../../../../../services/auth.service';

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
  institucion?: string;
  diasAtencion?: string;
}

@Component({
  selector: 'app-salas-madres',
  templateUrl: './salas-madres.component.html',
  styleUrls: ['./salas-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SalasMadresComponent implements OnInit, OnDestroy {
  salas: Sala[] = [];
  loading = false;
  filtroDisponibilidad: string = 'Todas';
  salaSeleccionada: Sala | null = null;
  mostrarDetalle = false;
  busqueda: string = '';
  
  private refreshInterval: any;

  constructor(
    private notificationService: NotificationService,
    private salaService: SalaService,
    private reservaService: ReservaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarSalasDesdeBackend();
    
    // Actualizar salas cada 2 minutos
    this.refreshInterval = setInterval(() => {
      this.cargarSalasDesdeBackend(true);
    }, 120000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * Cargar salas desde el backend
   */
  cargarSalasDesdeBackend(silencioso: boolean = false): void {
    if (!silencioso) {
      this.loading = true;
    }
    
    console.log('🔄 Cargando salas desde el backend...');

    this.salaService.getAllSalas().subscribe({
      next: (salasBackend) => {
        console.log('✅ Salas recibidas del backend:', salasBackend);
        
        // Mapear datos del backend al formato del componente
        this.salas = salasBackend.map(sala => this.mapearSalaBackendALocal(sala));
        
        console.log('✅ Salas mapeadas:', this.salas);
        
        // Guardar en localStorage como respaldo
        this.guardarDatosLocales();
        
        if (!silencioso) {
          this.loading = false;
          
          if (this.salas.length === 0) {
            this.notificationService.info('ℹ️ No hay salas registradas en este momento');
          }
        }
      },
      error: (error) => {
        console.error('❌ Error cargando salas:', error);
        
        if (!silencioso) {
          this.notificationService.error(error.message || '❌ Error al cargar las salas');
          
          // Intentar cargar desde localStorage como fallback
          this.cargarDatosLocales();
        }
        
        this.loading = false;
      }
    });
  }

  /**
   * Mapear sala del backend al formato local
   */
  mapearSalaBackendALocal(salaBackend: SalaLactancia): Sala {
    // Construir horario desde horarioSala
    let horario = 'Horario no disponible';
    if (salaBackend.horarioSala) {
      const apertura = salaBackend.horarioSala.horaApertura || '';
      const cierre = salaBackend.horarioSala.horaCierre || '';
      horario = `${apertura} - ${cierre}`;
      
      if (salaBackend.horarioSala.horaInicioDescanso && salaBackend.horarioSala.horaFinDescanso) {
        horario += ` (Descanso: ${salaBackend.horarioSala.horaInicioDescanso} - ${salaBackend.horarioSala.horaFinDescanso})`;
      }
    }

    // Construir días de atención
    let diasAtencion = 'No especificado';
    if (salaBackend.diasLaborablesSala) {
      const dias = [];
      if (salaBackend.diasLaborablesSala.lunes) dias.push('Lun');
      if (salaBackend.diasLaborablesSala.martes) dias.push('Mar');
      if (salaBackend.diasLaborablesSala.miercoles) dias.push('Mié');
      if (salaBackend.diasLaborablesSala.jueves) dias.push('Jue');
      if (salaBackend.diasLaborablesSala.viernes) dias.push('Vie');
      if (salaBackend.diasLaborablesSala.sabado) dias.push('Sáb');
      if (salaBackend.diasLaborablesSala.domingo) dias.push('Dom');
      
      if (dias.length > 0) {
        diasAtencion = dias.join(', ');
      }
    }

    // Por ahora, establecer valores por defecto para capacidad
    // TODO: Agregar estos campos en el backend
    const capacidad = 5;
    const ocupadas = Math.floor(Math.random() * (capacidad + 1));
    
    return {
      Id_Lactario: salaBackend.idLactario,
      Nombre_CMedico: salaBackend.nombreCMedico,
      Direccion_CMedico: salaBackend.direccionCMedico,
      Telefono_CMedico: salaBackend.telefonoCMedico,
      Horario_CMedico: horario,
      Disponible: ocupadas < capacidad,
      Capacidad: capacidad,
      Ocupadas: ocupadas,
      Servicios: ['Refrigerador', 'Privacidad', 'Silla cómoda', 'Toma corriente'],
      Calificacion: 4.5,
      Imagen: 'assets/sala-default.jpg',
      institucion: salaBackend.institucion?.nombreInstitucion || 'Sin institución',
      diasAtencion: diasAtencion
    };
  }

  /**
   * Cargar datos desde localStorage (fallback)
   */
  cargarDatosLocales(): void {
    console.log('📦 Cargando salas desde localStorage...');
    const stored = localStorage.getItem('salas_lactancia');
    
    if (stored) {
      try {
        this.salas = JSON.parse(stored);
        console.log('✅ Salas cargadas desde localStorage:', this.salas.length);
      } catch (error) {
        console.error('❌ Error al cargar salas desde localStorage:', error);
        this.salas = [];
      }
    } else {
      console.log('ℹ️ No hay salas en localStorage');
      this.salas = [];
    }
  }

  /**
   * Guardar datos en localStorage
   */
  guardarDatosLocales(): void {
    try {
      localStorage.setItem('salas_lactancia', JSON.stringify(this.salas));
      console.log('💾 Salas guardadas en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar salas en localStorage:', error);
    }
  }

  /**
   * Obtener salas filtradas
   */
  get salasFiltradas(): Sala[] {
    let resultado = this.salas;

    // Filtrar por disponibilidad
    switch(this.filtroDisponibilidad) {
      case 'Disponibles':
        resultado = resultado.filter(s => s.Disponible);
        break;
      case 'Ocupadas':
        resultado = resultado.filter(s => !s.Disponible);
        break;
    }

    // Filtrar por búsqueda
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(s => 
        s.Nombre_CMedico.toLowerCase().includes(busquedaLower) ||
        s.Direccion_CMedico.toLowerCase().includes(busquedaLower) ||
        s.institucion?.toLowerCase().includes(busquedaLower)
      );
    }

    return resultado;
  }

  /**
   * Buscar salas por ubicación en el backend
   */
  buscarSalas(): void {
    if (!this.busqueda.trim()) {
      this.cargarSalasDesdeBackend();
      return;
    }

    this.loading = true;
    console.log('🔍 Buscando salas:', this.busqueda);

    this.salaService.buscarSalasPorUbicacion(this.busqueda).subscribe({
      next: (salasBackend) => {
        this.salas = salasBackend.map(sala => this.mapearSalaBackendALocal(sala));
        this.loading = false;
        
        if (this.salas.length === 0) {
          this.notificationService.info('🔍 No se encontraron salas con esa ubicación');
        }
      },
      error: (error) => {
        console.error('❌ Error en búsqueda:', error);
        this.notificationService.error('❌ Error al buscar salas');
        this.loading = false;
      }
    });
  }

  /**
   * Limpiar búsqueda
   */
  limpiarBusqueda(): void {
    this.busqueda = '';
    this.cargarSalasDesdeBackend();
  }

  /**
   * Reservar sala
   */
  reservarSala(sala: Sala): void {
    if (!sala.Disponible) {
      this.notificationService.warning('⚠️ Esta sala no está disponible en este momento');
      return;
    }

    const confirmacion = confirm(
      `¿Deseas reservar "${sala.Nombre_CMedico}"?\n\n` +
      `📍 ${sala.Direccion_CMedico}\n` +
      `🕐 ${sala.Horario_CMedico}\n` +
      `📅 ${sala.diasAtencion}\n` +
      `👥 Disponibilidad: ${sala.Capacidad - sala.Ocupadas}/${sala.Capacidad} espacios`
    );

    if (!confirmacion) {
      return;
    }

    this.loading = true;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.id) {
      this.notificationService.error('❌ Debes iniciar sesión para reservar');
      this.loading = false;
      return;
    }

    // Obtener fecha y hora actual
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0];
    const horaInicio = ahora.toTimeString().split(' ')[0].substring(0, 5);
    
    // Calcular hora fin (1 hora después)
    const horaFin = new Date(ahora.getTime() + 60 * 60 * 1000)
      .toTimeString()
      .split(' ')[0]
      .substring(0, 5);

    const reservaRequest = {
      idPersonaPaciente: currentUser.id,
      idSala: sala.Id_Lactario,
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: horaFin,
      estado: 'Pendiente'
    };

    console.log('📤 Creando reserva:', reservaRequest);

    this.reservaService.crearReserva(reservaRequest).subscribe({
      next: (response) => {
        console.log('✅ Reserva creada:', response);
        
        // Actualizar ocupación localmente
        sala.Ocupadas++;
        if (sala.Ocupadas >= sala.Capacidad) {
          sala.Disponible = false;
        }
        this.guardarDatosLocales();

        this.notificationService.success('✅ Reserva realizada exitosamente');
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al crear reserva:', error);
        this.notificationService.error(error.message || '❌ Error al realizar la reserva');
        this.loading = false;
      }
    });
  }

  /**
   * Ver detalle de la sala
   */
  verDetalle(sala: Sala): void {
    this.salaSeleccionada = sala;
    this.mostrarDetalle = true;
  }

  /**
   * Cerrar modal de detalle
   */
  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.salaSeleccionada = null;
  }

  /**
   * Abrir Google Maps con la ubicación
   */
  verMapa(sala: Sala): void {
    const direccion = encodeURIComponent(sala.Direccion_CMedico);
    const url = `https://www.google.com/maps/search/?api=1&query=${direccion}`;
    
    window.open(url, '_blank');
    this.notificationService.info('🗺️ Abriendo Google Maps...');
  }

  /**
   * Llamar a la sala
   */
  llamarSala(sala: Sala): void {
    if (confirm(`¿Deseas llamar a ${sala.Nombre_CMedico}?\n\nTeléfono: ${sala.Telefono_CMedico}`)) {
      window.location.href = `tel:${sala.Telefono_CMedico}`;
    }
  }

  /**
   * Obtener texto de disponibilidad
   */
  getDisponibilidadTexto(sala: Sala): string {
    const disponibles = sala.Capacidad - sala.Ocupadas;
    if (disponibles === 0) return 'No disponible';
    if (disponibles === 1) return '1 espacio disponible';
    return `${disponibles} espacios disponibles`;
  }

  /**
   * Obtener clase CSS según disponibilidad
   */
  getDisponibilidadClass(sala: Sala): string {
    const disponibles = sala.Capacidad - sala.Ocupadas;
    const porcentaje = (disponibles / sala.Capacidad) * 100;
    
    if (porcentaje === 0) return 'no-disponible';
    if (porcentaje <= 25) return 'casi-lleno';
    if (porcentaje <= 50) return 'medio-disponible';
    return 'muy-disponible';
  }

  /**
   * Generar estrellas de calificación
   */
  generarEstrellas(calificacion: number): string {
    const estrellasLlenas = Math.floor(calificacion);
    const tieneMedia = calificacion % 1 !== 0;
    let estrellas = '⭐'.repeat(estrellasLlenas);
    if (tieneMedia) estrellas += '½';
    return estrellas;
  }

  /**
   * Marcar/desmarcar como favorita
   */
  marcarFavorito(sala: Sala, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
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

  /**
   * Verificar si una sala es favorita
   */
  esFavorita(sala: Sala): boolean {
    const favoritos = JSON.parse(localStorage.getItem('salas_favoritas') || '[]');
    return favoritos.includes(sala.Id_Lactario);
  }

  /**
   * Recargar salas manualmente
   */
  recargarSalas(): void {
    this.cargarSalasDesdeBackend();
  }
}