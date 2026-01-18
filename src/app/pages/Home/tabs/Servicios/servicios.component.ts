import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  imagen: string;
  detalles: string[];
  precio?: number;
  duracion?: string;
}

interface Testimonio {
  id: number;
  nombre: string;
  cargo: string;
  texto: string;
  imagen: string;
  rating: number;
  fecha: string;
}

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ServiciosComponent implements OnInit {
  // Datos principales
  servicios: Servicio[] = [
    {
      id: 1,
      nombre: 'Consultas Médicas',
      descripcion: 'Atención especializada con médicos expertos en lactancia materna',
      icono: 'fas fa-stethoscope',
      imagen: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      detalles: [
        'Evaluación inicial completa',
        'Seguimiento personalizado',
        'Resolución de problemas comunes',
        'Plan de lactancia individualizado',
        'Control del crecimiento del bebé'
      ],
      duracion: '45-60 minutos'
    },
    {
      id: 2,
      nombre: 'Asesoría Nutricional',
      descripcion: 'Planes alimenticios diseñados especialmente para ti',
      icono: 'fas fa-apple-alt',
      imagen: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      detalles: [
        'Dietas balanceadas para la madre',
        'Suplementación adecuada',
        'Recetas saludables y prácticas',
        'Planificación de comidas',
        'Control de peso postparto'
      ],
      duracion: '60 minutos'
    },
    {
      id: 3,
      nombre: 'Lactario Privado',
      descripcion: 'Espacios cómodos y seguros para la extracción de leche',
      icono: 'fas fa-baby',
      imagen: 'https://images.unsplash.com/photo-1548691905-57c36cc8d935?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      detalles: [
        'Ambiente climatizado',
        'Equipamiento moderno',
        'Privacidad garantizada',
        'Zona de descanso',
        'Wi-Fi y enchufes disponibles'
      ],
      duracion: 'Por horas'
    },
    {
      id: 4,
      nombre: 'Almacenamiento de Leche',
      descripcion: 'Refrigeración controlada para conservar la leche materna',
      icono: 'fas fa-temperature-low',
      imagen: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      detalles: [
        'Temperatura monitoreada 24/7',
        'Contenedores estériles',
        'Sistema de alertas',
        'Etiquetado personalizado',
        'Control de inventario'
      ],
      duracion: 'Mensual'
    },
    {
      id: 5,
      nombre: 'Citas Programadas',
      descripcion: 'Sistema de reservas online para tu comodidad',
      icono: 'fas fa-calendar-check',
      imagen: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      detalles: [
        'Horarios flexibles',
        'Recordatorios automáticos',
        'Reprogramación fácil',
        'Sistema en línea 24/7',
        'Confirmación inmediata'
      ],
      duracion: 'Según necesidad'
    },
    {
      id: 6,
      nombre: 'Apoyo Emocional',
      descripcion: 'Acompañamiento en tu proceso de lactancia',
      icono: 'fas fa-hands-helping',
      imagen: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
      detalles: [
        'Grupos de apoyo semanales',
        'Asesoría psicológica',
        'Red de madres',
        'Talleres emocionales',
        'Seguimiento continuo'
      ],
      duracion: 'Sesiones de 60 min'
    }
  ];

  testimonios: Testimonio[] = [
    {
      id: 1,
      nombre: 'María García',
      cargo: 'Madre de 2',
      texto: 'Excelente atención, el personal es muy profesional y cálido. Me ayudaron en momentos difíciles de mi lactancia.',
      imagen: 'https://randomuser.me/api/portraits/women/32.jpg',
      rating: 5,
      fecha: '2024-03-15'
    },
    {
      id: 2,
      nombre: 'Ana Rodríguez',
      cargo: 'Primera vez mamá',
      texto: 'Las instalaciones son impecables y el ambiente es muy tranquilo. Me siento segura y apoyada en cada visita.',
      imagen: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 5,
      fecha: '2024-02-28'
    },
    {
      id: 3,
      nombre: 'Laura Mendoza',
      cargo: 'Madre trabajadora',
      texto: 'El sistema de reservas es muy fácil de usar y siempre me recuerdan mis citas. ¡Súper recomendado!',
      imagen: 'https://randomuser.me/api/portraits/women/65.jpg',
      rating: 5,
      fecha: '2024-03-10'
    }
  ];

  // Servicio seleccionado para modal
  selectedServicio: Servicio | null = null;
  
  // Estadísticas
  estadisticas = {
    madres: 1500,
    satisfaccion: 98,
    experiencia: 5,
    lactarios: 8
  };

  // Características principales
  caracteristicas = [
    {
      icono: 'fas fa-user-md',
      titulo: 'Personal Especializado',
      descripcion: 'Equipo médico certificado en lactancia materna con amplia experiencia y formación continua'
    },
    {
      icono: 'fas fa-clinic-medical',
      titulo: 'Instalaciones Modernas',
      descripcion: 'Espacios diseñados especialmente para tu comodidad con tecnología de última generación'
    },
    {
      icono: 'fas fa-user-cog',
      titulo: 'Atención Personalizada',
      descripcion: 'Cada madre es única y merece un plan de cuidados adaptado a sus necesidades específicas'
    },
    {
      icono: 'fas fa-clock',
      titulo: 'Disponibilidad 24/7',
      descripcion: 'Asesoría y apoyo disponible en todo momento cuando más lo necesites, sin interrupciones'
    }
  ];

  // Estado para modales
  showReservaModal = false;
  showDetalleModal = false;
  loading = false;

  // Datos del formulario
  reservaData = {
    servicio: '',
    fecha: '',
    hora: '',
    notas: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEstadisticas();
    this.startCounterAnimation();
  }

  loadEstadisticas(): void {
    // Simular carga de estadísticas
    setTimeout(() => {
      this.animateCounter('madres', 0, this.estadisticas.madres, 2000);
      this.animateCounter('satisfaccion', 0, this.estadisticas.satisfaccion, 2000);
      this.animateCounter('experiencia', 0, this.estadisticas.experiencia, 2000);
    }, 500);
  }

  animateCounter(stat: keyof typeof this.estadisticas, start: number, end: number, duration: number): void {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      this.estadisticas[stat] = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  startCounterAnimation(): void {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;
    
    counters.forEach(counter => {
      const target = +(counter.getAttribute('data-target') || 0);
      const updateCount = () => {
        const count = +counter.innerHTML;
        const inc = target / speed;
        
        if (count < target) {
          counter.innerHTML = Math.ceil(count + inc).toString();
          setTimeout(updateCount, 1);
        } else {
          counter.innerHTML = target.toString();
        }
      };
      
      updateCount();
    });
  }

  selectServicio(servicio: Servicio): void {
    this.selectedServicio = servicio;
    this.showDetalleModal = true;
    this.reservaData.servicio = servicio.id.toString();
  }

  abrirReservaModal(): void {
    this.showReservaModal = true;
  }

  cerrarModales(): void {
    this.showReservaModal = false;
    this.showDetalleModal = false;
    this.selectedServicio = null;
    this.resetForm();
  }

  resetForm(): void {
    this.reservaData = {
      servicio: '',
      fecha: '',
      hora: '',
      notas: ''
    };
  }

  reservarServicio(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.loading = true;
    
    // Simular reserva
    setTimeout(() => {
      this.loading = false;
      this.showReservaModal = false;
      alert('¡Reserva realizada con éxito! Te contactaremos pronto.');
      this.resetForm();
    }, 1500);
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Método para simular reserva a través de la API del backend
  realizarReservaBackend(servicioId: number): void {
    const reservaData = {
      servicioId: servicioId,
      fecha: new Date().toISOString(),
      pacienteId: 1, // Esto debería venir de la autenticación
      estado: 'pendiente'
    };

    this.http.post('/api/reservas', reservaData).subscribe({
      next: (response: any) => {
        console.log('Reserva exitosa:', response);
        alert('Reserva realizada exitosamente');
      },
      error: (error) => {
        console.error('Error en reserva:', error);
        alert('Error al realizar la reserva');
      }
    });
  }

  // Método para obtener sugerencias del backend
  obtenerSugerencias(): void {
    this.http.get('/api/sugerencias').subscribe({
      next: (sugerencias: any) => {
        console.log('Sugerencias:', sugerencias);
      },
      error: (error) => {
        console.error('Error obteniendo sugerencias:', error);
      }
    });
  }
  formatFecha(fechaString: string): string {
  const fecha = new Date(fechaString);
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}/${mes}/${año}`;
}
}