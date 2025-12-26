import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-extracciones-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './extracciones-section.component.html',
  styleUrls: ['./extracciones-section.component.scss']
})
export class ExtraccionesSectionComponent {
  @Input() extracciones: any[] = [];
  @Input() roleConfig: any;
  
  @Output() registrarExtraccion = new EventEmitter<void>();
  @Output() verDetalleExtraccion = new EventEmitter<any>();
  @Output() editarExtraccion = new EventEmitter<any>();
  @Output() getTotalExtraccionesPaciente = new EventEmitter<number>();
}