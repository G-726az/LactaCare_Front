import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

interface Chat {
  id: number;
  nombreChat: string;
  cargaPdf: string;
  nombreArchivo: string;
  fechaCarga: string;
  tamano: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  chats: Chat[] = [
    {
      id: 1,
      nombreChat: 'Manual de Lactancia Materna',
      cargaPdf: 'manual_lactancia.pdf',
      nombreArchivo: 'manual_lactancia.pdf',
      fechaCarga: '2024-12-01T10:30:00',
      tamano: '2.5 MB'
    },
    {
      id: 2,
      nombreChat: 'Guía de Alimentación Infantil',
      cargaPdf: 'guia_alimentacion.pdf',
      nombreArchivo: 'guia_alimentacion.pdf',
      fechaCarga: '2024-11-28T15:45:00',
      tamano: '1.8 MB'
    }
  ];

  mostrarModal = false;
  chatActual: Partial<Chat> = {};
  archivoSeleccionado: File | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {}

  abrirModalNuevo() {
    this.chatActual = {
      nombreChat: ''
    };
    this.archivoSeleccionado = null;
    this.mostrarModal = true;
    this.notificationService.info('📄 Abriendo formulario para cargar nuevo PDF');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.notificationService.error('❌ Solo se permiten archivos PDF');
        event.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.notificationService.error('❌ El archivo no puede superar los 10MB');
        event.target.value = '';
        return;
      }
      this.archivoSeleccionado = file;
      this.notificationService.success(`✅ Archivo "${file.name}" seleccionado (${this.formatFileSize(file.size)})`);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  guardarChat() {
    if (!this.chatActual.nombreChat) {
      this.notificationService.warning('⚠️ Por favor ingresa un nombre para el chat');
      return;
    }

    if (!this.archivoSeleccionado) {
      this.notificationService.warning('⚠️ Por favor selecciona un archivo PDF');
      return;
    }

    const nuevoId = Math.max(...this.chats.map(c => c.id), 0) + 1;
    this.chats.push({
      id: nuevoId,
      nombreChat: this.chatActual.nombreChat,
      cargaPdf: this.archivoSeleccionado.name,
      nombreArchivo: this.archivoSeleccionado.name,
      fechaCarga: new Date().toISOString(),
      tamano: this.formatFileSize(this.archivoSeleccionado.size)
    });

    this.notificationService.success(`✅ PDF "${this.chatActual.nombreChat}" cargado exitosamente`);
    this.cerrarModal();
  }

  verPDF(chat: Chat) {
    this.notificationService.info(`📄 Abriendo PDF: ${chat.nombreArchivo}`);
  }

  eliminarChat(id: number) {
    const chat = this.chats.find(c => c.id === id);
    if (!chat) return;

    if (confirm('⚠️ ¿Estás seguro de eliminar este documento?')) {
      this.chats = this.chats.filter(c => c.id !== id);
      this.notificationService.success(`✅ Documento "${chat.nombreChat}" eliminado exitosamente`);
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.chatActual = {};
    this.archivoSeleccionado = null;
  }
}