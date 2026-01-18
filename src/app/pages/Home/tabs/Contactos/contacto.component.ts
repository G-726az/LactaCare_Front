import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Lactario {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  lat: number;
  lng: number;
  imagen?: string;
}

@Component({
  standalone: false,
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css'],
})
export class ContactoComponent implements OnInit {
  // Datos de contacto de LactaCare
  contactData = {
    nombre: 'LactaCare',
    celular: '+593 99 999 9999',
    telefono: '02-222222',
    email: 'contacto@lactacare.com',
    direccion: 'Av. 12 de Abril y Av. Ordóñez Lasso, Cuenca, Ecuador',
    codigoPostal: '010150',
    horarios: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
  };

  // Lactario seleccionado actualmente
  selectedLactario: Lactario | null = null;

  // Lactarios en CUENCA, AZUAY - Ecuador con coordenadas REALES
  lactarios: Lactario[] = [
    {
      id: 1,
      nombre: 'Lactario Central Cuenca',
      direccion: 'Av. 12 de Abril y Av. Ordóñez Lasso, Cuenca',
      telefono: '+593 7-284-2000',
      horario: 'Lun-Vie: 8:00 AM - 6:00 PM',
      lat: -2.8979,
      lng: -78.985,
      imagen: 'https://i.imgur.com/4ZHyoSL.jpg',
    },
    {
      id: 2,
      nombre: 'Lactario Centro Histórico',
      direccion: 'Calle Larga y Hermano Miguel, Centro Histórico',
      telefono: '+593 7-283-5000',
      horario: 'Lun-Sab: 9:00 AM - 5:00 PM',
      lat: -2.9048,
      lng: -78.9868,
      imagen: 'https://i.imgur.com/4ZHyoSL.jpg',
    },
    {
      id: 3,
      nombre: 'Lactario Norte - El Estadio',
      direccion: 'Av. Loja y Coronel Talbot, Sector Norte',
      telefono: '+593 7-286-8000',
      horario: 'Lun-Vie: 8:30 AM - 5:30 PM',
      lat: -2.885,
      lng: -78.992,
      imagen: 'https://i.imgur.com/4ZHyoSL.jpg',
    },
    {
      id: 4,
      nombre: 'Lactario Sur - Av. Américas',
      direccion: 'Av. Américas y Mariscal Lamar, Sector Sur',
      telefono: '+593 7-282-5000',
      horario: 'Lun-Vie: 7:00 AM - 6:00 PM',
      lat: -2.92,
      lng: -78.975,
      imagen: 'https://i.imgur.com/4ZHyoSL.jpg',
    },
    {
      id: 5,
      nombre: 'Lactario El Tejar',
      direccion: 'Calle Larga entre Borrero y Bolívar, El Tejar',
      telefono: '+593 7-284-3000',
      horario: 'Lun-Vie: 8:00 AM - 5:00 PM',
      lat: -2.91,
      lng: -78.98,
      imagen: 'https://i.imgur.com/4ZHyoSL.jpg',
    },
  ];

  // Datos del formulario
  formData = {
    nombre: '',
    email: '',
    celular: '',
    asunto: '',
    telefono: '',
    mensaje: '',
  };

  showConfirmation = false;
  lastSubmittedName = '';
  loading = false;
  safeMapUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.selectedLactario = this.lactarios[0];
    this.safeMapUrl = this.generateMapUrl();
  }

  ngOnInit(): void {
    this.selectedLactario = this.lactarios[0];
    this.updateMap();
  }

  // Seleccionar lactario (CORREGIDO: antes tenía nombre diferente)
  selectLactario(lactario: Lactario): void {
    this.selectedLactario = lactario;
    this.updateMap();
  }

  // Método con nombre anterior mantenido por compatibilidad
  seleccionarLactario(lactario: Lactario): void {
    this.selectLactario(lactario);
  }

  // Actualizar mapa
  updateMap(): void {
    if (this.selectedLactario) {
      this.safeMapUrl = this.generateMapUrl();
    }
  }

  // Generar URL del mapa
  generateMapUrl(): SafeResourceUrl {
    if (!this.selectedLactario) {
      const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63756.18950662889!2d-78.98!3d-2.90!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91cd18857d1f891f%3A0x2f2e7e8c3c3c3c3c!2sCuenca%2C%20Ecuador!5e0!3m2!1ses!2sec!4v1234567890123`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
    }

    const { lat, lng } = this.selectedLactario;
    const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=es`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  // Abrir Google Maps (CORREGIDO)
  openGoogleMaps(): void {
    if (this.selectedLactario) {
      const { lat, lng, nombre } = this.selectedLactario;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(url, '_blank');
    }
  }

  // Método con nombre anterior por compatibilidad
  abrirEnMaps(): void {
    this.openGoogleMaps();
  }

  // Abrir en Waze (CORREGIDO)
  openWaze(): void {
    if (this.selectedLactario) {
      const { lat, lng } = this.selectedLactario;
      const url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
      window.open(url, '_blank');
    }
  }

  // Método con nombre anterior por compatibilidad
  abrirEnWaze(): void {
    this.openWaze();
  }

  // Calcular completitud del formulario (CORREGIDO)
  getFormCompletion(): number {
    let completedFields = 0;
    const totalFields = 6;

    if (this.formData.nombre.trim()) completedFields++;
    if (this.formData.email.trim()) completedFields++;
    if (this.formData.celular.trim()) completedFields++;
    if (this.formData.asunto.trim()) completedFields++;
    if (this.formData.telefono.trim()) completedFields++;
    if (this.formData.mensaje.trim()) completedFields++;

    return Math.round((completedFields / totalFields) * 100);
  }

  // Enviar formulario de contacto (CORREGIDO)
  onSubmit(): void {
    if (
      this.formData.nombre &&
      this.formData.email &&
      this.formData.celular &&
      this.formData.mensaje
    ) {
      this.loading = true;
      console.log('Mensaje enviado:', this.formData);
      this.lastSubmittedName = this.formData.nombre;

      setTimeout(() => {
        this.showConfirmation = true;
        this.loading = false;
        this.formData = {
          nombre: '',
          email: '',
          celular: '',
          asunto: '',
          telefono: '',
          mensaje: '',
        };
        setTimeout(() => {
          this.closeConfirmation();
        }, 3000);
      }, 1500);
    }
  }

  // Método con nombre anterior por compatibilidad
  enviarMensaje(): void {
    this.onSubmit();
  }

  // Cerrar confirmación
  closeConfirmation(): void {
    this.showConfirmation = false;
  }
}
