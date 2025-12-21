import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ModalService } from '../../../../core/services/modal.service';
import { DialogService } from '../../../../core/services/dialog.service';

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

  constructor(
    private modalService: ModalService,
    private dialogService: DialogService
  ) {}

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
      html2canvas(data).then(canvas => {
        const imgWidth = 208;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const position = 0;
        
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save(`reporte-medico-${new Date().toLocaleDateString('es-ES')}.pdf`);
        
        // Usar el nuevo diálogo en lugar de alert()
        this.dialogService.success('✅ Reporte exportado exitosamente', 'Exportación Completada');
      });
    }
  }

  printReport() {
    const printContents = document.getElementById('report-content')?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  }
}