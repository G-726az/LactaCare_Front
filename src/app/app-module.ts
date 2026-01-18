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

// User Dashboards (standalone)
import { AdminComponent } from '../app/users/Admin/pages/admin/admin.component';
import { MedicoComponent } from '../app/users/Medico/pages/medico/medico';
import { PacienteComponent } from '../app/users/Paciente/pages/paciente/paciente.component';

import { PacienteService } from './services/paciente.service';
import { ReservaService } from './services/reserva.service';
import { SistemaComponent } from './users/Admin/pages/admin/components/sistema/sistema.component';
import { ContactoComponent } from './pages/Home/tabs/Contactos/contacto.component';
import { RefrigeradoresComponent } from './users/Admin/pages/admin/components/refrigeradores/refrigeradores.component';
import { ChangePasswordComponent } from './pages/change-password/change-password';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HomeComponent,
    ContactoComponent,
    LoginComponent,
    ChangePasswordComponent,
    // NO incluyas PerfilMadresComponent ni ReservasMadresComponent aquí
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    AdminComponent, // Standalone
    MedicoComponent, // Standalone
    PacienteComponent, // Standalone - MUÉVELO AQUÍ
    AppRoutingModule,
    SistemaComponent,
    HeaderComponent,
    RefrigeradoresComponent,
  ],
  providers: [AuthService, PacienteService, ReservaService],
  bootstrap: [AppComponent],
})
export class AppModule {}
