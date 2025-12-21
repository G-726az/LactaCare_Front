import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

interface Institucion {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  ruc: string;
}

interface Lactario {
  id: number;
  nombre: string;
  institucionId: number;
  institucion: string;
  direccion: string;
  telefono: string;
  correo: string;
  latitud: string;
  longitud: string;
  horaInicio: string;
  horaFin: string;
  horaInicioDescanso: string;
  horaFinDescanso: string;
  diasLaborables: string;
  horario: string;
  estado: string;
  dias?: {[key: string]: boolean};
}

@Component({
  selector: 'app-lactarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lactarios.component.html',
  styleUrls: ['./lactarios.component.css']
})
export class LactariosComponent implements OnInit {
  lactarios: Lactario[] = [
    {
      id: 1,
      nombre: 'Lactario Hospital General',
      institucionId: 1,
      institucion: 'Hospital General del Norte',
      direccion: 'Av. Principal 123, Guayaquil',
      telefono: '+593 4 123 4567',
      correo: 'lactario@hospitalnorte.com',
      latitud: '-2.1894',
      longitud: '-79.8886',
      horaInicio: '08:00',
      horaFin: '18:00',
      horaInicioDescanso: '12:00',
      horaFinDescanso: '13:00',
      diasLaborables: 'Lun - Vie',
      horario: '08:00 - 18:00',
      estado: 'Activo',
      dias: {
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: false,
        domingo: false
      }
    }
  ];

  instituciones: Institucion[] = [
    { id: 1, nombre: 'Hospital General del Norte', direccion: 'Av. Central 100', telefono: '+593 4 111 1111', ruc: '0912345678001' },
    { id: 2, nombre: 'Clínica Santa María', direccion: 'Calle Principal 200', telefono: '+593 4 222 2222', ruc: '0923456789001' },
    { id: 3, nombre: 'Centro de Salud Municipal', direccion: 'Av. Sur 300', telefono: '+593 4 333 3333', ruc: '0934567890001' }
  ];

  diasSemana = [
    { value: 'lunes', label: 'Lun' },
    { value: 'martes', label: 'Mar' },
    { value: 'miercoles', label: 'Mié' },
    { value: 'jueves', label: 'Jue' },
    { value: 'viernes', label: 'Vie' },
    { value: 'sabado', label: 'Sáb' },
    { value: 'domingo', label: 'Dom' }
  ];

  lactariosFiltrados: Lactario[] = [];
  busqueda = '';
  estadoFiltro = '';
  mostrarModal = false;
  mostrarModalInstitucion = false;
  mostrarVistaPrevia = false;
  modoEdicion = false;
  lactarioActual: Partial<Lactario> = {};
  institucionActual: Partial<Institucion> = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.lactariosFiltrados = [...this.lactarios];
  }

  filtrarLactarios() {
    this.lactariosFiltrados = this.lactarios.filter(item => {
      const coincideBusqueda = item.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                               item.institucion.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.estadoFiltro || item.estado === this.estadoFiltro;
      return coincideBusqueda && coincideEstado;
    });
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.lactarioActual = {
      nombre: '',
      institucionId: 0,
      direccion: '',
      telefono: '',
      correo: '',
      latitud: '',
      longitud: '',
      horaInicio: '08:00',
      horaFin: '18:00',
      horaInicioDescanso: '12:00',
      horaFinDescanso: '13:00',
      estado: 'Activo',
      dias: {
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: false,
        domingo: false
      }
    };
    this.mostrarModal = true;
    this.notificationService.info('📝 Abriendo formulario para nuevo lactario');
  }

  abrirModalInstitucion() {
    this.institucionActual = {
      nombre: '',
      direccion: '',
      telefono: '',
      ruc: ''
    };
    this.mostrarModalInstitucion = true;
    this.notificationService.info('🏢 Abriendo formulario para nueva institución');
  }

  guardarInstitucion() {
    if (!this.institucionActual.nombre || !this.institucionActual.ruc) {
      this.notificationService.warning('⚠️ Por favor completa los campos requeridos: Nombre y RUC');
      return;
    }

    const nuevoId = Math.max(...this.instituciones.map(i => i.id), 0) + 1;
    this.instituciones.push({
      ...this.institucionActual,
      id: nuevoId
    } as Institucion);

    this.notificationService.success('✅ Institución creada exitosamente');
    this.cerrarModalInstitucion();
  }

  mostrarVistaPreviaLactario() {
    if (!this.lactarioActual.nombre || !this.lactarioActual.institucionId) {
      this.notificationService.warning('⚠️ Por favor completa al menos el nombre y la institución para ver la vista previa');
      return;
    }
    this.mostrarVistaPrevia = true;
    this.notificationService.info('👁️ Mostrando vista previa del lactario');
  }

  editarLactario(item: Lactario) {
    this.modoEdicion = true;
    this.lactarioActual = { 
      ...item,
      dias: item.dias ? { ...item.dias } : {
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: false,
        domingo: false
      }
    };
    this.mostrarModal = true;
    this.notificationService.info('✏️ Editando lactario: ' + item.nombre);
  }

  verDetalles(lactario: Lactario) {
    this.notificationService.info(
      `📋 Detalles del lactario\n\n🏥 ${lactario.nombre}\n📍 ${lactario.direccion}\n📞 ${lactario.telefono}`
    );
  }

  eliminarLactario(id: number) {
    const lactario = this.lactarios.find(l => l.id === id);
    if (!lactario) return;

    if (confirm('⚠️ ¿Estás seguro de eliminar este lactario?')) {
      this.lactarios = this.lactarios.filter(l => l.id !== id);
      this.filtrarLactarios();
      this.notificationService.success(`✅ Lactario "${lactario.nombre}" eliminado exitosamente`);
    }
  }

  guardarLactario() {
    if (!this.lactarioActual.nombre || !this.lactarioActual.institucionId) {
      this.notificationService.warning('⚠️ Por favor completa los campos requeridos: Nombre e Institución');
      return;
    }

    const institucion = this.instituciones.find(i => i.id === this.lactarioActual.institucionId);
    
    if (this.modoEdicion) {
      const index = this.lactarios.findIndex(l => l.id === this.lactarioActual.id);
      if (index !== -1) {
        this.lactarios[index] = {
          ...this.lactarioActual,
          institucion: institucion?.nombre || '',
          diasLaborables: this.generarDiasLaborables(),
          horario: `${this.lactarioActual.horaInicio} - ${this.lactarioActual.horaFin}`
        } as Lactario;
      }
      this.notificationService.success(`✅ Lactario "${this.lactarioActual.nombre}" actualizado exitosamente`);
    } else {
      const nuevoId = Math.max(...this.lactarios.map(l => l.id), 0) + 1;
      this.lactarios.push({
        ...this.lactarioActual,
        id: nuevoId,
        institucion: institucion?.nombre || '',
        diasLaborables: this.generarDiasLaborables(),
        horario: `${this.lactarioActual.horaInicio} - ${this.lactarioActual.horaFin}`
      } as Lactario);
      this.notificationService.success(`✅ Lactario "${this.lactarioActual.nombre}" creado exitosamente`);
    }

    this.filtrarLactarios();
    this.cerrarModal();
  }

  generarDiasLaborables(): string {
    const dias = this.lactarioActual.dias || {};
    const seleccionados = Object.entries(dias)
      .filter(([_, selected]) => selected)
      .map(([dia]) => dia.substring(0, 3).toUpperCase());
    return seleccionados.join(', ') || 'Sin días configurados';
  }

  getInstitucionNombre(): string {
    const inst = this.instituciones.find(i => i.id === this.lactarioActual.institucionId);
    return inst?.nombre || 'No seleccionada';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.mostrarVistaPrevia = false;
    this.lactarioActual = {};
  }

  cerrarModalInstitucion() {
    this.mostrarModalInstitucion = false;
    this.institucionActual = {};
  }

  cerrarVistaPrevia() {
    this.mostrarVistaPrevia = false;
  }
}