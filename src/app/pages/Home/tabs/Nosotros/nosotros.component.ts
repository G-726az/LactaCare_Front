import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-nosotros',
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css']
})
export class NosotrosComponent implements OnInit {
  equipo = [
    { 
      nombre: 'Dra. María García', 
      cargo: 'Pediatra Especialista', 
      experiencia: '15 años',
      descripcion: 'Especialista en lactancia materna y cuidados neonatales.',
      imagen: 'https://randomuser.me/api/portraits/women/32.jpg'
    },
    { 
      nombre: 'Lic. Ana Rodríguez', 
      cargo: 'Consultora de Lactancia', 
      experiencia: '10 años',
      descripcion: 'Asesora en lactancia y apoyo emocional a madres.',
      imagen: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    { 
      nombre: 'Dr. Carlos Mendoza', 
      cargo: 'Ginecólogo', 
      experiencia: '12 años',
      descripcion: 'Especialista en salud materna y seguimiento del embarazo.',
      imagen: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  ];

  mision = 'Brindar espacios seguros y apoyo profesional para una lactancia materna exitosa, promoviendo la salud y bienestar de madres y bebés.';
  vision = 'Ser la red de lactarios más confiable de Ecuador, reconocida por nuestra excelencia en atención y compromiso con la salud materno-infantil.';

  valores = [
    { titulo: 'Compromiso', descripcion: 'Nos dedicamos plenamente al bienestar de cada madre y bebé.' },
    { titulo: 'Profesionalismo', descripcion: 'Contamos con personal capacitado y actualizado.' },
    { titulo: 'Empatía', descripcion: 'Comprendemos y acompañamos en cada etapa del proceso.' },
    { titulo: 'Innovación', descripcion: 'Utilizamos tecnología y métodos vanguardistas.' }
  ];

  constructor() { }

  ngOnInit(): void {
  }
}