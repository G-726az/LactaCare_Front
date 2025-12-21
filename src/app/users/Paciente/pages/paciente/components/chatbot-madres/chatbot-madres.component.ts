import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { LineBreakPipe } from '../line-break.pipe';

interface Mensaje {
  id: number;
  texto: string;
  tipo: 'bot' | 'user';
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot-madres',
  templateUrl: './chatbot-madres.component.html',
  styleUrls: ['./chatbot-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, LineBreakPipe],
})
export class ChatbotMadresComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatHistory') private chatHistory!: ElementRef;

  mensajes: Mensaje[] = [];
  mensajeInput = '';
  esperandoRespuesta = false;
  private shouldScroll = false;

  // Base de conocimiento del chatbot
  private respuestasBot: { [key: string]: string } = {
    produccion:
      'Para aumentar la producción de leche, te recomiendo:\n\n✅ Extraer con mayor frecuencia (cada 2-3 horas)\n💧 Mantenerte bien hidratada (2-3 litros de agua al día)\n😴 Descansar lo suficiente\n🥗 Consumir alimentos nutritivos ricos en proteínas\n🤱 Mantener contacto piel con piel con tu bebé\n\n¿Tienes alguna duda específica?',

    dolor:
      'Si experimentas dolor durante la lactancia:\n\n🔍 Verifica la posición del bebé (debe abarcar toda la areola)\n❄️ Aplica compresas frías después de amamantar\n🌿 Usa lanolina pura entre tomas\n👩‍⚕️ Consulta con un especialista si el dolor persiste\n\n¿El dolor es constante o solo al inicio de la toma?',

    almacenamiento:
      'Guía de almacenamiento de leche materna:\n\n🌡️ Temperatura ambiente: 4-6 horas\n❄️ Refrigerador (4°C): 3-5 días\n🧊 Congelador (-18°C): 6-12 meses\n\n📝 Recuerda etiquetar con fecha y hora\n🧪 Usa recipientes estériles\n\n¿Necesitas información sobre descongelación?',

    extraccion:
      'Consejos para una extracción efectiva:\n\n⏰ Extrae en horarios regulares\n🧘‍♀️ Relájate antes de comenzar\n💆‍♀️ Masajea suavemente tus pechos\n🖼️ Mira fotos o videos de tu bebé\n🔊 Usa un extractor de calidad adecuado\n\n¿Usas extractor manual o eléctrico?',

    alimentacion:
      'Alimentación durante la lactancia:\n\n🥛 Lácteos (calcio)\n🥩 Proteínas magras\n🥬 Vegetales de hoja verde\n🥜 Frutos secos y semillas\n🐟 Pescados ricos en Omega-3\n💊 Suplementos de vitamina D si es necesario\n\n¿Tienes restricciones alimentarias?',

    horarios:
      'Horarios de extracción recomendados:\n\n🌅 Temprano (6-7 AM): Mayor producción\n☀️ Media mañana (10-11 AM)\n🌞 Tarde (2-3 PM)\n🌆 Noche (7-8 PM)\n\nIntenta mantener intervalos de 2-4 horas.\n\n¿Trabajas fuera de casa?',
  };

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.cargarHistorial();
    if (this.mensajes.length === 0) {
      this.agregarMensajeBot(
        '¡Hola! Estoy aquí para ayudarte con tus dudas sobre la lactancia. ¿En qué puedo apoyarte hoy?\n\nPuedes preguntarme sobre:\n• Producción de leche\n• Dolor durante lactancia\n• Almacenamiento de leche\n• Técnicas de extracción\n• Alimentación durante lactancia\n• Horarios de extracción'
      );
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  cargarHistorial(): void {
    const stored = localStorage.getItem('chatbot_historial');
    if (stored) {
      try {
        this.mensajes = JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    }
  }

  guardarHistorial(): void {
    try {
      localStorage.setItem('chatbot_historial', JSON.stringify(this.mensajes));
    } catch (error) {
      console.error('Error al guardar historial:', error);
    }
  }

  enviarMensaje(): void {
    if (!this.mensajeInput.trim() || this.esperandoRespuesta) return;

    const mensajeUsuario: Mensaje = {
      id: this.mensajes.length + 1,
      texto: this.mensajeInput,
      tipo: 'user',
      timestamp: new Date(),
    };

    this.mensajes.push(mensajeUsuario);
    this.shouldScroll = true;

    const pregunta = this.mensajeInput.toLowerCase();
    this.mensajeInput = '';
    this.esperandoRespuesta = true;

    // Simular delay de respuesta
    setTimeout(() => {
      const respuesta = this.obtenerRespuesta(pregunta);
      this.agregarMensajeBot(respuesta);
      this.esperandoRespuesta = false;
    }, 1000);
  }

  private obtenerRespuesta(pregunta: string): string {
    // Buscar palabras clave en la pregunta
    for (const [clave, respuesta] of Object.entries(this.respuestasBot)) {
      if (pregunta.includes(clave) || pregunta.includes(clave.substring(0, 5))) {
        return respuesta;
      }
    }

    // Palabras clave adicionales
    if (
      pregunta.includes('aumentar') ||
      pregunta.includes('mas leche') ||
      pregunta.includes('poca leche')
    ) {
      return this.respuestasBot['produccion'];
    }
    if (pregunta.includes('duele') || pregunta.includes('dolor') || pregunta.includes('lastima')) {
      return this.respuestasBot['dolor'];
    }
    if (
      pregunta.includes('guardar') ||
      pregunta.includes('conservar') ||
      pregunta.includes('refriger')
    ) {
      return this.respuestasBot['almacenamiento'];
    }
    if (pregunta.includes('extraer') || pregunta.includes('sacar') || pregunta.includes('bomba')) {
      return this.respuestasBot['extraccion'];
    }
    if (pregunta.includes('comer') || pregunta.includes('alimento') || pregunta.includes('dieta')) {
      return this.respuestasBot['alimentacion'];
    }
    if (pregunta.includes('cuando') || pregunta.includes('hora') || pregunta.includes('horario')) {
      return this.respuestasBot['horarios'];
    }

    // Respuesta por defecto
    return 'Entiendo tu pregunta. Para darte la mejor información, ¿podrías ser más específica?\n\nPuedo ayudarte con:\n• Producción de leche\n• Técnicas de lactancia\n• Almacenamiento\n• Nutrición\n• Horarios\n\n¿Sobre cuál tema te gustaría saber más?';
  }

  private agregarMensajeBot(texto: string): void {
    const mensajeBot: Mensaje = {
      id: this.mensajes.length + 1,
      texto: texto,
      tipo: 'bot',
      timestamp: new Date(),
    };
    this.mensajes.push(mensajeBot);
    this.shouldScroll = true;
    this.guardarHistorial();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatHistory) {
        this.chatHistory.nativeElement.scrollTop = this.chatHistory.nativeElement.scrollHeight;
      }
    } catch (error) {
      console.error('Error al hacer scroll:', error);
    }
  }

  limpiarHistorial(): void {
    if (confirm('¿Estás segura de borrar todo el historial de conversación?')) {
      this.mensajes = [];
      localStorage.removeItem('chatbot_historial');
      this.agregarMensajeBot(
        '¡Hola! Estoy aquí para ayudarte con tus dudas sobre la lactancia. ¿En qué puedo apoyarte hoy?'
      );
      this.notificationService.success('🗑️ Historial limpiado');
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
}
