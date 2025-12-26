import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-extracciones-report-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './extracciones-report-modal.component.html',
  styleUrls: ['./extracciones-report-modal.component.scss']
})
export class ExtraccionesReportModalComponent implements OnInit {
  @Input() reportData: any;
  @Output() closeModal = new EventEmitter<void>();

  today = new Date();

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    if (!this.reportData) {
      this.reportData = this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      fecha: this.today.toISOString(),
      medico: 'Dr. Médico',
      periodo: 'Semanal',
      totalExtracciones: 14,
      volumenTotal: 1680,
      promedioDiario: 240,
      extracciones: [
        {
          Id_contenedor: 1,
          Id_paciente: 101,
          Cantidad_contendor: 120,
          Fechaextraccion_contenedor: new Date(),
          Estado_contenedor: 'Almacenado',
          Lactario: 'Central',
          Paciente: 'Ana María López'
        },
        {
          Id_contenedor: 2,
          Id_paciente: 102,
          Cantidad_contendor: 90,
          Fechaextraccion_contenedor: new Date(),
          Estado_contenedor: 'Almacenado',
          Lactario: 'Pediátrico',
          Paciente: 'Carlos Rodríguez'
        },
        {
          Id_contenedor: 3,
          Id_paciente: 103,
          Cantidad_contendor: 150,
          Fechaextraccion_contenedor: new Date(),
          Estado_contenedor: 'Almacenado',
          Lactario: 'Central',
          Paciente: 'María Fernández'
        },
        {
          Id_contenedor: 4,
          Id_paciente: 104,
          Cantidad_contendor: 80,
          Fechaextraccion_contenedor: new Date(),
          Estado_contenedor: 'Consumido',
          Lactario: 'Pediátrico',
          Paciente: 'Juan Pérez'
        }
      ],
      estadisticas: {
        almacenado: 3,
        consumido: 1,
        descartado: 0,
        lactarioCentral: 2,
        lactarioPediatrico: 2
      }
    };
  }

  getDefaultExtracciones() {
    return [
      {
        Id_contenedor: 1,
        Id_paciente: 101,
        Cantidad_contendor: 120,
        Fechaextraccion_contenedor: new Date(),
        Estado_contenedor: 'Almacenado',
        Lactario: 'Central',
        Paciente: 'Ana María López'
      },
      {
        Id_contenedor: 2,
        Id_paciente: 102,
        Cantidad_contendor: 90,
        Fechaextraccion_contenedor: new Date(),
        Estado_contenedor: 'Almacenado',
        Lactario: 'Pediátrico',
        Paciente: 'Carlos Rodríguez'
      }
    ];
  }

  onClose() {
    this.closeModal.emit();
    this.modalService.close();
  }

  exportToPDF() {
    const data = document.getElementById('extracciones-report-content');
    if (data) {
      Swal.fire({
        title: 'Generando PDF...',
        text: 'Por favor espera un momento',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      html2canvas(data).then(canvas => {
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const position = 0;
        
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save(`reporte-extracciones-${new Date().toLocaleDateString('es-ES')}.pdf`);
        
        Swal.close();
        Swal.fire({
          title: '¡Reporte Exportado!',
          text: 'El reporte de extracciones ha sido exportado exitosamente como PDF',
          icon: 'success',
          confirmButtonColor: '#1976d2',
          confirmButtonText: 'Aceptar'
        });
      }).catch(error => {
        Swal.close();
        Swal.fire({
          title: 'Error al exportar',
          text: 'Ocurrió un error al generar el PDF',
          icon: 'error',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Aceptar'
        });
      });
    }
  }

  printReport() {
    Swal.fire({
      title: '¿Imprimir reporte?',
      text: 'Se abrirá el diálogo de impresión',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Imprimir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const printContents = document.getElementById('extracciones-report-content')?.innerHTML;
        if (printContents) {
          const originalContents = document.body.innerHTML;
          document.body.innerHTML = printContents;
          window.print();
          document.body.innerHTML = originalContents;
          window.location.reload();
        }
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}