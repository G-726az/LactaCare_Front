import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temperatura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temperatura.html',
  styleUrls: ['./temperatura.css'],
})
export class TemperaturaComponent {
  constructor() {
    this.init();
  }

  init() {
    console.log('TemperaturaComponent inicializado');
  }

  render() {
    // Lógica de renderizado
  }
}
