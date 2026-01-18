import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pacientes.html',
  styleUrls: ['./pacientes.css'],
})
export class PacientesComponent {
  constructor() {
    this.init();
  }

  init() {
    console.log('PacientesComponent inicializado');
  }

  render() {
    // Lógica de renderizado
  }
}
