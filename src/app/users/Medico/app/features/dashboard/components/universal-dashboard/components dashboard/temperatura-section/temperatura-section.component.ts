import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temperatura-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temperatura-section.component.html',
  styleUrls: ['./temperatura-section.component.scss']
})
export class TemperaturaSectionComponent {
  @Input() refrigeradores: any[] = [];
  @Input() estadisticas: any;
  @Input() roleConfig: any;
  
  @Output() monitorearTemperatura = new EventEmitter<void>();
  @Output() getTemperaturaClass = new EventEmitter<string>();
  @Output() getTiempoDesde = new EventEmitter<Date>();
}