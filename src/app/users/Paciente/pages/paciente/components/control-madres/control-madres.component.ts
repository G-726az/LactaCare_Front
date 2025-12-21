import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

interface Extraccion {
  id: number;
  cantidad: number;
  fecha: Date;
  hora: string;
  tipo: 'Refrigerada' | 'Congelada' | 'Por Caducar';
  estado: 'activa' | 'caducada';
}

@Component({
  selector: 'app-control-madres',
  templateUrl: './control-madres.component.html',
  styleUrls: ['./control-madres.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ControlMadresComponent implements OnInit {
  extracciones: Extraccion[] = [
    { 
      id: 1, 
      cantidad: 150, 
      fecha: new Date(), 
      hora: '09:30', 
      tipo: 'Refrigerada',
      estado: 'activa'
    },
    { 
      id: 2, 
      cantidad: 120, 
      fecha: new Date(Date.now() - 86400000), 
      hora: '20:15', 
      tipo: 'Por Caducar',
      estado: 'activa'
    },
    { 
      id: 3, 
      cantidad: 80, 
      fecha: new Date(Date.now() - 172800000), 
      hora: '11:00', 
      tipo: 'Refrigerada',
      estado: 'activa'
    },
    { 
      id: 4, 
      cantidad: 95, 
      fecha: new Date(Date.now() - 259200000), 
      hora: '07:20', 
      tipo: 'Por Caducar',
      estado: 'activa'
    },
    { 
      id: 5, 
      cantidad: 110, 
      fecha: new Date(Date.now() - 86400000), 
      hora: '14:15', 
      tipo: 'Refrigerada',
      estado: 'activa'
    },
    { 
      id: 6, 
      cantidad: 130, 
      fecha: new Date(), 
      hora: '06:45', 
      tipo: 'Refrigerada',
      estado: 'activa'
    }
  ];

  filtroActivo = 'Todo';
  extraccionesFiltradas: Extraccion[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.cargarExtracciones();
    this.aplicarFiltro('Todo');
  }

  cargarExtracciones(): void {
    const stored = localStorage.getItem('extracciones_paciente');
    if (stored) {
      try {
        this.extracciones = JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar extracciones:', error);
      }
    }
  }

  guardarExtracciones(): void {
    try {
      localStorage.setItem('extracciones_paciente', JSON.stringify(this.extracciones));
    } catch (error) {
      console.error('Error al guardar extracciones:', error);
    }
  }

  aplicarFiltro(filtro: string): void {
    this.filtroActivo = filtro;
    
    switch(filtro) {
      case 'Refrigerada':
        this.extraccionesFiltradas = this.extracciones.filter(e => e.tipo === 'Refrigerada');
        break;
      case 'Congelada':
        this.extraccionesFiltradas = this.extracciones.filter(e => e.tipo === 'Congelada');
        break;
      case 'Por Caducar':
        this.extraccionesFiltradas = this.extracciones.filter(e => e.tipo === 'Por Caducar');
        break;
      default:
        this.extraccionesFiltradas = [...this.extracciones];
    }
  }

  nuevaExtraccion(): void {
    const cantidad = prompt('Ingrese la cantidad en ml:');
    if (cantidad && !isNaN(Number(cantidad))) {
      const tipo = this.seleccionarTipo();
      if (tipo) {
        const nueva: Extraccion = {
          id: this.extracciones.length + 1,
          cantidad: parseInt(cantidad),
          fecha: new Date(),
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          tipo: tipo,
          estado: 'activa'
        };
        
        this.extracciones.unshift(nueva);
        this.guardarExtracciones();
        this.aplicarFiltro(this.filtroActivo);
        
        this.notificationService.success(`✅ Extracción de ${cantidad}ml registrada exitosamente`);
      }
    } else if (cantidad) {
      this.notificationService.error('❌ Por favor ingrese un número válido');
    }
  }

  private seleccionarTipo(): 'Refrigerada' | 'Congelada' | null {
    const tipos = ['Refrigerada', 'Congelada'];
    const seleccion = prompt(`Seleccione el tipo de almacenamiento:\n1. Refrigerada\n2. Congelada`);
    
    if (seleccion === '1') return 'Refrigerada';
    if (seleccion === '2') return 'Congelada';
    return null;
  }

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

  eliminarExtraccion(id: number): void {
    if (confirm('¿Está segura de eliminar esta extracción?')) {
      this.extracciones = this.extracciones.filter(e => e.id !== id);
      this.guardarExtracciones();
      this.aplicarFiltro(this.filtroActivo);
      this.notificationService.success('🗑️ Extracción eliminada');
    }
  }

  formatearFecha(fecha: Date): string {
    const hoy = new Date();
    const fechaExt = new Date(fecha);
    const diffDias = Math.floor((hoy.getTime() - fechaExt.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    if (diffDias === 2) return 'Hace 2 días';
    if (diffDias === 3) return 'Hace 3 días';
    return `Hace ${diffDias} días`;
  }
}