import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cabecera.html',
  styleUrls: ['./cabecera.css'],
})
export class CabeceraComponent {
  @Input() nombreMedico: string = '';
  @Output() nuevaAtencionClick = new EventEmitter<void>();
  @Output() reportesClick = new EventEmitter<void>();

  onNuevaAtencion(): void {
    this.nuevaAtencionClick.emit();
  }

  onReportes(): void {
    this.reportesClick.emit();
  }

  getSaludo(): string {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }
}
