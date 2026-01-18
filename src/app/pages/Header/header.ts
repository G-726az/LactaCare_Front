import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  mostrarModal = false;
  isAuthenticated = false;
  currentUser: any = null;
  private userSubscription?: Subscription;

  perfilSeleccionado: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse al estado de autenticación
    this.userSubscription = this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });

    this.cargarPerfilSeleccionado();
    window.addEventListener('storage', this.manejarCambioStorage.bind(this));
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    window.removeEventListener('storage', this.manejarCambioStorage.bind(this));
  }

  cargarPerfilSeleccionado(): void {
    const perfil = localStorage.getItem('perfilSeleccionado');
    if (perfil) {
      this.perfilSeleccionado = perfil;
    }
  }

  manejarCambioStorage(event: StorageEvent): void {
    if (event.key === 'perfilSeleccionado') {
      this.cargarPerfilSeleccionado();
    }
  }

  mostrarOpcionesIngreso(): void {
    console.log('📱 Abriendo modal de ingreso');
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  seleccionarPerfil(perfil: string): void {
    console.log('👤 Perfil seleccionado:', perfil);
    this.cerrarModal();

    localStorage.setItem('perfilSeleccionado', perfil);
    this.perfilSeleccionado = perfil;

    if (perfil === 'PACIENTE') {
      localStorage.setItem('mostrarRegistroPrimero', 'true');
    } else {
      localStorage.removeItem('mostrarRegistroPrimero');
    }

    this.notificarCambioPerfil();
    this.router.navigate(['/login']);
  }

  notificarCambioPerfil(): void {
    const event = new CustomEvent('perfilCambiado', {
      detail: {
        perfil: this.perfilSeleccionado,
        mostrarRegistro: this.perfilSeleccionado === 'PACIENTE',
      },
    });
    window.dispatchEvent(event);
    localStorage.setItem('perfilCambioTimestamp', Date.now().toString());
  }
}