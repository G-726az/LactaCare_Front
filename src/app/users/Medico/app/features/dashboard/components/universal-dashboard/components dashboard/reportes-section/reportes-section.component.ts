import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioSesion } from '../../../../../../core/models/database.models';

@Component({
  selector: 'app-reportes-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-section.component.html',
  styleUrls: ['./reportes-section.component.scss']
})
export class ReportesSectionComponent {
  @Input() lactarios: any[] = [];
  @Input() refrigeradores: any[] = [];
  @Input() extracciones: any[] = [];
  @Input() estadisticas: any;
  @Input() userData: UsuarioSesion | null = null;
  @Input() showLactariosDetails: boolean = false;
  @Input() roleConfig: any;
  
  @Output() generarReporteLactarios = new EventEmitter<void>();
  @Output() generarReporteExtracciones = new EventEmitter<void>();
  @Output() generarReporteTemperatura = new EventEmitter<void>();
  @Output() toggleLactariosDetails = new EventEmitter<void>();
  @Output() getRefrigeradoresPorLactario = new EventEmitter<number>();
  @Output() getCapacidadPorLactario = new EventEmitter<number>();
}