import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioSesion } from '../../../../../../core/models/database.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() menuAbierto: boolean = true;
  @Input() seccionActiva: string = 'dashboard';
  @Input() roleConfig: any;
  @Input() userData: UsuarioSesion | null = null;
  
  @Output() toggleMenu = new EventEmitter<void>();
  @Output() cambiarSeccion = new EventEmitter<string>();
  @Output() verMiInformacion = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}