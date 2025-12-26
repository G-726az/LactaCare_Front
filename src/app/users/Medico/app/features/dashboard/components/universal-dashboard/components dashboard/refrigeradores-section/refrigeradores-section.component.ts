import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-refrigeradores-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refrigeradores-section.component.html',
  styleUrls: ['./refrigeradores-section.component.scss']
})
export class RefrigeradoresSectionComponent {
  @Input() refrigeradores: any[] = [];
  @Input() roleConfig: any;
  
  @Output() monitorearTemperatura = new EventEmitter<void>();
  @Output() getTemperaturaClass = new EventEmitter<string>();
  @Output() getTiempoDesde = new EventEmitter<Date>();
}