import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-temperatura-report-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './temperatura-report-modal.component.html',
  styleUrls: ['./temperatura-report-modal.component.scss']
})
export class TemperaturaReportModalComponent implements OnInit {
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
      periodo: 'Mensual',
      temperaturaPromedio: '4.2°C',
      totalRefrigeradores: 3,
      refrigeradores: [
        { 
          Id_refrigerador: 1, 
          Id_Lactario: 1, 
          temperaturaActual: '4.0°C', 
          estado: 'Óptimo',
          ultimaActualizacion: new Date()
        },
        { 
          Id_refrigerador: 2, 
          Id_Lactario: 1, 
          temperaturaActual: '4.5°C', 
          estado: 'Óptimo',
          ultimaActualizacion: new Date()
        },
        { 
          Id_refrigerador: 3, 
          Id_Lactario: 2, 
          temperaturaActual: '6.2°C', 
          estado: 'Alerta',
          ultimaActualizacion: new Date()
        }
      ],
      estadisticas: {
        refrigeradoresOptimos: 2,
        refrigeradoresAlerta: 1,
        refrigeradoresCriticos: 0
      }
    };
  }

  getDefaultRefrigeradores() {
    return [
      { 
        Id_refrigerador: 1, 
        Id_Lactario: 1, 
        temperaturaActual: '4.0°C', 
        estado: 'Óptimo',
        ultimaActualizacion: new Date()
      },
      { 
        Id_refrigerador: 2, 
        Id_Lactario: 1, 
        temperaturaActual: '4.5°C', 
        estado: 'Óptimo',
        ultimaActualizacion: new Date()
      }
    ];
  }

  onClose() {
    this.closeModal.emit();
    this.modalService.close();
  }

  exportToPDF() {
    const data = document.getElementById('temperatura-report-content');
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
        pdf.save(`reporte-temperatura-${new Date().toLocaleDateString('es-ES')}.pdf`);
        
        Swal.close();
        Swal.fire({
          title: '¡Reporte Exportado!',
          text: 'El reporte de temperatura ha sido exportado exitosamente como PDF',
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
        const printContents = document.getElementById('temperatura-report-content')?.innerHTML;
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

  getTemperaturaClass(temperatura: string): string {
    const tempNum = this.parseTemperatura(temperatura);
    if (tempNum > 7) return 'temp-critica';
    if (tempNum > 5) return 'temp-alerta';
    return 'temp-optima';
  }

  parseTemperatura(temperatura: string): number {
    return parseFloat(temperatura.replace('°C', ''));
  }

  getRefrigeradoresPorLactario(idLactario: number): number {
    return (this.reportData?.refrigeradores || []).filter((ref: any) => 
      ref.Id_Lactario === idLactario
    ).length;
  }
}