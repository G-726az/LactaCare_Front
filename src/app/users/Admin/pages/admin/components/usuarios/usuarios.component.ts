import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  foto: string;
  fechaNacimiento: string;
  direccion: string;
  fechaRegistro: string;
  estado: string;
  reservas?: any[];
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [
    {
      id: 1,
      nombre: 'María González',
      email: 'maria.gonzalez@email.com',
      telefono: '+593 99 123 4567',
      foto: '',
      fechaNacimiento: '1990-05-15',
      direccion: 'Av. Principal 123',
      fechaRegistro: '2024-01-10',
      estado: 'Activo',
      reservas: [
        { fecha: '2025-01-20', lactario: 'Hospital General', estado: 'Completada' },
        { fecha: '2025-01-15', lactario: 'Clínica Santa María', estado: 'Completada' }
      ]
    },
    {
      id: 2,
      nombre: 'Ana Pérez',
      email: 'ana.perez@email.com',
      telefono: '+593 98 234 5678',
      foto: '',
      fechaNacimiento: '1988-08-22',
      direccion: 'Calle Segunda 456',
      fechaRegistro: '2024-02-14',
      estado: 'Activo',
      reservas: []
    },
    {
      id: 3,
      nombre: 'Laura Martínez',
      email: 'laura.martinez@email.com',
      telefono: '+593 97 345 6789',
      foto: '',
      fechaNacimiento: '1992-11-30',
      direccion: 'Av. Tercera 789',
      fechaRegistro: '2024-03-01',
      estado: 'Inactivo',
      reservas: []
    }
  ];

  usuariosFiltrados: Usuario[] = [];
  busqueda = '';
  estadoFiltro = '';
  mostrarModal = false;
  usuarioActual: Partial<Usuario> = {};

  ngOnInit() {
    this.usuariosFiltrados = [...this.usuarios];
  }

  filtrarUsuarios() {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const coincideBusqueda = usuario.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                               usuario.email.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.estadoFiltro || usuario.estado === this.estadoFiltro;
      return coincideBusqueda && coincideEstado;
    });
  }

  verDetalles(usuario: Usuario) {
    this.usuarioActual = { ...usuario };
    this.mostrarModal = true;
  }

  toggleEstado(usuario: Usuario) {
    const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo';
    if (confirm(`¿Cambiar estado de ${usuario.nombre} a ${nuevoEstado}?`)) {
      usuario.estado = nuevoEstado;
      this.filtrarUsuarios();
      alert(`Estado actualizado a ${nuevoEstado}`);
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioActual = {};
  }
}