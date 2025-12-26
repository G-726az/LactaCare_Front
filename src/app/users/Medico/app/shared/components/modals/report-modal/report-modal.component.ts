import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss']
})
export class ReportModalComponent implements OnInit {
  @Input() reportData: any;
  @Output() closeModal = new EventEmitter<void>();

  today = new Date();

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    if (!this.reportData) {
      this.reportData = {
        fecha: this.today.toISOString(),
        medico: 'Dr. Médico',
        lactariosActivos: 2,
        refrigeradores: 3,
        temperaturaPromedio: '4.5°C',
        alertasActivas: 1
      };
    }
  }

  onClose() {
    this.closeModal.emit();
    this.modalService.close();
  }

  exportToPDF() {
    const data = document.getElementById('report-content');
    if (data) {
      // Mostrar mensaje de carga
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
        pdf.save(`reporte-medico-${new Date().toLocaleDateString('es-ES')}.pdf`);
        
        // Cerrar mensaje de carga y mostrar éxito
        Swal.close();
        Swal.fire({
          title: '¡Reporte Exportado!',
          text: 'El reporte ha sido exportado exitosamente como PDF',
          icon: 'success',
          confirmButtonColor: '#1976d2',
          confirmButtonText: 'Aceptar'
        });
      }).catch(error => {
        // Mostrar error
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
        const printContents = document.getElementById('report-content')?.innerHTML;
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
}