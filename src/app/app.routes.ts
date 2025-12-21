import { Routes } from '@angular/router';
import { HomeComponent } from '../app/pages/Home/home';
import { LoginComponent } from '../app/pages/Login/login';
import { AdminComponent } from '../app/users/Admin/pages/admin/admin.component';
import { MedicoComponent } from '../app/users/Medico/app/features/dashboard/components/universal-dashboard/universal-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { PacienteComponent } from '../app/users/Paciente/pages/paciente/paciente.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin/dashboard',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [1] }, // Solo administradores
  },
  {
    path: 'medico/dashboard',
    component: MedicoComponent,
    canActivate: [AuthGuard],
    data: { roles: [2] }, // Solo médicos
  },
  {
    path: 'paciente/dashboard',
    component: PacienteComponent,
    canActivate: [AuthGuard],
    data: { roles: [6] },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
