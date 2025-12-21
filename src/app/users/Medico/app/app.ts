import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { RecoverComponent } from './features/auth/components/recover/recover.component';
import { MedicoComponent } from './features/dashboard/components/universal-dashboard/universal-dashboard.component';
import { WelcomeModalComponent } from './shared/components/modals/welcome-modal/welcome-modal.component';
import { ReportModalComponent } from './shared/components/modals/report-modal/report-modal.component';
import { ProfileModalComponent } from './shared/components/modals/profile-modal/profile-modal.component';
import { DialogComponent } from './features/auth/components/dialog/dialog.component';
import { AuthService } from './core/services/auth.service';
import { ModalService } from './core/services/modal.service';
import { UsuarioSesion } from './core/models/database.models';
import { NotificationComponent } from './features/auth/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoginComponent,
    RegisterComponent,
    RecoverComponent,
    MedicoComponent,
    WelcomeModalComponent,
    ReportModalComponent,
    ProfileModalComponent,
    DialogComponent,
    NotificationComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  userData: UsuarioSesion | null = null;
  activeTab: 'login' | 'register' | 'recover' = 'login';
  
  // Estados de modales globales
  showWelcomeModal = false;
  showReportModal = false;
  showProfileModal = false;

  constructor(
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('lactaCareUser');
    if (savedUser) {
      this.userData = JSON.parse(savedUser);
      this.isAuthenticated = true;
      
      // Mostrar bienvenida automáticamente
      setTimeout(() => {
        this.modalService.showWelcome(this.userData);
      }, 1000);
    }

    // Escuchar eventos de modales
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
  }

  onLoginSuccess(user: UsuarioSesion): void {
    this.userData = user;
    this.isAuthenticated = true;
    
    // Mostrar modal de bienvenida
    setTimeout(() => {
      this.modalService.showWelcome(user);
    }, 500);
  }

  onRegisterSuccess(user: UsuarioSesion): void {
    this.userData = user;
    this.isAuthenticated = true;
    
    // Mostrar modal de bienvenida
    setTimeout(() => {
      this.modalService.showWelcome(user);
    }, 500);
  }

  onProfileUpdated(updatedProfile: any): void {
    if (this.userData) {
      Object.assign(this.userData, updatedProfile);
      localStorage.setItem('lactaCareUser', JSON.stringify(this.userData));
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
    this.switchTab('login');
    this.closeAllModals();
  }

  // Método para obtener datos del reporte
  getReportData() {
    return {
      fecha: new Date().toISOString(),
      medico: this.userData?.nombre_completo,
      lactariosActivos: 2,
      refrigeradores: 3,
      temperaturaPromedio: '4.5°C',
      alertasActivas: 1
    };
  }
}