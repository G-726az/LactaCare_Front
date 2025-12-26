import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { ChatService, PreguntaRequest } from '../../../../app/chat.service';

interface Mensaje {
  id: number;
  texto: string;
  tipo: 'bot' | 'user';
  hora: Date;
  esMio?: boolean;
}

@Component({
  selector: 'app-chatbot-madres',
  templateUrl: './chatbot-madres.component.html',
  styleUrls: ['./chatbot-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ChatbotMadresComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  historial: Mensaje[] = [];
  mensajeUsuario: string = '';
  cargando: boolean = false;

  private shouldScroll = false;
  latitud: number = 0;
  longitud: number = 0;

  private userId: number | null = null;

  constructor(private notificationService: NotificationService, private chatService: ChatService) {}

  ngOnInit(): void {
    this.obtenerUsuarioActual();
    this.obtenerUbicacion();
    this.cargarHistorial();

    if (this.historial.length === 0) {
      this.agregarMensajeBot(
        '¡Hola! 🌸 Soy LactaBot IA. He leído todos los manuales médicos del sistema para responder tus dudas con información certificada.\n\nPregúntame lo que quieras sobre lactancia, alimentación o cuidados.'
      );
    } else {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  obtenerUsuarioActual() {
    const usuarioJson = localStorage.getItem('lactaCareUser');
    if (usuarioJson) {
      const user = JSON.parse(usuarioJson);
      this.userId = user.id;
    }
  }

  private getStorageKey(): string {
    if (this.userId) {
      return `chat_historial_usuario_${this.userId}`;
    }
    return 'chat_historial_invitado';
  }

  cargarHistorial(): void {
    const key = this.getStorageKey();
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        this.historial = JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    }
  }

  guardarHistorial(): void {
    try {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(this.historial));
    } catch (error) {
      console.error('Error al guardar historial:', error);
    }
  }

  obtenerUbicacion() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitud = position.coords.latitude;
          this.longitud = position.coords.longitude;
        },
        () => console.warn('Ubicación no disponible')
      );
    }
  }

  enviar(): void {
    if (!this.mensajeUsuario.trim() || this.cargando) return;

    const textoPregunta = this.mensajeUsuario;

    const nuevoMensaje: Mensaje = {
      id: this.historial.length + 1,
      texto: textoPregunta,
      tipo: 'user',
      hora: new Date(),
      esMio: true,
    };

    this.historial.push(nuevoMensaje);
    this.guardarHistorial();

    // Forzamos el scroll hacia abajo
    this.shouldScroll = true;

    this.mensajeUsuario = '';
    this.cargando = true;

    const request: PreguntaRequest = {
      pregunta: textoPregunta,
      latitud: this.latitud,
      longitud: this.longitud,
    };

    this.chatService.enviarMensaje(request).subscribe({
      next: (respuestaIA: any) => {
        this.agregarMensajeBot(respuestaIA);
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error en Chatbot:', error);
        this.agregarMensajeBot(
          'Lo siento, tuve un problema al consultar mi base de datos. Por favor intenta de nuevo en un momento. 😓'
        );
        this.cargando = false;
      },
    });
  }

  private agregarMensajeBot(texto: string): void {
    const mensajeBot: Mensaje = {
      id: this.historial.length + 1,
      texto: texto,
      tipo: 'bot',
      hora: new Date(),
      esMio: false,
    };
    this.historial.push(mensajeBot);
    this.guardarHistorial();

    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        setTimeout(() => {
          this.scrollContainer.nativeElement.scrollTop =
            this.scrollContainer.nativeElement.scrollHeight;
        }, 50);
      }
    } catch (error) {
      console.error('Error al hacer scroll:', error);
    }
  }

  limpiarHistorial(): void {
    if (confirm('¿Estás segura de borrar todo el historial de conversación?')) {
      this.historial = [];
      localStorage.removeItem(this.getStorageKey());
      this.agregarMensajeBot(
        '¡Hola! Soy LactaBot IA. Estoy lista para responder tus dudas basándome en manuales médicos.'
      );
      this.notificationService.success('🗑️ Historial limpiado');
    }
  }
}
