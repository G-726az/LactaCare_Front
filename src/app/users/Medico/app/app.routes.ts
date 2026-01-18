import { Routes } from '@angular/router';
import { MedicoComponent } from '../pages/medico/medico';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'medico',
    pathMatch: 'full',
  },
  {
    path: 'medico',
    component: MedicoComponent,
  },
  {
    path: '**',
    redirectTo: 'medicos',
  },
];
