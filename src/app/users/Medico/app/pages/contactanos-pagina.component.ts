import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderMedicoComponent } from '../shared/components/header/header-medico.component';
import { FooterMedicoComponent } from '../shared/components/footer/footer-medico.component';

@Component({
  selector: 'app-contactanos-pagina',
  standalone: true,
  imports: [CommonModule, HeaderMedicoComponent, FooterMedicoComponent],
  templateUrl: './contactanos-pagina.component.html',
  styleUrls: ['./contactanos-pagina.component.scss']
})
export class ContactanosPaginaComponent implements OnInit {
  company = {
    name: 'LactaCare',
    phone: '+593 2 123 4567',
    email: 'hola@lactacare.ec',
    instagram: '@lactacare.ec',
    address: 'Quito, Ecuador',
    whatsapp: '+593 99 123 4567'
  };

  images = {
    lactancia: 'https://maternidad21.com/wp-content/uploads/2022/04/cuanto-dura-la-lactancia-materna-con-biberon-1024x576.jpg',
    team: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  };

  team = [
    {
      name: 'Dra. María Fernández',
      role: 'Pediatra Neonatóloga',
      description: 'Especialista en lactancia materna con experiencia en cuidado neonatal.',
      certification: 'Certificación en Lactancia',
      icon: 'fa-user-md'
    },
    {
      name: 'Dr. Carlos Mendoza',
      role: 'Coordinador Médico',
      description: 'Experiencia en gestión hospitalaria y protocolos de salud materna.',
      certification: 'Especialista en Salud',
      icon: 'fa-stethoscope'
    },
    {
      name: 'Ing. Ana López',
      role: 'Desarrolladora',
      description: 'Ingeniera especializada en desarrollo de sistemas para salud.',
      certification: 'Seguridad de Datos',
      icon: 'fa-laptop-medical'
    },
    {
      name: 'Lic. Sofía Ramírez',
      role: 'Coordinadora de Lactancia',
      description: 'Enfermera especializada con experiencia en lactancia materna.',
      certification: 'Educadora en Lactancia',
      icon: 'fa-heart'
    }
  ];

  values = [
    {
      title: 'Empatía y Calidez',
      description: 'Entendemos que cada madre y bebé son únicos. Acompañamiento humano en cada etapa.',
      icon: 'fa-heart'
    },
    {
      title: 'Seguridad y Confianza',
      description: 'Implementamos estándares de seguridad médica y protección de datos.',
      icon: 'fa-shield-alt'
    },
    {
      title: 'Evidencia Científica',
      description: 'Recomendaciones basadas en estudios y protocolos médicos actualizados.',
      icon: 'fa-flask'
    },
    {
      title: 'Transparencia',
      description: 'Comunicación clara sobre procesos y resultados.',
      icon: 'fa-handshake'
    },
    {
      title: 'Innovación Constante',
      description: 'Nos mantenemos actualizados para ofrecer la mejor solución.',
      icon: 'fa-sync-alt'
    },
    {
      title: 'Trabajo Colaborativo',
      description: 'Colaboramos con profesionales y familias para mejores resultados.',
      icon: 'fa-users'
    }
  ];

  technologies = [
    {
      title: 'Monitoreo Inteligente',
      description: 'Sistema para control de temperatura con alertas automáticas.',
      icon: 'fa-thermometer-half',
      features: ['Control preciso', 'Alertas oportunas', 'Historial detallado']
    },
    {
      title: 'Gestión Optimizada',
      description: 'Herramientas para optimizar recursos y procesos hospitalarios.',
      icon: 'fa-chart-line',
      features: ['Gestión de inventario', 'Reportes automáticos', 'Seguimiento de procesos']
    },
    {
      title: 'Acceso Digital',
      description: 'Plataforma web con funcionalidades para madres y profesionales.',
      icon: 'fa-mobile-alt',
      features: ['Recordatorios personalizados', 'Seguimiento de lactancia', 'Comunicación con especialistas']
    }
  ];

  certifications = [
    {
      name: 'Validación Médica',
      description: 'Protocolos revisados por especialistas',
      type: 'icon',
      icon: 'fa-hospital'
    },
    {
      name: 'Seguridad de Datos',
      description: 'Protección de información médica',
      type: 'icon',
      icon: 'fa-shield-alt'
    },
    {
      name: 'Alianzas Estratégicas',
      description: 'Colaboración con instituciones',
      type: 'icon',
      icon: 'fa-handshake'
    },
    {
      name: 'Enfoque Humano',
      description: 'Desarrollo centrado en el usuario',
      type: 'icon',
      icon: 'fa-heart'
    }
  ];

  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    console.log('Página Nosotros cargada');
  }

  onSubmitMessage(): void {
    alert('Gracias por tu mensaje. Te contactaremos pronto.');
  }
}