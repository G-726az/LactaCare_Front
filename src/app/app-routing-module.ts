import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/Home/home';
import { LoginComponent } from './pages/Login/login';
import { AdminComponent } from '../app/users/Admin/pages/admin/admin.component';
import { PacienteComponent } from '../app/users/Paciente/pages/paciente/paciente.component';
import { MedicoComponent } from '../app/users/Medico/app/features/dashboard/components/universal-dashboard/universal-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
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
  }, // Solo pacientes
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
