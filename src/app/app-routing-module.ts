import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/Home/home';
import { LoginComponent } from './pages/Login/login';
import { AdminComponent } from '../app/users/Admin/pages/admin/admin.component';
import { PacienteComponent } from '../app/users/Paciente/pages/paciente/paciente.component';
import { MedicoComponent } from '../app/users/Medico/pages/medico/medico';
import { AuthGuard } from './guards/auth.guard';
import { NosotrosComponent } from './pages/Home/tabs/Nosotros/nosotros.component';
import { ServiciosComponent } from './pages/Home/tabs/Servicios/servicios.component';
import { ContactoComponent } from './pages/Home/tabs/Contactos/contacto.component';
import { ChangePasswordComponent } from './pages/change-password/change-password';

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
    path: 'nosotros',
    component: NosotrosComponent,
  },
  {
    path: 'servicios',
    component: ServiciosComponent,
  },
  {
    path: 'contacto',
    component: ContactoComponent,
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
  },
  {
    path: 'admin/dashboard',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [1] },
    children: [
      {
        path: '', // Ruta vacía para /admin/dashboard
        loadComponent: () =>
          import('../app/users/Admin/pages/admin/admin.component').then((m) => m.AdminComponent),
      },
      {
        path: 'lactarios',
        loadComponent: () =>
          import('../app/users/Admin/pages/admin/components/lactarios/lactarios.component').then(
            (m) => m.LactariosComponent
          ),
      },
    ],
  },
  {
    path: 'medico/dashboard',
    component: MedicoComponent,
    canActivate: [AuthGuard],
    data: { roles: [2] },
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
