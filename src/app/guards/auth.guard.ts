import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  // 🔧 MODO DE PRUEBA: Cambiar a true para desactivar autenticación
  private readonly TEST_MODE = true;

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // ⚠️ MODO PRUEBA, sin autenticacion, cambiar a false despues de las pruebas
    if (this.TEST_MODE) {
      console.warn('🔓 AUTH GUARD EN MODO PRUEBA - Permitiendo acceso sin validación');
      return true;
    }

    // ✅ MODO PRODUCCIÓN: Validación normal
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      // Verificar si la ruta requiere roles específicos
      const requiredRoles = route.data['roles'] as number[];

      if (requiredRoles && !requiredRoles.includes(currentUser.rol_id)) {
        // El usuario no tiene el rol requerido
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes permisos para acceder a esta sección',
          confirmButtonColor: '#dc3545',
        });

        // Redirigir al dashboard apropiado según su rol
        const dashboardRoutes: { [key: number]: string } = {
          1: '/admin/dashboard',
          2: '/medico/dashboard',
          6: '/paciente/home',
        };

        this.router.navigate([dashboardRoutes[currentUser.rol_id] || '/']);
        return false;
      }

      // Usuario autenticado y con el rol correcto
      return true;
    }

    // No está autenticado, redirigir al login
    Swal.fire({
      icon: 'warning',
      title: 'Sesión requerida',
      text: 'Debes iniciar sesión para acceder a esta página',
      confirmButtonColor: '#667eea',
    });

    this.router.navigate(['/login']);
    return false;
  }
}