import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioSesion } from '../../../../../../core/models/database.models';

@Component({
  selector: 'app-dashboard-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-section.component.html',
  styleUrls: ['./dashboard-section.component.scss']
})
export class DashboardSectionComponent {
  @Input() estadisticas: any;
  @Input() userData: UsuarioSesion | null = null;
  @Input() roleConfig: any;
  
  @Output() cambiarSeccion = new EventEmitter<string>();
  @Output() registrarExtraccion = new EventEmitter<void>();
  @Output() generarReporte = new EventEmitter<void>();
  @Output() verPerfil = new EventEmitter<void>();
}