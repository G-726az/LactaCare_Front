import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

interface Refrigerador {
  id: number;
  nombre: string;
  ubicacion: string;
  temperatura: number;
  humedad: number;
  estado: 'OK' | 'Alerta' | 'Sin Datos';
  ultimaActualizacion: string;
  alertas: string[];
}

interface Lectura {
  timestamp: Date;
  temperatura: number;
  humedad: number;
}

@Component({
  selector: 'app-monitoreo-lot',
  templateUrl: './monitoreo-lot.component.html',
  styleUrls: ['./monitoreo-lot.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class MonitoreoLotComponent implements OnInit, OnDestroy {
  refrigeradores: Refrigerador[] = [
    { 
      id: 1, 
      nombre: 'Refrigerador Piso 3', 
      ubicacion: 'Área de Lactancia Principal',
      temperatura: 4, 
      humedad: 85, 
      estado: 'OK', 
      ultimaActualizacion: 'hace 1 minuto',
      alertas: []
    },
    { 
      id: 2, 
      nombre: 'Refrigerador Piso 5', 
      ubicacion: 'Sala de Extracciones',
      temperatura: 8, 
      humedad: 88, 
      estado: 'Alerta', 
      ultimaActualizacion: 'hace 3 minutos',
      alertas: ['⚠️ Temperatura alta detectada', '⏰ Revisar configuración']
    },
    { 
      id: 3, 
      nombre: 'Refrigerador Piso 7', 
      ubicacion: 'Área Reservada',
      temperatura: 0, 
      humedad: 0, 
      estado: 'Sin Datos', 
      ultimaActualizacion: 'Sin datos',
      alertas: ['📡 Dispositivo sin conexión']
    },
    { 
      id: 4, 
      nombre: 'Refrigerador Piso 2', 
      ubicacion: 'Sala Principal',
      temperatura: 3, 
      humedad: 82, 
      estado: 'OK', 
      ultimaActualizacion: 'hace 2 minutos',
      alertas: []
    }
  ];

  private intervalId: any;
  historialSeleccionado: Lectura[] = [];
  mostrarHistorial = false;
  refrigeradorActual: Refrigerador | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarMonitoreo();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarDatos(): void {
    const stored = localStorage.getItem('monitoreo_refrigeradores');
    if (stored) {
      try {
        this.refrigeradores = JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar datos de refrigeradores:', error);
      }
    }
  }

  guardarDatos(): void {
    try {
      localStorage.setItem('monitoreo_refrigeradores', JSON.stringify(this.refrigeradores));
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  }

  iniciarMonitoreo(): void {
    // Simular actualizaciones cada 30 segundos
    this.intervalId = setInterval(() => {
      this.simularActualizacion();
    }, 30000);
  }

  private simularActualizacion(): void {
    this.refrigeradores.forEach(refri => {
      if (refri.estado !== 'Sin Datos') {
        // Pequeñas variaciones aleatorias
        const varTemp = (Math.random() - 0.5) * 0.5;
        const varHum = (Math.random() - 0.5) * 2;
        
        refri.temperatura += varTemp;
        refri.humedad += varHum;
        
        // Verificar alertas
        this.verificarAlertas(refri);
        
        refri.ultimaActualizacion = 'hace unos segundos';
      }
    });
    
    this.guardarDatos();
  }

  private verificarAlertas(refri: Refrigerador): void {
    refri.alertas = [];
    
    // Temperatura ideal: 2-4°C
    if (refri.temperatura > 6) {
      refri.estado = 'Alerta';
      refri.alertas.push('⚠️ Temperatura alta detectada');
      this.notificationService.warning(`${refri.nombre}: Temperatura alta (${refri.temperatura.toFixed(1)}°C)`);
    } else if (refri.temperatura < 1) {
      refri.estado = 'Alerta';
      refri.alertas.push('❄️ Temperatura muy baja');
      this.notificationService.warning(`${refri.nombre}: Temperatura muy baja (${refri.temperatura.toFixed(1)}°C)`);
    } else {
      refri.estado = 'OK';
    }

    // Humedad ideal: 80-90%
    if (refri.humedad > 95) {
      refri.alertas.push('💧 Humedad excesiva');
    } else if (refri.humedad < 70) {
      refri.alertas.push('🏜️ Humedad baja');
    }
  }

  verHistorial(refri: Refrigerador): void {
    this.refrigeradorActual = refri;
    this.generarHistorial(refri);
    this.mostrarHistorial = true;
  }

  private generarHistorial(refri: Refrigerador): void {
    // Generar historial simulado de las últimas 24 horas
    this.historialSeleccionado = [];
    const ahora = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(ahora.getTime() - (i * 60 * 60 * 1000));
      const tempBase = refri.estado === 'OK' ? 3.5 : 7;
      const humBase = refri.estado === 'OK' ? 85 : 88;
      
      this.historialSeleccionado.push({
        timestamp,
        temperatura: tempBase + (Math.random() - 0.5) * 2,
        humedad: humBase + (Math.random() - 0.5) * 5
      });
    }
  }

  cerrarHistorial(): void {
    this.mostrarHistorial = false;
    this.refrigeradorActual = null;
  }

  get totalActivos(): number {
    return this.refrigeradores.filter(r => r.estado !== 'Sin Datos').length;
  }

  get totalAlertas(): number {
    return this.refrigeradores.filter(r => r.estado === 'Alerta').length;
  }

  get totalOK(): number {
    return this.refrigeradores.filter(r => r.estado === 'OK').length;
  }

  actualizarManual(): void {
    this.simularActualizacion();
    this.notificationService.success('🔄 Datos actualizados');
  }

  getEstadoClass(estado: string): string {
    return {
      'OK': 'ok',
      'Alerta': 'alert',
      'Sin Datos': 'no-data'
    }[estado] || 'no-data';
  }

  getEstadoBadge(estado: string): string {
    return {
      'OK': '🟢 ÓPTIMO',
      'Alerta': '🔺 ALERTA',
      'Sin Datos': '⚪ SIN DATOS'
    }[estado] || '⚪ DESCONOCIDO';
  }
}