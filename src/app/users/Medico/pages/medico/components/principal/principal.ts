import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './principal.html',
  styleUrls: ['./principal.css'],
})
export class PrincipalComponent implements OnInit {
  @Input() medicoData: any;
  @Input() stats: any;
  @Output() navegarASeccion = new EventEmitter<string>();

  vistasDisponibles = [
    {
      id: 'reservas',
      titulo: 'Reservas',
      icono: '📅',
      descripcion: 'Gestionar reservas de pacientes',
      color: '#64B5F6',
    },
    {
      id: 'extracciones',
      titulo: 'Extracciones',
      icono: '🍼',
      descripcion: 'Registro de extracciones',
      color: '#81C784',
    },
    {
      id: 'temperatura',
      titulo: 'Temperatura',
      icono: '🌡️',
      descripcion: 'Monitoreo IoT',
      color: '#FFB74D',
    },
  ];

  accionesRapidas = [
    {
      id: 'atenciones',
      titulo: 'Nueva Atención',
      icono: '📋',
      descripcion: 'Registrar nueva atención médica',
      color: '#42A5F5',
    },
    {
      id: 'pacientes',
      titulo: 'Nuevo Paciente',
      icono: '👥',
      descripcion: 'Registrar nuevo paciente',
      color: '#66BB6A',
    },
    {
      id: 'temperatura',
      titulo: 'Registro Temperatura',
      icono: '🌡️',
      descripcion: 'Monitorear temperatura de refrigeradores',
      color: '#FFA726',
    },
    {
      id: 'reportes',
      titulo: 'Reportes',
      icono: '📊',
      descripcion: 'Ver estadísticas y reportes',
      color: '#AB47BC',
    },
  ];

  ngOnInit(): void {
    console.log('Principal cargado con stats:', this.stats);
  }

  navegarA(seccion: string): void {
    this.navegarASeccion.emit(seccion);
  }

  verVista(vistaId: string): void {
    console.log('Ver vista:', vistaId);
    // Aquí se puede implementar lógica adicional
  }
}
