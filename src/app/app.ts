import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'LactaCare - Sala de Apoyo a la Lactancia Materna';

  mostrarHeaderFooter = true;

  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Escuchar cambios de ruta
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarVisibilidad();
      });

    // Verificar ruta inicial
    this.actualizarVisibilidad();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  actualizarVisibilidad(): void {
    const url = this.router.url;

    const esRutaPrivada =
      url.includes('/change-password') ||
      url.includes('/admin/') ||
      url.includes('/medico/') ||
      url.includes('/paciente/');

    this.mostrarHeaderFooter = !esRutaPrivada;

    console.log(' URL:', url);
    console.log(' Ruta privada:', esRutaPrivada);
    console.log(' Mostrar Header/Footer:', this.mostrarHeaderFooter);
  }
}
