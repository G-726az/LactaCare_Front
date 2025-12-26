import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-medico.component.html',
  styleUrls: ['./header-medico.component.scss']
})
export class HeaderMedicoComponent {
  isMenuOpen = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(path: string) {
    console.log('Navegando a:', path); // Para debug
    
    switch(path) {
      case 'nosotros':
        // IMPORTANTE: Si estás en el dashboard, navega a la página de nosotros
        this.router.navigate(['/app/pages'])
          .then(success => {
            if (!success) {
              console.error('No se pudo navegar a /app/pages');
              // Opción alternativa si la ruta no está configurada
              window.open('/app/pages', '_self');
            }
          })
          .catch(err => {
            console.error('Error de navegación:', err);
            window.open('/app/pages', '_self');
          });
        break;
      case 'inicio':
        // Si estás en otra página, regresa al dashboard
        this.router.navigate(['/dashboard']);
        break;
      case 'servicios':
        // Por ahora, redirige al dashboard con un parámetro
        this.router.navigate(['/dashboard'], { queryParams: { section: 'servicios' } });
        break;
      case 'contacto':
        // Por ahora, redirige al dashboard con un parámetro
        this.router.navigate(['/dashboard'], { queryParams: { section: 'contacto' } });
        break;
    }
    this.isMenuOpen = false;
  }

  // Método alternativo para verificar si estamos en dashboard
  isInDashboard(): boolean {
    return this.router.url.includes('/dashboard');
  }
}