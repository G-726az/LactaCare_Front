import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  mostrarModal = false;
  isAuthenticated = false;
  currentUser: any = null;
  private userSubscription?: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  mostrarOpcionesIngreso(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  seleccionarPerfil(perfil: string): void {
    this.cerrarModal();
    
    // Guardar el perfil seleccionado en localStorage
    localStorage.setItem('perfilSeleccionado', perfil);
    
    // Navegar al login
    this.router.navigate(['/login']);
  }

  cerrarSesion(): void {
    // Limpiar el perfil seleccionado al cerrar sesión
    localStorage.removeItem('perfilSeleccionado');
    this.authService.logout();
    this.router.navigate(['/']);
  }
}