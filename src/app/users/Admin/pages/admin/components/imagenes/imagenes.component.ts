import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

interface Imagen {
  id: number;
  categoriaImagenes: string;
  linkImagenes: string;
}

@Component({
  selector: 'app-imagenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imagenes.component.html',
  styleUrls: ['./imagenes.component.css']
})
export class ImagenesComponent implements OnInit {
  imagenes: Imagen[] = [
    {
      id: 1,
      categoriaImagenes: 'Banner',
      linkImagenes: 'https://i.pinimg.com/736x/c3/08/80/c308801e4b7a1c9743c650299439b9f0.jpg'
    },
    {
      id: 2,
      categoriaImagenes: 'Educativo',
      linkImagenes: 'https://i.pinimg.com/736x/c3/08/80/c308801e4b7a1c9743c650299439b9f0.jpg'
    },
    {
      id: 3,
      categoriaImagenes: 'Promocional',
      linkImagenes: 'https://i.pinimg.com/736x/c3/08/80/c308801e4b7a1c9743c650299439b9f0.jpg'
    },
    {
      id: 4,
      categoriaImagenes: 'Informativo',
      linkImagenes: 'https://i.pinimg.com/736x/c3/08/80/c308801e4b7a1c9743c650299439b9f0.jpg'
    },
    {
      id: 5,
      categoriaImagenes: 'Decorativo',
      linkImagenes: 'https://i.pinimg.com/736x/c3/08/80/c308801e4b7a1c9743c650299439b9f0.jpg'
    }
  ];

  imagenesFiltradas: Imagen[] = [];
  busqueda = '';
  categoriaFiltro = '';
  mostrarModal = false;
  mostrarVisor = false;
  modoEdicion = false;
  imagenActual: Partial<Imagen> = {};
  imagenVisor: Imagen | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.imagenesFiltradas = [...this.imagenes];
    this.notificationService.info('🖼️ Gestión de imágenes cargada');
  }

  filtrarImagenes() {
    this.imagenesFiltradas = this.imagenes.filter(img => {
      const coincideCategoria = !this.categoriaFiltro || img.categoriaImagenes === this.categoriaFiltro;
      const coincideBusqueda = img.categoriaImagenes.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                               img.linkImagenes.toLowerCase().includes(this.busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.imagenActual = {
      categoriaImagenes: '',
      linkImagenes: ''
    };
    this.mostrarModal = true;
    this.notificationService.info('📤 Abriendo formulario para nueva imagen');
  }

  editarImagen(imagen: Imagen) {
    this.modoEdicion = true;
    this.imagenActual = { ...imagen };
    this.mostrarModal = true;
    this.notificationService.info(`✏️ Editando imagen: ${imagen.categoriaImagenes}`);
  }

  verImagen(imagen: Imagen) {
    this.imagenVisor = imagen;
    this.mostrarVisor = true;
    this.notificationService.info(`👁️ Viendo imagen: ${imagen.categoriaImagenes}`);
  }

  eliminarImagen(id: number) {
    const imagen = this.imagenes.find(i => i.id === id);
    if (!imagen) return;

    if (confirm('⚠️ ¿Estás seguro de eliminar esta imagen?')) {
      this.imagenes = this.imagenes.filter(i => i.id !== id);
      this.filtrarImagenes();
      this.notificationService.success(`✅ Imagen "${imagen.categoriaImagenes}" eliminada exitosamente`);
    }
  }

  guardarImagen() {
    if (!this.imagenActual.categoriaImagenes) {
      this.notificationService.warning('⚠️ Por favor selecciona una categoría');
      return;
    }

    if (!this.imagenActual.linkImagenes) {
      this.notificationService.warning('⚠️ Por favor ingresa una URL de imagen');
      return;
    }

    if (!this.validarURL(this.imagenActual.linkImagenes)) {
      this.notificationService.error('❌ URL de imagen inválida. Debe comenzar con http:// o https://');
      return;
    }

    if (this.modoEdicion) {
      const index = this.imagenes.findIndex(i => i.id === this.imagenActual.id);
      if (index !== -1) {
        this.imagenes[index] = this.imagenActual as Imagen;
      }
      this.notificationService.success(`✅ Imagen "${this.imagenActual.categoriaImagenes}" actualizada exitosamente`);
    } else {
      const nuevoId = Math.max(...this.imagenes.map(i => i.id), 0) + 1;
      this.imagenes.push({
        ...this.imagenActual,
        id: nuevoId
      } as Imagen);
      this.notificationService.success(`✅ Imagen "${this.imagenActual.categoriaImagenes}" agregada exitosamente`);
    }

    this.filtrarImagenes();
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
    event.target.src = 'https://via.placeholder.com/400x300/CCCCCC/666666?text=Error+al+cargar';
    this.notificationService.warning('⚠️ Error al cargar la imagen. Se mostró una imagen por defecto');
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.imagenActual = {};
  }

  cerrarVisor() {
    this.mostrarVisor = false;
    this.imagenVisor = null;
  }
}