import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

interface Empleado {
  id: number;
  nombre: string;
  rol: string;
  email: string;
  telefono: string;
  cedula: string;
  foto: string;
  lactarioId: number;
  lactario: string;
  horaInicio: string;
  horaFin: string;
  horario: string;
  estado: string;
  dias: {[key: string]: boolean};
}

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [
    {
      id: 1,
      nombre: 'Dr. Carlos Méndez',
      rol: 'Médico',
      email: 'carlos.mendez@lactapp.com',
      telefono: '+593 99 111 2222',
      cedula: '0912345678',
      foto: '',
      lactarioId: 1,
      lactario: 'Hospital General',
      horaInicio: '08:00',
      horaFin: '16:00',
      horario: '08:00 - 16:00',
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
    },
    {
      id: 2,
      nombre: 'Enf. María López',
      rol: 'Enfermera',
      email: 'maria.lopez@lactapp.com',
      telefono: '+593 98 222 3333',
      cedula: '0923456789',
      foto: '',
      lactarioId: 1,
      lactario: 'Hospital General',
      horaInicio: '07:00',
      horaFin: '15:00',
      horario: '07:00 - 15:00',
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

  lactarios = [
    { id: 1, nombre: 'Hospital General' },
    { id: 2, nombre: 'Clínica Santa María' },
    { id: 3, nombre: 'Centro de Salud Municipal' }
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

  empleadosFiltrados: Empleado[] = [];
  busqueda = '';
  rolFiltro = '';
  estadoFiltro = '';
  mostrarModal = false;
  modoEdicion = false;
  empleadoActual: Partial<Empleado> = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.empleadosFiltrados = [...this.empleados];
  }

  filtrarEmpleados() {
    this.empleadosFiltrados = this.empleados.filter(emp => {
      const coincideBusqueda = emp.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                               emp.email.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideRol = !this.rolFiltro || emp.rol === this.rolFiltro;
      const coincideEstado = !this.estadoFiltro || emp.estado === this.estadoFiltro;
      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.empleadoActual = {
      nombre: '',
      rol: '',
      email: '',
      telefono: '',
      cedula: '',
      foto: '',
      lactarioId: 0,
      horaInicio: '08:00',
      horaFin: '16:00',
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
    this.notificationService.info('👤 Abriendo formulario para nuevo empleado');
  }

  editarEmpleado(empleado: Empleado) {
    this.modoEdicion = true;
    this.empleadoActual = { 
      ...empleado,
      dias: { ...empleado.dias }
    };
    this.mostrarModal = true;
    this.notificationService.info('✏️ Editando empleado: ' + empleado.nombre);
  }

  verDetalles(empleado: Empleado) {
    this.notificationService.info(
      `👤 Detalles del empleado:\n\n👨‍⚕️ ${empleado.nombre}\n🏷️ ${empleado.rol}\n📧 ${empleado.email}\n🏥 ${empleado.lactario}`
    );
  }

  eliminarEmpleado(id: number) {
    const empleado = this.empleados.find(e => e.id === id);
    if (!empleado) return;

    if (confirm('⚠️ ¿Estás seguro de eliminar este empleado?')) {
      this.empleados = this.empleados.filter(e => e.id !== id);
      this.filtrarEmpleados();
      this.notificationService.success(`✅ Empleado "${empleado.nombre}" eliminado exitosamente`);
    }
  }

  guardarEmpleado() {
    if (!this.empleadoActual.nombre || !this.empleadoActual.rol || !this.empleadoActual.email) {
      this.notificationService.warning('⚠️ Por favor completa los campos requeridos');
      return;
    }

    const lactario = this.lactarios.find(l => l.id === this.empleadoActual.lactarioId);
    
    if (this.modoEdicion) {
      const index = this.empleados.findIndex(e => e.id === this.empleadoActual.id);
      if (index !== -1) {
        this.empleados[index] = {
          ...this.empleadoActual,
          lactario: lactario?.nombre || '',
          horario: `${this.empleadoActual.horaInicio} - ${this.empleadoActual.horaFin}`
        } as Empleado;
      }
      this.notificationService.success(`✅ Empleado "${this.empleadoActual.nombre}" actualizado exitosamente`);
    } else {
      const nuevoId = Math.max(...this.empleados.map(e => e.id), 0) + 1;
      this.empleados.push({
        ...this.empleadoActual,
        id: nuevoId,
        lactario: lactario?.nombre || '',
        horario: `${this.empleadoActual.horaInicio} - ${this.empleadoActual.horaFin}`
      } as Empleado);
      this.notificationService.success(`✅ Empleado "${this.empleadoActual.nombre}" creado exitosamente`);
    }

    this.filtrarEmpleados();
    this.cerrarModal();
  }

  getRolColor(rol: string): string {
    const colores: {[key: string]: string} = {
      'Médico': '#6b4fa3',
      'Enfermera': '#e94b8a',
      'Administrador': '#4a7ba7',
      'Técnico': '#ff6b9d'
    };
    return colores[rol] || '#9A9595';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.empleadoActual = {};
  }
}