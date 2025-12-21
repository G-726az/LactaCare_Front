import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app';

// Servicios
import { AuthService } from './services/auth.service';

// Pages Components
import { HeaderComponent } from './pages/Header/header';
import { FooterComponent } from './pages/Footer/footer';
import { HomeComponent } from './pages/Home/home';
import { LoginComponent } from './pages/Login/login';

// User Dashboards
import { AdminComponent } from '../app/users/Admin/pages/admin/admin.component';
import { MedicoComponent } from '../app/users/Medico/app/features/dashboard/components/universal-dashboard/universal-dashboard.component';
import { PacienteComponent } from '../app/users/Paciente/pages/paciente/paciente.component';

@NgModule({
  declarations: [AppComponent, HeaderComponent, FooterComponent, HomeComponent, LoginComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    AdminComponent,
    MedicoComponent,
    PacienteComponent,
    AppRoutingModule,
  ],
  providers: [AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
