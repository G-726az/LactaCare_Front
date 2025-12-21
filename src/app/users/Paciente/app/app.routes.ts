import { Routes } from '@angular/router';
import { PacienteComponent } from '../pages/paciente/paciente.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'paciente',
    pathMatch: 'full'
  },
  {
    path: 'paciente',
    component: PacienteComponent
  },
  {
    path: '**',
    redirectTo: 'pacientes'
  }
];