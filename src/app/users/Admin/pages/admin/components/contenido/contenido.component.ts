import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

interface Contenido {
  id: number;
  titulo: string;
  categoria: string;
  tipo: string;
  descripcion: string;
  contenido: string;
  fecha: string;
  estado: string;
}

@Component({
  selector: 'app-contenido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contenido.component.html',
  styleUrls: ['./contenido.component.css']
})
export class ContenidoComponent implements OnInit {
  contenidos: Contenido[] = [
    {
      id: 1,
      titulo: 'Beneficios de la Lactancia Materna',
      categoria: 'Educación',
      tipo: 'Artículo',
      descripcion: 'Conoce los principales beneficios de la lactancia materna para tu bebé',
      contenido: 'La lactancia materna es fundamental para el desarrollo del bebé...',
      fecha: '2024-12-01',
      estado: 'Publicado'
    },
    {
      id: 2,
      titulo: 'Cómo usar el lactario',
      categoria: 'Guía',
      tipo: 'Tutorial',
      descripcion: 'Guía paso a paso para usar las instalaciones del lactario',
      contenido: 'En esta guía te explicaremos cómo utilizar correctamente...',
      fecha: '2024-11-28',
      estado: 'Publicado'
    },
    {
      id: 3,
      titulo: 'Horarios de atención',
      categoria: 'Información',
      tipo: 'Aviso',
      descripcion: 'Consulta los horarios de atención de nuestros lactarios',
      contenido: 'Los horarios de atención son los siguientes...',
      fecha: '2024-11-25',
      estado: 'Borrador'
    }
  ];

  contenidoFiltrado: Contenido[] = [];
  busqueda = '';
  estadoFiltro = '';
  mostrarModal = false;
  modoEdicion = false;
  contenidoActual: Partial<Contenido> = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.contenidoFiltrado = [...this.contenidos];
  }

  filtrarContenido() {
    this.contenidoFiltrado = this.contenidos.filter(item => {
      const coincideBusqueda = item.titulo.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                               item.categoria.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.estadoFiltro || item.estado === this.estadoFiltro;
      return coincideBusqueda && coincideEstado;
    });
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.contenidoActual = {
      titulo: '',
      categoria: '',
      tipo: 'Artículo',
      descripcion: '',
      contenido: '',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Borrador'
    };
    this.mostrarModal = true;
    this.notificationService.info('📝 Abriendo editor para nuevo artículo');
  }

  editarContenido(item: Contenido) {
    this.modoEdicion = true;
    this.contenidoActual = { ...item };
    this.mostrarModal = true;
    this.notificationService.info('✏️ Editando contenido: ' + item.titulo);
  }

  eliminarContenido(id: number) {
    const contenido = this.contenidos.find(c => c.id === id);
    if (!contenido) return;

    if (confirm('⚠️ ¿Estás seguro de eliminar este contenido?')) {
      this.contenidos = this.contenidos.filter(c => c.id !== id);
      this.filtrarContenido();
      this.notificationService.success(`✅ Contenido "${contenido.titulo}" eliminado exitosamente`);
    }
  }

  guardarContenido() {
    if (!this.contenidoActual.titulo || !this.contenidoActual.categoria) {
      this.notificationService.warning('⚠️ Por favor completa los campos requeridos');
      return;
    }

    if (this.modoEdicion) {
      const index = this.contenidos.findIndex(c => c.id === this.contenidoActual.id);
      if (index !== -1) {
        this.contenidos[index] = this.contenidoActual as Contenido;
      }
      this.notificationService.success(`✅ Contenido "${this.contenidoActual.titulo}" actualizado exitosamente`);
    } else {
      const nuevoId = Math.max(...this.contenidos.map(c => c.id), 0) + 1;
      this.contenidos.push({
        ...this.contenidoActual,
        id: nuevoId
      } as Contenido);
      this.notificationService.success(`✅ Contenido "${this.contenidoActual.titulo}" creado exitosamente`);
    }

    this.filtrarContenido();
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.contenidoActual = {};
  }
}