import { Routes } from '@angular/router';
import { AdminComponent } from '../pages/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];