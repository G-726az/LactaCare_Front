import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lactarios-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lactarios-section.component.html',
  styleUrls: ['./lactarios-section.component.scss']
})
export class LactariosSectionComponent {
  @Input() lactarios: any[] = [];
  @Input() refrigeradores: any[] = [];
  @Input() roleConfig: any;
  
  @Output() cambiarSeccion = new EventEmitter<string>();
  @Output() verDetalleLactario = new EventEmitter<any>();
  @Output() editarLactario = new EventEmitter<any>();
  @Output() agregarLactario = new EventEmitter<void>();
  @Output() getRefrigeradoresPorLactario = new EventEmitter<number>();
  @Output() getCapacidadPorLactario = new EventEmitter<number>();
}