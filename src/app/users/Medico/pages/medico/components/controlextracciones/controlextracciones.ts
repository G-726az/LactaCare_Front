import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-controlextracciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controlextracciones.html',
  styleUrls: ['./controlextracciones.css'],
})
export class ControlExtraccionesComponent {
  constructor() {
    this.init();
  }

  init() {
    console.log('ControlExtraccionesComponent inicializado');
  }

  render() {
    // Lógica de renderizado
  }
}
