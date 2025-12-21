import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: false, // ✅ IMPORTANTE: Agregar esto
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {
  constructor(private router: Router) {}

  scrollToServicios(): void {
    const serviciosSection = document.getElementById('servicios');
    if (serviciosSection) {
      serviciosSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // Método alternativo si routerLink da problemas
  irALogin(): void {
    this.router.navigate(['/login']);
  }
}
