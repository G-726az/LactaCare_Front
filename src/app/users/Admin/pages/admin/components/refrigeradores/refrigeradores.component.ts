import { Component } from '@angular/core';
import { Refrigerador, SalaLactancia } from '../../../../../../models/database.models';
import { RefrigeradorService } from '../../../../app/services/refrigerador.service';
import { NotificationService } from '../../../../../../services/notification.service';
import { SalaLactanciaService } from '../../../../app/services/sala-lactancia.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

/*
export interface RefrigeradorUpdateDTO {
  idRefrigerador: number;
  capacidadMaxRefri: number;
  filaRefrigerador: number;
  columnaRefrigerador: number;
  pisoRefrigerador: number;
  idSalaLactancia: number;
}
*/

@Component({
  selector: 'app-refrigeradores',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './refrigeradores.component.html',
  styleUrl: './refrigeradores.component.css',
})
export class RefrigeradoresComponent {
  refrigeradores: Refrigerador[] = [];
  salasLactancia: SalaLactancia[] = [];
  refrigeradorActual: Partial<Refrigerador> = {};
  loadingRefrigeradores = true;
  loadingSalas = true;
  mostrarModal = false;
  modoEdicion = false;

  ngOnInit() {
    this.cargarSalas();
  }

  constructor(
    private refrigeradorService: RefrigeradorService,
    private notificationService: NotificationService,
    private salasLactanciaService: SalaLactanciaService
  ) {}

  cargarSalas() {
    this.salasLactanciaService.getAll().subscribe({
      next: (salas: any) => {
        this.salasLactancia = salas;
      },
      error: (err) => {
        console.error('Error salas', err);
      },
      complete: () => {
        this.loadingSalas = false;
      },
    });
  }

  cargarRefrigeradoresBySalaId(idSala: number) {
    this.loadingRefrigeradores = true;
    this.refrigeradores = [];
    this.refrigeradorService.getBySalaId(idSala).subscribe({
      next: (refrigeradores: any) => {
        this.loadingRefrigeradores = false;
        console.log('Refrigeradores desde json', refrigeradores);
        this.refrigeradores = refrigeradores;
        this.notificationService.success('Refrigeradores cargados correctamente');
      },
      error: (err) => {
        console.log('Error');
        this.loadingRefrigeradores = false;
        this.notificationService.error(`Error al cargar los refrigeradores ${err}`);
        console.error('❌Error refrigeradores ', err);
      },
    });
  }

  guardarRefrigerador() {
    console.log('Id sala guardar: ', this.refrigeradorActual.salaLactancia?.idLactario);
    if (!this.refrigeradorActual.salaLactancia?.idLactario) {
      this.notificationService.error('Error al cargar la sala de lactancia');
      return;
    }

    if (
      !this.refrigeradorActual.capacidadMaxRefri ||
      !this.refrigeradorActual.columnaRefrigerador ||
      !this.refrigeradorActual.filaRefrigerador ||
      !this.refrigeradorActual.pisoRefrigerador
    ) {
      this.notificationService.error('Todos los datos son obligatorios');
      return;
    }

    const payload: Partial<Refrigerador> = {
      idRefrigerador: this.refrigeradorActual.idRefrigerador,
      salaLactancia: {
        idLactario: this.refrigeradorActual.salaLactancia.idLactario,
      },
      capacidadMaxRefri: this.refrigeradorActual.capacidadMaxRefri,
      columnaRefrigerador: this.refrigeradorActual.columnaRefrigerador,
      filaRefrigerador: this.refrigeradorActual.filaRefrigerador,
      pisoRefrigerador: this.refrigeradorActual.pisoRefrigerador,
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });

    if (this.modoEdicion) {
      this.refrigeradorService.update(payload, this.refrigeradorActual.idRefrigerador!).subscribe({
        next: () => {
          Swal.fire('Refrigerador', 'Refrigerador editado con éxito', 'success');
          this.cargarSalas();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Refrigerador:', err);
          Swal.fire('Error', 'Error al editar el refrigerador. Intente nuevamente', 'error');
          this.notificationService.error(`Refrigerador: ${err}`);
        },
      });
    } else {
      this.refrigeradorService.create(payload).subscribe({
        next: () => {
          Swal.fire('Refrigerador', 'Refrigerador creado con éxito', 'success');
          this.cargarSalas();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('❌Refrigerador:', err);
          Swal.fire('Error', 'Error al guardar el refrigerador. Intente nuevamente', 'error');
          this.notificationService.error(`Refrigerador: ${err}`);
        },
      });
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.refrigeradorActual = {};
  }

  updateCapacidadMax() {
    let fila = this.refrigeradorActual.filaRefrigerador!;
    let col = this.refrigeradorActual.columnaRefrigerador!;
    let piso = this.refrigeradorActual.pisoRefrigerador!;
    let max = piso * (fila * col);
    this.refrigeradorActual.capacidadMaxRefri = max;
  }

  crearRefrigerador(idSala: number) {
    this.modoEdicion = false;
    this.refrigeradorActual = {
      capacidadMaxRefri: 0,
      filaRefrigerador: 0,
      columnaRefrigerador: 0,
      pisoRefrigerador: 0,
      salaLactancia: {
        idLactario: 0,
      },
    };
    this.refrigeradorActual.salaLactancia!.idLactario = idSala;
    console.log('Id Sala: ', this.refrigeradorActual.salaLactancia?.idLactario);
    this.mostrarModal = true;
  }

  editarRefrigerador(item: Refrigerador) {
    this.modoEdicion = true;
    this.refrigeradorActual = {
      idRefrigerador: item.idRefrigerador,
      capacidadMaxRefri: item.capacidadMaxRefri,
      columnaRefrigerador: item.columnaRefrigerador,
      filaRefrigerador: item.filaRefrigerador,
      salaLactancia: {
        idLactario: item.salaLactancia.idLactario,
      },
      pisoRefrigerador: item.pisoRefrigerador,
    };
    console.log(this.refrigeradorActual);
    this.mostrarModal = true;
  }
}
