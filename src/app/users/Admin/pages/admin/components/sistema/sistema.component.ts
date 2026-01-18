import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../../app/services/notification.service';
import { SistemaService } from '../../../../app/services/sistema.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sistema.component.html',
  styleUrl: './sistema.component.css',
})
export class SistemaComponent implements OnInit {
  private idSistema: number = 1;

  sistemaData = {
    id: 1,
    nombre: '',
    eslogan: '',
    logo: '',
  };

  loading: boolean = true;

  constructor(
    private notificationService: NotificationService,
    private sistemaService: SistemaService
  ) {}

  ngOnInit(): void {
    this.cargarSistema();
  }

  cargarSistema(): void {
    this.sistemaService.getSistema(this.idSistema).subscribe({
      next: (sistema: any) => {
        console.log('RESPUESTA BACKEND SISTEMA', sistema);
        this.loading = false;
        this.sistemaData = {
          id: 1,
          nombre: sistema.nombreSistema,
          logo: sistema.logoSistema || 'assets/logo.png',
          eslogan: sistema.eslogan,
        };
      },
      error: (err) => {
        this.loading = false;
        console.error(`Sistema: ${err}`);
        this.notificationService.error('❌ Error al cargar la configuración del sistema');
      },
    });
  }

  // ------------------------------------------- Editar sistema -------------------------------------------------------
  //Editar todo
  guardarSistema() {
    if (!this.sistemaData.nombre) {
      this.notificationService.warning('⚠️ Por favor completa el nombre del sistema');
      return;
    }

    const sistemaActualizado = {
      logoSistema: this.sistemaData.logo,
      nombreSistema: this.sistemaData.nombre,
      eslogan: this.sistemaData.eslogan,
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.sistemaService.editSistema(this.idSistema, sistemaActualizado).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Sistema actualizado con éxito', 'success');
        this.cargarSistema();
      },
      error: (err) => {
        Swal.fire('Error', 'Error al actualizar datos del sistema. Intente nuevamente', 'error');
        this.notificationService.error(`Sistema: ${err}`);
        console.error('❌ Sistema: ', err);
      },
    });
  }

  //Editar solo logo
  editLogoSistema() {
    if (!this.sistemaData.logo) {
      this.notificationService.warning('⚠️ Por favor complete el url del logo');
      return;
    }

    /*
    const regexImagen = /\.(png|jpg|jpeg)$/i;

    if (!regexImagen.test(this.perfilData.foto)) {
      this.notificationService.warning('⚠️ El URL debe ser una imagen (.png, .jpg, .jpeg)');
      return;
    }
    */

    const sistemaActualizado = {
      logoSistema: this.sistemaData.logo,
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.sistemaService.editSistema(this.sistemaData.id, sistemaActualizado).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Logo de sistema actualizado con éxito', 'success');
        this.cargarSistema();
      },
      error: (err) => {
        Swal.fire('Error', 'Error al actualizar el logo del sistema. Intente nuevamente', 'error');
        this.notificationService.error(`Logo sistema: ${err}`);
        console.error('❌ Logo Sistema: ', err);
      },
    });
  }
}
