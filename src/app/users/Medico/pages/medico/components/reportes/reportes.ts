import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css'],
})
export class ReportesComponent {
  constructor() {
    this.init();
  }

  init() {
    console.log('ReportesComponent inicializado');
  }

  render() {
    // Lógica de renderizado
  }
}
