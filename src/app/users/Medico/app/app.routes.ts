import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { RecoverComponent } from './features/auth/components/recover/recover.component';
import { UniversalDashboardComponent } from './features/dashboard/components/universal-dashboard/universal-dashboard.component';
import { ContactanosPaginaComponent } from './pages/contactanos-pagina.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión - LactaCare'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registrarse - LactaCare'
  },
  {
    path: 'recover',
    component: RecoverComponent,
    title: 'Recuperar Contraseña - LactaCare'
  },
  {
    path: 'dashboard',
    component: UniversalDashboardComponent,
    title: 'Dashboard Médico - LactaCare'
  },
  {
    path: 'app/pages',
    component: ContactanosPaginaComponent,
    title: 'Nosotros - LactaCare'
  },
  {
    path: 'nosotros',
    redirectTo: '/app/pages',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];