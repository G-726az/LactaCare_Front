import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../../services/notification.service';
import { DocumentoService } from '../../../../../../../app/services/documento.service';
import { HttpClientModule } from '@angular/common/http';

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

  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit {
  chats: Chat[] = [];
  mostrarModal = false;
  chatActual: Partial<Chat> = {};
  archivoSeleccionado: File | null = null;

  constructor(
    private notificationService: NotificationService,
    private documentoService: DocumentoService
  ) {}

  ngOnInit() {
    this.cargarChatsDesdeBD();
  }

  cargarChatsDesdeBD() {
    this.documentoService.listar().subscribe({
      next: (datosBackend: any) => {
        this.chats = datosBackend.map((doc: any) => ({
          id: doc.idDocumento,

          nombreChat: doc.nombreArchivo,
          cargaPdf: doc.nombreArchivo,
          nombreArchivo: doc.nombreArchivo,
          fechaCarga: doc.fechaSubida,

          tamano: 'PDF',
        }));
      },
      error: (err: any) => {
        console.error(err);
        this.notificationService.error('❌ Error al cargar los documentos');
      },
    });
  }

  abrirModalNuevo() {
    this.chatActual = { nombreChat: '' };
    this.archivoSeleccionado = null;
    this.mostrarModal = true;
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
      this.notificationService.success(`✅ Archivo "${file.name}" seleccionado`);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  guardarChat() {
    if (!this.archivoSeleccionado) {
      this.notificationService.warning('⚠️ Por favor selecciona un archivo PDF');
      return;
    }

    this.documentoService.subir(this.archivoSeleccionado).subscribe({
      next: (resp: any) => {
        this.notificationService.success(`✅ PDF cargado exitosamente`);
        this.cerrarModal();
        this.cargarChatsDesdeBD();
      },
      error: (err: any) => {
        console.error(err);
        this.notificationService.error('❌ Error al subir el archivo al servidor');
      },
    });
  }

  verPDF(chat: Chat) {
    this.notificationService.info(`🔄 Cargando PDF: ${chat.nombreArchivo}...`);

    this.documentoService.verArchivo(chat.id).subscribe({
      next: (data: Blob) => {
        const fileURL = URL.createObjectURL(data);

        window.open(fileURL, '_blank');

        this.notificationService.success('✅ PDF abierto correctamente');
      },
      error: (err: any) => {
        console.error(err);
        this.notificationService.error('❌ Error al abrir el PDF. ¿El archivo existe?');
      },
    });
  }

  eliminarChat(id: number) {
    if (confirm('⚠️ ¿Estás seguro de eliminar este documento de la Base de Datos?')) {
      // --- LÓGICA CONECTADA AL BACKEND ---
      this.documentoService.eliminar(id).subscribe({
        next: () => {
          this.notificationService.success(`✅ Documento eliminado correctamente`);
          this.cargarChatsDesdeBD();
        },
        error: (err: any) => {
          console.error(err);
          this.notificationService.error('❌ No se pudo eliminar el documento');
        },
      });
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.chatActual = {};
    this.archivoSeleccionado = null;
  }
}
