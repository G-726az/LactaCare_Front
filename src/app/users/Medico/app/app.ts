import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { RecoverComponent } from './features/auth/components/recover/recover.component';
import { UniversalDashboardComponent } from './features/dashboard/components/universal-dashboard/universal-dashboard.component';
import { WelcomeModalComponent } from './shared/components/modals/welcome-modal/welcome-modal.component';
import { ReportModalComponent } from './shared/components/modals/report-modal/report-modal.component';
import { ProfileModalComponent } from './shared/components/modals/profile-modal/profile-modal.component';
import { AuthService } from './core/services/auth.service';
import { ModalService } from './core/services/modal.service';
import { NotificationService } from './core/services/notification.service'; // Importar tu NotificationService
import { UsuarioSesion } from './core/models/database.models';
import { NotificationComponent } from './features/auth/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoginComponent,
    RegisterComponent,
    RecoverComponent,
    UniversalDashboardComponent,
    WelcomeModalComponent,
    ReportModalComponent,
    ProfileModalComponent,
    NotificationComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  userData: UsuarioSesion | null = null;
  activeTab: 'login' | 'register' | 'recover' = 'login';
  
  // Estados de modales globales
  showWelcomeModal = false;
  showReportModal = false;
  showProfileModal = false;

  private routerSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private modalService: ModalService,
    private notificationService: NotificationService, // Inyectar tu NotificationService
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    this.setupRouterListener();
    this.setupModalListener();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private checkAuthentication(): void {
    const savedUser = localStorage.getItem('lactaCareUser');
    
    if (savedUser) {
      try {
        this.userData = JSON.parse(savedUser);
        this.isAuthenticated = true;
        
        // Si está en la página de login y ya está autenticado, redirigir al dashboard
        if (this.router.url === '/' || this.router.url === '/login') {
          this.router.navigate(['/dashboard']);
        }
        
        // Mostrar bienvenida después de un breve delay usando NotificationService
        setTimeout(() => {
          this.notificationService.showWelcome(this.userData);
        }, 1000);
        
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('lactaCareUser');
        this.router.navigate(['/login']);
        
        // Mostrar error
        this.notificationService.showError(
          'Error de Sesión',
          'Hubo un problema con tus datos de sesión. Por favor, inicia sesión nuevamente.'
        );
      }
    } else {
      // Si no está autenticado y no está en login, redirigir al login
      if (this.router.url !== '/login' && !this.router.url.includes('/app/pages')) {
        this.router.navigate(['/login']);
      }
    }
  }

  private setupRouterListener(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      console.log('Navegación a:', event.url);
      
      const savedUser = localStorage.getItem('lactaCareUser');
      const currentUrl = event.url;
      
      // Proteger rutas que requieren autenticación
      if (!savedUser && currentUrl.includes('/dashboard')) {
        this.router.navigate(['/login']);
        this.notificationService.showWarning(
          'Acceso Restringido',
          'Debes iniciar sesión para acceder al dashboard.'
        );
        return;
      }
      
      // Si está autenticado y va a login, redirigir al dashboard
      if (savedUser && currentUrl === '/login') {
        this.router.navigate(['/dashboard']);
        this.notificationService.showInfo(
          'Ya estás autenticado',
          'Serás redirigido al dashboard.'
        );
        return;
      }
      
      // Actualizar estado de autenticación basado en localStorage
      if (savedUser && !this.isAuthenticated) {
        this.userData = JSON.parse(savedUser);
        this.isAuthenticated = true;
      } else if (!savedUser && this.isAuthenticated) {
        this.isAuthenticated = false;
        this.userData = null;
      }
      
      // Actualizar tab activo basado en la ruta
      if (currentUrl.includes('/login')) {
        this.activeTab = 'login';
      } else if (currentUrl.includes('/register')) {
        this.activeTab = 'register';
      } else if (currentUrl.includes('/recover')) {
        this.activeTab = 'recover';
      }
    });
  }

  private setupModalListener(): void {
    this.modalService.modal$.subscribe(modal => {
      switch(modal.type) {
        case 'welcome':
          this.showWelcomeModal = true;
          break;
        case 'report':
          this.showReportModal = true;
          break;
        case 'profile':
          this.showProfileModal = true;
          break;
        case 'close':
          this.closeAllModals();
          break;
      }
    });
  }

  switchTab(tab: 'login' | 'register' | 'recover'): void {
    this.activeTab = tab;
    
    // Navegar a la ruta correspondiente
    switch(tab) {
      case 'login':
        this.router.navigate(['/login']);
        break;
      case 'register':
        this.router.navigate(['/login'], { queryParams: { tab: 'register' } });
        break;
      case 'recover':
        this.router.navigate(['/login'], { queryParams: { tab: 'recover' } });
        break;
    }
  }

  onLoginSuccess(user: UsuarioSesion): void {
    this.userData = user;
    this.isAuthenticated = true;
    
    // Guardar en localStorage
    localStorage.setItem('lactaCareUser', JSON.stringify(user));
    
    // Redirigir al dashboard
    this.router.navigate(['/dashboard']).then(() => {
      // Mostrar notificación de bienvenida usando NotificationService
      setTimeout(() => {
        this.notificationService.showWelcome(user);
      }, 500);
    });
  }

  onRegisterSuccess(user: UsuarioSesion): void {
    this.userData = user;
    this.isAuthenticated = true;
    
    // Guardar en localStorage
    localStorage.setItem('lactaCareUser', JSON.stringify(user));
    
    // Redirigir al dashboard
    this.router.navigate(['/dashboard']).then(() => {
      // Mostrar notificación de bienvenida usando NotificationService
      setTimeout(() => {
        this.notificationService.showWelcome(user);
      }, 500);
    });
  }

  onProfileUpdated(updatedProfile: any): void {
    if (this.userData) {
      Object.assign(this.userData, updatedProfile);
      localStorage.setItem('lactaCareUser', JSON.stringify(this.userData));
      
      // Mostrar notificación de éxito usando NotificationService
      this.notificationService.showSuccess(
        'Perfil Actualizado',
        '✅ Tu perfil ha sido actualizado exitosamente'
      );
    }
  }

  closeAllModals(): void {
    this.showWelcomeModal = false;
    this.showReportModal = false;
    this.showProfileModal = false;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userData = null;
    localStorage.removeItem('lactaCareUser');
    
    // Redirigir al login
    this.router.navigate(['/login']).then(() => {
      this.activeTab = 'login';
      this.closeAllModals();
      
      // Mostrar notificación de logout usando NotificationService
      this.notificationService.showInfo(
        'Sesión Cerrada',
        'Has cerrado sesión exitosamente'
      );
    });
  }

  // Método para obtener datos del reporte
  getReportData() {
    return {
      fecha: new Date().toISOString(),
      medico: this.userData?.nombre_completo || 'Usuario',
      lactariosActivos: 2,
      refrigeradores: 3,
      temperaturaPromedio: '4.5°C',
      alertasActivas: 1,
      datosGenerados: new Date().toLocaleString('es-ES')
    };
  }

  // Método para navegar desde componentes hijos
  navigateTo(path: string): void {
    switch(path) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'login':
        this.router.navigate(['/login']);
        break;
      case 'register':
        this.router.navigate(['/login'], { queryParams: { tab: 'register' } });
        break;
      case 'recover':
        this.router.navigate(['/login'], { queryParams: { tab: 'recover' } });
        break;
    }
  }

  // Verificar si la ruta actual es la página de autenticación
  isAuthPage(): boolean {
    return this.router.url.includes('/login') || 
           this.router.url.includes('/register') || 
           this.router.url.includes('/recover');
  }

  // Verificar si la ruta actual es el dashboard
  isDashboardPage(): boolean {
    return this.router.url.includes('/dashboard');
  }

  // Verificar si la ruta actual es la página "Nosotros"
  isAboutPage(): boolean {
    return this.router.url.includes('/app/pages') || 
           this.router.url.includes('/nosotros');
  }
}