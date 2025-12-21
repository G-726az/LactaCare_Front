import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

interface Sugerencia {
  id: number;
  tituloSugerencia: string;
  detalleImagen: string;
  linkImagen: string;
}

@Component({
  selector: 'app-sugerencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sugerencias.component.html',
  styleUrls: ['./sugerencias.component.css']
})
export class SugerenciasComponent implements OnInit {
  // Imagen predeterminada
  private imagenPorDefecto = 'https://i.pinimg.com/736x/c3/08/80/c308801e4b7a1c9743c650299439b9f0.jpg';

  sugerencias: Sugerencia[] = [
    {
      id: 1,
      tituloSugerencia: 'Beneficios de la lactancia materna',
      detalleImagen: 'Descubre todos los beneficios que la lactancia materna ofrece tanto para el bebé como para la madre',
      linkImagen: this.imagenPorDefecto
    },
    {
      id: 2,
      tituloSugerencia: 'Técnicas de extracción correcta',
      detalleImagen: 'Aprende las mejores técnicas para extraer leche de forma segura y efectiva',
      linkImagen: this.imagenPorDefecto
    },
    {
      id: 3,
      tituloSugerencia: 'Alimentación durante la lactancia',
      detalleImagen: 'Consejos nutricionales importantes para mantener una dieta balanceada durante el período de lactancia',
      linkImagen: this.imagenPorDefecto
    }
  ];

  sugerenciasFiltradas: Sugerencia[] = [];
  busqueda = '';
  mostrarModal = false;
  modoEdicion = false;
  sugerenciaActual: Partial<Sugerencia> = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.sugerenciasFiltradas = [...this.sugerencias];
    this.notificationService.info('📝 Gestión de sugerencias cargada');
  }

  filtrarSugerencias() {
    this.sugerenciasFiltradas = this.sugerencias.filter(sug => 
      sug.tituloSugerencia.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      sug.detalleImagen.toLowerCase().includes(this.busqueda.toLowerCase())
    );
    
    if (this.busqueda && this.sugerenciasFiltradas.length === 0) {
      this.notificationService.info('🔍 No se encontraron sugerencias con esa búsqueda');
    }
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.sugerenciaActual = {
      tituloSugerencia: '',
      detalleImagen: '',
      linkImagen: this.imagenPorDefecto  // Asignar imagen por defecto
    };
    this.mostrarModal = true;
    this.notificationService.info('💡 Abriendo formulario para nueva sugerencia');
  }

  editarSugerencia(sugerencia: Sugerencia) {
    this.modoEdicion = true;
    this.sugerenciaActual = { ...sugerencia };
    this.mostrarModal = true;
    this.notificationService.info(`✏️ Editando sugerencia: ${sugerencia.tituloSugerencia}`);
  }

  eliminarSugerencia(id: number) {
    const sugerencia = this.sugerencias.find(s => s.id === id);
    if (!sugerencia) return;

    if (confirm('⚠️ ¿Estás seguro de eliminar esta sugerencia?')) {
      this.sugerencias = this.sugerencias.filter(s => s.id !== id);
      this.filtrarSugerencias();
      this.notificationService.success(`✅ Sugerencia "${sugerencia.tituloSugerencia}" eliminada exitosamente`);
    }
  }

  guardarSugerencia() {
    if (!this.sugerenciaActual.tituloSugerencia) {
      this.notificationService.warning('⚠️ Por favor ingresa un título para la sugerencia');
      return;
    }

    if (!this.sugerenciaActual.detalleImagen) {
      this.notificationService.warning('⚠️ Por favor ingresa una descripción');
      return;
    }

    if (!this.sugerenciaActual.linkImagen) {
      // Si no hay URL, usar la imagen por defecto
      this.sugerenciaActual.linkImagen = this.imagenPorDefecto;
    } else if (!this.validarURL(this.sugerenciaActual.linkImagen)) {
      this.notificationService.error('❌ URL de imagen inválida. Debe comenzar con http:// o https://');
      return;
    }

    if (this.modoEdicion) {
      const index = this.sugerencias.findIndex(s => s.id === this.sugerenciaActual.id);
      if (index !== -1) {
        this.sugerencias[index] = this.sugerenciaActual as Sugerencia;
      }
      this.notificationService.success(`✅ Sugerencia "${this.sugerenciaActual.tituloSugerencia}" actualizada exitosamente`);
    } else {
      const nuevoId = Math.max(...this.sugerencias.map(s => s.id), 0) + 1;
      this.sugerencias.push({
        ...this.sugerenciaActual,
        id: nuevoId
      } as Sugerencia);
      this.notificationService.success(`✅ Sugerencia "${this.sugerenciaActual.tituloSugerencia}" creada exitosamente`);
    }

    this.filtrarSugerencias();
    this.cerrarModal();
  }

  validarURL(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  onImageError(event: any) {
    const img = event.target;
    // Solo mostrar notificación una vez
    if (!img.hasAttribute('data-error-shown')) {
      img.setAttribute('data-error-shown', 'true');
      // Usar la imagen por defecto
      img.src = this.imagenPorDefecto;
      this.notificationService.warning('⚠️ Error al cargar la imagen. Se mostró la imagen por defecto');
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.sugerenciaActual = {};
  }

  // Getter para obtener la imagen por defecto en el template si es necesario
  getImagenPorDefecto(): string {
    return this.imagenPorDefecto;
  }
}