import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../../../../../environments/environment';

interface Atencion {
  idAtencion?: number;
  idReserva: number;
  idEmpleado: number;
  nombrePaciente: string;
  nombreCubiculo: string;
  totalExtraccion: number;
  fecha: string;
  hora: string;
  contenedoresLeche?: ContenedorLeche[];
}

interface Reserva {
  idReserva: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  primerNombrePaciente: string;
  segundoNombrePaciente?: string;
  primerApellidoPaciente: string;
  segundoApellidoPaciente?: string;
  nombrePaciente: string;
  idPersonaPaciente: number;
  nombreCubiculo: string;
  idCubiculo: number;
  nombreSala: string;
  idSalaLactancia: number;
  estado: string;
}

interface ContenedorLeche {
  numero: number;
  cantidadMililitros: number;
  nombrePaciente: string;
  fechaExtraccion: string;
  fechaCaducidad: string;
}

interface Refrigerador {
  idRefrigerador: number;
  pisoRefrigerador: number;
  filaRefrigerador: number;
  columnaRefrigerador: number;
  capacidadMaxRefri: number;
}

@Component({
  selector: 'app-atenciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './atenciones.html',
  styleUrls: ['./atenciones.css'],
})
export class AtencionesComponent implements OnInit {
  private apiUrl = environment.apiUrl;

  // Datos del médico
  medicoData = {
    Id_empleado: 0,
    nombreCompleto: '',
  };

  // Estados
  loading = false;
  loadingReservas = false;
  loadingRefrigeradores = false;
  mostrarFormulario = false;
  mostrarModalReservas = false;
  mostrarModalRefrigerador = false;
  modoEdicion = false;

  // Listas
  atencionesCargadas: Atencion[] = [];
  atencionesFiltradas: Atencion[] = [];
  searchTerm = '';

  reservasDisponibles: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];
  busquedaReserva = '';

  refrigeradoresDisponibles: Refrigerador[] = [];

  // Formulario
  proximoIdAtencion = 0;
  nombreDoctor = '';
  fechaHoraActual = '';

  reservaSeleccionada: Reserva | null = null;
  cantidadExtraccion: string = '';
  contenedoresTemporales: ContenedorLeche[] = [];

  // Selección de Refrigerador
  refrigeradorSeleccionado: Refrigerador | null = null;
  pisoSeleccionado: number | null = null;
  filaSeleccionada: number | null = null;
  columnaSeleccionada: number | null = null;

  pisosDisponibles: number[] = [];
  filasDisponibles: number[] = [];
  columnasDisponibles: number[] = [];

  // Permisos (configurar según roles)
  roleConfig = {
    permissions: {
      registrarAtenciones: true,
    },
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cargarDatosMedico();
    this.cargarAtenciones();
    this.actualizarFechaHora();
    setInterval(() => this.actualizarFechaHora(), 60000);
  }

  // ============================================================
  // CARGAR DATOS
  // ============================================================

  cargarDatosMedico(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.medicoData.Id_empleado = currentUser.id;
      this.medicoData.nombreCompleto = `${currentUser.primer_nombre || ''} ${
        currentUser.primer_apellido || ''
      }`.trim();
      this.nombreDoctor = `Dr. ${this.medicoData.nombreCompleto}`;
    }
  }

  cargarAtenciones(): void {
    this.loading = true;
    console.log('🔍 Cargando atenciones desde:', `${this.apiUrl}/atenciones`);

    this.http.get<any[]>(`${this.apiUrl}/atenciones`).subscribe({
      next: (atenciones) => {
        console.log('📦 Atenciones recibidas del backend:', atenciones);

        if (!atenciones || atenciones.length === 0) {
          console.warn('⚠️ No se recibieron atenciones');
          this.atencionesCargadas = [];
          this.atencionesFiltradas = [];
          this.loading = false;
          return;
        }

        this.atencionesCargadas = atenciones.map((a) => {
          console.log('📝 Procesando atención:', a);

          // ✅ El backend envía AtencionDTO con datos aplanados
          const nombrePaciente =
            [
              a.primerNombrePaciente,
              a.segundoNombrePaciente,
              a.primerApellidoPaciente,
              a.segundoApellidoPaciente,
            ]
              .filter(Boolean)
              .join(' ') || 'Sin nombre';

          const nombreCubiculo = a.numeroCubiculo ? `Cubículo ${a.numeroCubiculo}` : 'Sin cubículo';

          const totalExtraccion = this.calcularTotalExtraccion(a.contenedoresLeche);

          const atencionMapeada = {
            idAtencion: a.id,
            idReserva: a.idReserva || 0,
            idEmpleado: a.idPerEmpleado || 0,
            nombrePaciente: nombrePaciente,
            nombreCubiculo: nombreCubiculo,
            totalExtraccion: totalExtraccion,
            fecha: this.formatearFechaISO(a.fecha),
            hora: a.hora || '00:00:00',
            contenedoresLeche: a.contenedoresLeche || [],
          };

          console.log('✅ Atención mapeada:', atencionMapeada);
          return atencionMapeada;
        });

        console.log(`✅ Total atenciones cargadas: ${this.atencionesCargadas.length}`);
        this.atencionesFiltradas = [...this.atencionesCargadas];
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando atenciones:', error);
        console.error('   - Status:', error.status);
        console.error('   - Message:', error.message);
        console.error('   - Error body:', error.error);

        this.atencionesCargadas = [];
        this.atencionesFiltradas = [];
        this.loading = false;
        this.notificationService?.error('❌ Error al cargar atenciones');
      },
    });
  }

  cargarReservasDisponibles(): void {
    this.loadingReservas = true;
    console.log('🔍 Cargando reservas desde:', `${this.apiUrl}/reservas`);

    this.http.get<any[]>(`${this.apiUrl}/reservas`).subscribe({
      next: (reservas) => {
        console.log('📦 Reservas recibidas del backend:', reservas);

        if (!reservas || reservas.length === 0) {
          console.warn('⚠️ No se recibieron reservas');
          this.reservasDisponibles = [];
          this.reservasFiltradas = [];
          this.loadingReservas = false;
          return;
        }

        this.reservasDisponibles = reservas
          .filter((r) => {
            // ✅ CORRECCIÓN: Filtrar por estados correctos y usar r.idReserva si viene del DTO
            const idReserva = r.idReserva || r.id; // Soportar ambos formatos
            console.log(`   - Reserva ID ${idReserva}: Estado = ${r.estado}`);

            // ✅ Filtrar solo reservas EN RESERVA o PENDIENTE (estados válidos para crear atención)
            return r.estado === 'EN RESERVA' || r.estado === 'PENDIENTE';
          })
          .map((r) => {
            console.log('📝 Procesando reserva:', r);

            // Determinar el ID correcto
            const idReserva = r.idReserva || r.id;

            // Construir nombre del paciente
            let nombrePaciente = 'Sin nombre';

            // Si viene del DTO
            if (r.primerNombrePaciente) {
              nombrePaciente = [
                r.primerNombrePaciente,
                r.segundoNombrePaciente,
                r.primerApellidoPaciente,
                r.segundoApellidoPaciente,
              ]
                .filter(Boolean)
                .join(' ');
            }
            // Si viene de la entidad
            else if (r.personaPaciente) {
              const paciente = r.personaPaciente;
              nombrePaciente = [
                paciente.primerNombre,
                paciente.segundoNombre,
                paciente.primerApellido,
                paciente.segundoApellido,
              ]
                .filter(Boolean)
                .join(' ');
            }

            const reservaMapeada: Reserva = {
              idReserva: idReserva,
              fecha: this.formatearFechaISO(r.fecha),
              horaInicio: r.horaInicio,
              horaFin: r.horaFin,

              // Paciente - soportar DTO o entidad
              primerNombrePaciente: r.primerNombrePaciente || r.personaPaciente?.primerNombre || '',
              segundoNombrePaciente:
                r.segundoNombrePaciente || r.personaPaciente?.segundoNombre || '',
              primerApellidoPaciente:
                r.primerApellidoPaciente || r.personaPaciente?.primerApellido || '',
              segundoApellidoPaciente:
                r.segundoApellidoPaciente || r.personaPaciente?.segundoApellido || '',
              nombrePaciente: nombrePaciente,
              idPersonaPaciente: r.idPersonaPaciente || r.personaPaciente?.id || 0,

              // Cubículo - soportar DTO o entidad
              nombreCubiculo: r.nombreCubiculo || r.cubiculo?.nombreCb || 'Sin cubículo',
              idCubiculo: r.idCubiculo || r.cubiculo?.id || 0,

              // Sala - soportar DTO o entidad
              nombreSala: r.nombreSala || r.salaLactancia?.nombreCMedico || 'Sin sala',
              idSalaLactancia: r.idSalaLactancia || r.salaLactancia?.idLactario || 0,

              estado: r.estado,
            };

            console.log('✅ Reserva mapeada:', reservaMapeada);
            return reservaMapeada;
          });

        console.log(`✅ Total reservas disponibles: ${this.reservasDisponibles.length}`);
        this.reservasFiltradas = [...this.reservasDisponibles];
        this.loadingReservas = false;
      },
      error: (error) => {
        console.error('❌ Error cargando reservas:', error);
        console.error('   - Status:', error.status);
        console.error('   - Message:', error.message);
        console.error('   - Error body:', error.error);

        this.reservasDisponibles = [];
        this.reservasFiltradas = [];
        this.loadingReservas = false;
        this.notificationService?.error('❌ Error al cargar reservas');
      },
    });
  }

  cargarRefrigeradoresPorSala(idSala: number): void {
    this.loadingRefrigeradores = true;
    this.http.get<any[]>(`${this.apiUrl}/refrigeradores/sala/${idSala}`).subscribe({
      next: (refrigeradores) => {
        this.refrigeradoresDisponibles = refrigeradores.map((r) => ({
          idRefrigerador: r.idRefrigerador,
          pisoRefrigerador: r.pisoRefrigerador,
          filaRefrigerador: r.filaRefrigerador,
          columnaRefrigerador: r.columnaRefrigerador,
          capacidadMaxRefri: r.capacidadMaxRefri,
        }));
        this.loadingRefrigeradores = false;
      },
      error: (error) => {
        console.error('Error cargando refrigeradores:', error);
        this.refrigeradoresDisponibles = [];
        this.loadingRefrigeradores = false;
        this.notificationService?.error('❌ Error al cargar refrigeradores');
      },
    });
  }

  obtenerProximoIdAtencion(): void {
    this.http.get<number>(`${this.apiUrl}/atenciones/proximo-id`).subscribe({
      next: (id) => {
        this.proximoIdAtencion = id;
      },
      error: () => {
        this.proximoIdAtencion = this.atencionesCargadas.length + 1;
      },
    });
  }

  // ============================================================
  // FILTROS Y BÚSQUEDA
  // ============================================================

  filtrarAtenciones(): void {
    if (!this.searchTerm.trim()) {
      this.atencionesFiltradas = [...this.atencionesCargadas];
      return;
    }

    const termino = this.searchTerm.toLowerCase().trim();
    this.atencionesFiltradas = this.atencionesCargadas.filter((a) => {
      return (
        a.idAtencion?.toString().includes(termino) ||
        a.idReserva?.toString().includes(termino) ||
        a.nombrePaciente?.toLowerCase().includes(termino) ||
        a.nombreCubiculo?.toLowerCase().includes(termino) ||
        a.fecha?.includes(termino)
      );
    });
  }

  limpiarFiltro(): void {
    this.searchTerm = '';
    this.filtrarAtenciones();
  }

  filtrarReservas(): void {
    if (!this.busquedaReserva.trim()) {
      this.reservasFiltradas = [...this.reservasDisponibles];
      return;
    }

    const termino = this.busquedaReserva.toLowerCase().trim();
    this.reservasFiltradas = this.reservasDisponibles.filter((r) => {
      return (
        r.fecha?.includes(termino) ||
        r.nombrePaciente?.toLowerCase().includes(termino) ||
        r.nombreCubiculo?.toLowerCase().includes(termino) ||
        r.estado?.toLowerCase().includes(termino)
      );
    });
  }

  // ============================================================
  // FORMULARIO - ABRIR/CERRAR
  // ============================================================

  agregarAtencion(): void {
    this.modoEdicion = false;
    this.mostrarFormulario = true;
    this.resetearFormulario();
    this.obtenerProximoIdAtencion();
  }

  cerrarFormulario(): void {
    if (this.contenedoresTemporales.length > 0) {
      if (
        !confirm(
          '¿Estás seguro de cerrar? Se perderán los contenedores registrados que no se hayan guardado.'
        )
      ) {
        return;
      }
    }
    this.mostrarFormulario = false;
    this.resetearFormulario();
  }

  resetearFormulario(): void {
    this.reservaSeleccionada = null;
    this.cantidadExtraccion = '';
    this.contenedoresTemporales = [];
    this.refrigeradorSeleccionado = null;
    this.pisoSeleccionado = null;
    this.filaSeleccionada = null;
    this.columnaSeleccionada = null;
    this.refrigeradoresDisponibles = [];
    this.actualizarFechaHora();
  }

  actualizarFechaHora(): void {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    this.fechaHoraActual = `${dia}-${mes}-${anio}, ${hora}:${minutos}`;
  }

  // ============================================================
  // MODAL RESERVAS
  // ============================================================

  abrirModalReservas(): void {
    this.mostrarModalReservas = true;
    this.busquedaReserva = '';
    this.cargarReservasDisponibles();
  }

  cancelarSeleccionReserva(): void {
    this.mostrarModalReservas = false;
    this.busquedaReserva = '';
  }

  seleccionarReserva(reserva: Reserva): void {
    this.reservaSeleccionada = reserva;
  }

  cargarReservaSeleccionada(): void {
    if (!this.reservaSeleccionada) {
      this.notificationService?.warning('⚠️ Debe seleccionar una reserva');
      return;
    }

    // Cargar refrigeradores de esta sala
    this.cargarRefrigeradoresPorSala(this.reservaSeleccionada.idSalaLactancia);

    this.mostrarModalReservas = false;
    this.notificationService?.success('✅ Reserva cargada exitosamente');
  }

  obtenerNombrePaciente(reserva: Reserva): string {
    return reserva.nombrePaciente;
  }

  obtenerNombreCubiculo(reserva: Reserva): string {
    return reserva.nombreCubiculo;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: any = {
      ACTIVO: 'badge-success',
      CONFIRMADA: 'badge-info',
      'EN RESERVA': 'badge-warning',
      PENDIENTE: 'badge-info', // ✅ Agregado
      ANULADO: 'badge-danger',
      FINALIZADO: 'badge-default',
      CANCELADA: 'badge-danger', // ✅ Agregado
      Completada: 'badge-success', // ✅ Agregado
    };
    return clases[estado] || 'badge-default';
  }

  // ============================================================
  // CONTENEDORES
  // ============================================================

  agregarContenedor(): void {
    if (!this.reservaSeleccionada) {
      this.notificationService?.error('⚠️ Primero debe seleccionar una reserva');
      return;
    }

    const cantidadStr = this.cantidadExtraccion.trim().replace(',', '.');
    const cantidad = parseFloat(cantidadStr);

    if (!cantidadStr || isNaN(cantidad) || cantidad <= 0) {
      this.notificationService?.error('⚠️ Ingrese una cantidad válida');
      return;
    }

    // Validar máximo 2 decimales
    if (cantidadStr.includes('.')) {
      const decimales = cantidadStr.split('.')[1];
      if (decimales && decimales.length > 2) {
        this.notificationService?.error('⚠️ Máximo 2 decimales permitidos');
        return;
      }
    }

    const ahora = new Date();
    const caducidad = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    const nuevoContenedor: ContenedorLeche = {
      numero: this.contenedoresTemporales.length + 1,
      cantidadMililitros: cantidad,
      nombrePaciente: this.reservaSeleccionada.nombrePaciente,
      fechaExtraccion: ahora.toISOString(),
      fechaCaducidad: caducidad.toISOString(),
    };

    this.contenedoresTemporales.push(nuevoContenedor);
    this.cantidadExtraccion = '';
    this.notificationService?.success('✅ Contenedor agregado');
  }

  eliminarContenedor(index: number): void {
    if (confirm('¿Eliminar este contenedor?')) {
      this.contenedoresTemporales.splice(index, 1);
      // Renumerar
      this.contenedoresTemporales.forEach((c, i) => {
        c.numero = i + 1;
      });
      this.notificationService?.info('🗑️ Contenedor eliminado');
    }
  }

  validarCantidadInput(event: any): void {
    let valor = event.target.value;
    // Reemplazar comas por puntos
    valor = valor.replace(',', '.');
    // Permitir solo números y un punto decimal
    const regex = /^\d*\.?\d{0,2}$/;
    if (!regex.test(valor)) {
      this.cantidadExtraccion = valor.slice(0, -1);
    }
  }

  calcularTotalExtraccion1(): number {
    return this.contenedoresTemporales.reduce((total, c) => total + c.cantidadMililitros, 0);
  }

  // ============================================================
  // MODAL REFRIGERADOR
  // ============================================================

  abrirModalRefrigerador(): void {
    if (this.contenedoresTemporales.length === 0) {
      this.notificationService?.error('⚠️ Primero agregue contenedores');
      return;
    }

    if (this.refrigeradoresDisponibles.length === 0) {
      this.notificationService?.error('⚠️ No hay refrigeradores disponibles para esta sala');
      return;
    }

    this.mostrarModalRefrigerador = true;
  }

  cancelarSeleccionRefrigerador(): void {
    this.mostrarModalRefrigerador = false;
    this.refrigeradorSeleccionado = null;
    this.pisoSeleccionado = null;
    this.filaSeleccionada = null;
    this.columnaSeleccionada = null;
  }

  seleccionarRefrigerador(refrigerador: Refrigerador): void {
    this.refrigeradorSeleccionado = refrigerador;
    this.pisoSeleccionado = null;
    this.filaSeleccionada = null;
    this.columnaSeleccionada = null;

    // Calcular opciones disponibles
    this.pisosDisponibles = Array.from({ length: refrigerador.pisoRefrigerador }, (_, i) => i + 1);
    this.filasDisponibles = Array.from({ length: refrigerador.filaRefrigerador }, (_, i) => i + 1);
    this.columnasDisponibles = Array.from(
      { length: refrigerador.columnaRefrigerador },
      (_, i) => i + 1
    );
  }

  seleccionarPiso(piso: number): void {
    this.pisoSeleccionado = piso;
  }

  seleccionarFila(fila: number): void {
    this.filaSeleccionada = fila;
  }

  seleccionarColumna(columna: number): void {
    this.columnaSeleccionada = columna;
  }

  // ============================================================
  // GUARDAR ATENCIÓN
  // ============================================================

  // atenciones.component.ts - ACTUALIZACIÓN SOLO DE LA FUNCIÓN guardarAtencion()

  async guardarAtencion(): Promise<void> {
    // Validaciones
    if (!this.reservaSeleccionada) {
      this.notificationService?.error('⚠️ Debe seleccionar una reserva');
      return;
    }

    if (this.contenedoresTemporales.length === 0) {
      this.notificationService?.error('⚠️ Debe agregar al menos un contenedor');
      return;
    }

    if (
      !this.refrigeradorSeleccionado ||
      !this.pisoSeleccionado ||
      !this.filaSeleccionada ||
      !this.columnaSeleccionada
    ) {
      this.notificationService?.error('⚠️ Debe seleccionar la ubicación completa del refrigerador');
      return;
    }

    this.loading = true;

    try {
      const ahora = new Date();
      const fecha = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora = ahora.toTimeString().split(' ')[0]; // HH:mm:ss

      // ✅ CORRECCIÓN: Asegurar que idPersonaEmpleado sea Long (number en TS)
      const idEmpleado = Number(this.medicoData.Id_empleado);

      // 1. Crear atención con el formato correcto
      const atencionData = {
        fecha: fecha,
        hora: hora,
        idReserva: this.reservaSeleccionada.idReserva,
        idPersonaEmpleado: idEmpleado, // ✅ Asegurar que sea número
        contenedoresLeche: this.contenedoresTemporales.map((c) => ({
          cantidadMililitros: c.cantidadMililitros,
          fechaHoraExtraccion: c.fechaExtraccion,
          fechaHoraCaducidad: c.fechaCaducidad,
          estado: 'ALMACENADO',
        })),
      };

      console.log('📤 Enviando atención:', atencionData);
      console.log('   - Tipo de idPersonaEmpleado:', typeof atencionData.idPersonaEmpleado);
      console.log('   - Valor de idPersonaEmpleado:', atencionData.idPersonaEmpleado);

      const atencionResponse = await this.http
        .post<any>(`${this.apiUrl}/atenciones`, atencionData)
        .toPromise();

      console.log('✅ Respuesta de atención:', atencionResponse);

      if (!atencionResponse || !atencionResponse.success) {
        throw new Error(atencionResponse?.message || 'Error al crear atención');
      }

      const atencionCreada = atencionResponse.data;
      const contenedoresCreados = atencionCreada.contenedoresLeche || [];

      console.log(`📦 Contenedores creados: ${contenedoresCreados.length}`);

      // 2. Crear ubicaciones para cada contenedor
      for (const contenedor of contenedoresCreados) {
        const ubicacionData = {
          idContenedor: contenedor.id,
          idRefrigerador: this.refrigeradorSeleccionado!.idRefrigerador,
          pisoRefrigerador: this.pisoSeleccionado,
          filaRefrigerador: this.filaSeleccionada,
          columnaRefrigerador: this.columnaSeleccionada,
        };

        console.log('📍 Guardando ubicación:', ubicacionData);

        await this.http.post(`${this.apiUrl}/ubicacion-contenedor`, ubicacionData).toPromise();
      }

      console.log('✅ Ubicaciones guardadas exitosamente');

      // 3. Actualizar estado de reserva a FINALIZADO
      console.log(`🔄 Actualizando reserva ${this.reservaSeleccionada.idReserva} a FINALIZADO`);

      await this.http
        .patch(
          `${this.apiUrl}/reservas/${this.reservaSeleccionada.idReserva}/estado?nuevoEstado=FINALIZADO`,
          {}
        )
        .toPromise();

      console.log('✅ Estado de reserva actualizado');

      this.loading = false;
      this.notificationService?.success('✅ Atención guardada exitosamente');
      this.cerrarModalRefrigerador();
      this.cerrarFormulario();
      this.cargarAtenciones();
    } catch (error: any) {
      console.error('❌ Error guardando atención:', error);
      console.error('   - Status:', error.status);
      console.error('   - Error body:', error.error);
      console.error('   - Message:', error.message);

      this.loading = false;

      let mensaje = 'Error al guardar la atención';

      if (error.error?.message) {
        mensaje = error.error.message;
      } else if (error.message) {
        mensaje = error.message;
      } else if (error.status === 0) {
        mensaje = 'No se pudo conectar con el servidor';
      } else if (error.status === 400) {
        mensaje = 'Datos inválidos. Verifica la información ingresada';
      } else if (error.status === 500) {
        mensaje = 'Error interno del servidor';
      }

      this.notificationService?.error('❌ ' + mensaje);
    }
  }

  cerrarModalRefrigerador(): void {
    this.mostrarModalRefrigerador = false;
  }

  // ============================================================
  // ACCIONES
  // ============================================================

  verDetalle(atencion: Atencion): void {
    console.log('Ver detalle:', atencion);
    // Implementar modal de detalle si es necesario
  }

  editarAtencion(atencion: Atencion): void {
    console.log('Editar atención:', atencion);
    // Implementar edición si es necesario
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  construirNombrePaciente(persona: any): string {
    if (!persona) return 'Sin nombre';

    const nombre = [
      persona.primerNombre,
      persona.segundoNombre,
      persona.primerApellido,
      persona.segundoApellido,
    ]
      .filter(Boolean)
      .join(' ');

    return nombre || 'Sin nombre';
  }

  calcularTotalExtraccion(contenedores: any[]): number {
    if (!contenedores || contenedores.length === 0) {
      return 0;
    }

    const total = contenedores.reduce((sum, c) => {
      const cantidad = Number(c.cantidadMililitros) || 0;
      return sum + cantidad;
    }, 0);

    console.log(
      `📊 Total extracción calculado: ${total} ml de ${contenedores.length} contenedores`
    );
    return total;
  }

  formatearFechaISO(fecha: any): string {
    if (!fecha) {
      console.warn('⚠️ Fecha vacía recibida');
      return '';
    }

    // Caso 1: Array de Java LocalDate [year, month, day]
    if (Array.isArray(fecha)) {
      const [year, month, day] = fecha;
      const fechaFormateada = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
        2,
        '0'
      )}`;
      console.log(`📅 Fecha array convertida: ${fecha} → ${fechaFormateada}`);
      return fechaFormateada;
    }

    // Caso 2: String ISO con o sin hora
    if (typeof fecha === 'string') {
      const fechaSinHora = fecha.split('T')[0];
      console.log(`📅 Fecha string procesada: ${fecha} → ${fechaSinHora}`);
      return fechaSinHora;
    }

    console.warn('⚠️ Formato de fecha no reconocido:', fecha);
    return '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year}`;
  }

  formatearHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5); // "14:30:00" → "14:30"
  }
  formatearFechaHora(fechaISO: string): string {
    if (!fechaISO) return '';

    try {
      const fecha = new Date(fechaISO);

      if (isNaN(fecha.getTime())) {
        console.warn('⚠️ Fecha inválida:', fechaISO);
        return fechaISO; // Devolver el original si no se puede parsear
      }

      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      const hora = String(fecha.getHours()).padStart(2, '0');
      const minutos = String(fecha.getMinutes()).padStart(2, '0');
      const segundos = String(fecha.getSeconds()).padStart(2, '0');

      return `${dia}-${mes}-${anio} ${hora}:${minutos}:${segundos}`;
    } catch (error) {
      console.error('❌ Error al formatear fecha:', error);
      return fechaISO;
    }
  }
}
