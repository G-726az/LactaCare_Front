import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-lactarios-report-modal',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './lactarios-report-modal.component.html',
  styleUrls: ['./lactarios-report-modal.component.scss']
})
export class LactariosReportModalComponent implements OnInit {
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
      tipoReporte: 'detallado',
      periodo: 'General',
      medico: 'Dr. Médico',
      totalLactarios: 2,
      totalRefrigeradores: 3,
      capacidadTotal: 140,
      lactarios: [
        {
          Id_Lactario: 1,
          Nombre_CMedico: 'Lactario Central',
          Direccion_CMedico: 'Av. Amazonas N23-45',
          Telefono_CMedico: '022222222',
          refrigeradores: 2,
          capacidadTotal: 100,
          temperaturaPromedio: '4.2°C',
          estado: 'Óptimo'
        },
        {
          Id_Lactario: 2,
          Nombre_CMedico: 'Lactario Pediátrico',
          Direccion_CMedico: 'Av. Patria N45-67',
          Telefono_CMedico: '023333333',
          refrigeradores: 1,
          capacidadTotal: 40,
          temperaturaPromedio: '6.2°C',
          estado: 'Revisión'
        }
      ],
      includeRefrigeradores: true,
      includeEstadisticas: true,
      estadisticas: {
        temperaturaPromedioSistema: '4.2°C',
        alertasActivas: 1,
        extraccionesHoy: 2,
        refrigeradoresOptimos: 2,
        refrigeradoresAlerta: 1,
        refrigeradoresCriticos: 0
      }
    };
  }

  getDefaultLactarios() {
    return [
      {
        Id_Lactario: 1,
        Nombre_CMedico: 'Lactario Central',
        Direccion_CMedico: 'Av. Amazonas N23-45',
        Telefono_CMedico: '022222222',
        refrigeradores: 2,
        capacidadTotal: 100,
        temperaturaPromedio: '4.2°C',
        estado: 'Óptimo'
      },
      {
        Id_Lactario: 2,
        Nombre_CMedico: 'Lactario Pediátrico',
        Direccion_CMedico: 'Av. Patria N45-67',
        Telefono_CMedico: '023333333',
        refrigeradores: 1,
        capacidadTotal: 40,
        temperaturaPromedio: '6.2°C',
        estado: 'Revisión'
      }
    ];
  }

  // Método para obtener el texto del tipo de reporte
  getReportTypeText(): string {
    if (!this.reportData?.tipoReporte) {
      return 'Reporte General';
    }
    
    switch(this.reportData.tipoReporte) {
      case 'detallado':
        return 'Reporte Detallado';
      case 'resumen':
        return 'Reporte Resumen';
      case 'general':
        return 'Reporte General';
      default:
        return 'Reporte de Lactarios';
    }
  }

  onClose() {
    this.closeModal.emit();
    this.modalService.close();
  }

  exportToPDF() {
    const data = document.getElementById('lactarios-report-content');
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
        pdf.save(`reporte-lactarios-${new Date().toLocaleDateString('es-ES')}.pdf`);
        
        Swal.close();
        Swal.fire({
          title: '¡Reporte Exportado!',
          text: 'El reporte de lactarios ha sido exportado exitosamente como PDF',
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
        const printContents = document.getElementById('lactarios-report-content')?.innerHTML;
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

  getEstadoClass(estado: string): string {
    switch(estado.toLowerCase()) {
      case 'óptimo':
      case 'activo':
        return 'estado-optimo';
      case 'revisión':
      case 'alerta':
        return 'estado-alerta';
      case 'crítico':
      case 'inactivo':
        return 'estado-critico';
      default:
        return '';
    }
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

  getTipoReporteTexto(tipoReporte: string): string {
    switch(tipoReporte) {
      case 'detallado':
        return 'Reporte Detallado';
      case 'resumen':
        return 'Reporte Resumen';
      default:
        return 'Reporte General';
    }
  }

  // Método para obtener el período del reporte (hoy, semanal, mensual)
  getPeriodoReporte(): string {
    if (this.reportData?.periodo) {
      return this.reportData.periodo;
    }
    
    // Si no hay período específico, determinar basado en la fecha
    const fechaReporte = this.reportData?.fecha ? new Date(this.reportData.fecha) : this.today;
    const diffDias = Math.floor((this.today.getTime() - fechaReporte.getTime()) / (1000 * 3600 * 24));
    
    if (diffDias === 0) return 'Hoy';
    if (diffDias <= 7) return 'Semanal';
    if (diffDias <= 30) return 'Mensual';
    
    return 'General';
  }

  // Método para obtener estadísticas según el período
  getEstadisticasPeriodo(): any {
    const periodo = this.getPeriodoReporte();
    const estadisticasBase = this.reportData?.estadisticas || {};
    
    switch(periodo) {
      case 'Hoy':
        return {
          ...estadisticasBase,
          extracciones: estadisticasBase.extraccionesHoy || 0,
          alertas: estadisticasBase.alertasActivas || 0,
          refrigeradoresActivos: estadisticasBase.refrigeradoresOptimos || 0
        };
      case 'Semanal':
        return {
          ...estadisticasBase,
          extracciones: (estadisticasBase.extraccionesHoy || 0) * 7,
          alertas: Math.max(1, (estadisticasBase.alertasActivas || 0) * 3),
          refrigeradoresActivos: estadisticasBase.refrigeradoresOptimos || 0
        };
      case 'Mensual':
        return {
          ...estadisticasBase,
          extracciones: (estadisticasBase.extraccionesHoy || 0) * 30,
          alertas: Math.max(2, (estadisticasBase.alertasActivas || 0) * 8),
          refrigeradoresActivos: estadisticasBase.refrigeradoresOptimos || 0
        };
      default:
        return estadisticasBase;
    }
  }

  // Método para obtener datos de refrigeradores por lactario
  getRefrigeradoresPorLactario(idLactario: number): any[] {
    // En una implementación real, esto vendría del servicio
    const refrigeradoresMock = [
      { Id_refrigerador: 1, Id_Lactario: 1, temperatura: '4.0°C', estado: 'Óptimo', capacidad: 50 },
      { Id_refrigerador: 2, Id_Lactario: 1, temperatura: '4.5°C', estado: 'Óptimo', capacidad: 50 },
      { Id_refrigerador: 3, Id_Lactario: 2, temperatura: '6.2°C', estado: 'Alerta', capacidad: 40 }
    ];
    
    return refrigeradoresMock.filter(ref => ref.Id_Lactario === idLactario);
  }

  // Método para obtener capacidad utilizada por lactario
  getCapacidadUtilizada(idLactario: number): number {
    const refrigeradores = this.getRefrigeradoresPorLactario(idLactario);
    const capacidadTotal = refrigeradores.reduce((sum, ref) => sum + ref.capacidad, 0);
    
    // Simular capacidad utilizada (75% por defecto)
    return Math.floor(capacidadTotal * 0.75);
  }

  // Método para obtener porcentaje de uso
  getPorcentajeUso(idLactario: number): number {
    const refrigeradores = this.getRefrigeradoresPorLactario(idLactario);
    if (refrigeradores.length === 0) return 0;
    
    const capacidadTotal = refrigeradores.reduce((sum, ref) => sum + ref.capacidad, 0);
    const capacidadUtilizada = this.getCapacidadUtilizada(idLactario);
    
    return Math.round((capacidadUtilizada / capacidadTotal) * 100);
  }

  // Método para verificar si hay datos de refrigeradores
  tieneDatosRefrigeradores(): boolean {
    return this.reportData?.includeRefrigeradores && 
           this.reportData?.lactarios?.some((l: any) => l.refrigeradores > 0);
  }

  // Método para verificar si hay datos estadísticos
  tieneEstadisticas(): boolean {
    return this.reportData?.includeEstadisticas && this.reportData?.estadisticas;
  }

  // Método para obtener el título del reporte
  getTituloReporte(): string {
    const periodo = this.getPeriodoReporte();
    const tipo = this.getTipoReporteTexto(this.reportData?.tipoReporte || 'detallado');
    
    return `Reporte de Lactarios - ${periodo} - ${tipo}`;
  }

  // Método para obtener la fecha formateada del reporte
  getFechaReporteFormateada(): string {
    const fecha = this.reportData?.fecha ? new Date(this.reportData.fecha) : this.today;
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Método para obtener datos de lactarios filtrados por período
  getLactariosFiltrados(): any[] {
    const lactarios = this.reportData?.lactarios || this.getDefaultLactarios();
    const periodo = this.getPeriodoReporte();
    
    // En una implementación real, esto filtraría datos históricos
    // Por ahora, devolvemos todos los lactarios
    return lactarios.map((lactario: any) => ({
      ...lactario,
      refrigeradoresActivos: this.getRefrigeradoresPorLactario(lactario.Id_Lactario).length,
      capacidadUtilizada: this.getCapacidadUtilizada(lactario.Id_Lactario),
      porcentajeUso: this.getPorcentajeUso(lactario.Id_Lactario),
      ultimaExtraccion: this.today.toISOString(),
      extraccionesPeriodo: this.getExtraccionesPorLactario(lactario.Id_Lactario, periodo)
    }));
  }

  // Método para obtener extracciones por lactario según período
  getExtraccionesPorLactario(idLactario: number, periodo: string): number {
    const estadisticas = this.getEstadisticasPeriodo();
    const totalExtracciones = estadisticas.extracciones || 0;
    const totalLactarios = this.reportData?.totalLactarios || 2;
    
    // Distribuir proporcionalmente entre lactarios
    return Math.round(totalExtracciones / totalLactarios);
  }
}