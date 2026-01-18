import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../app/services/notification.service';
import {
  DiasLaborablesEmpleado,
  HorariosEmpleado,
  PersonaEmpleado,
  Roles,
  SalaLactancia,
} from '../../../../../../models/database.models';
import { EmpleadoService } from '../../../../app/services/empleado.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../app/services/auth.service';
import { AuthService as MaxAuthService } from '../../../../../../services/auth.service';
import { HorarioEmpleadoService } from '../../../../app/services/horario-empleado.service';
import { DiasLarolablesEmpleadoService } from '../../../../app/services/dias-laborables-empleado.service';
import { SalaLactanciaService } from '../../../../app/services/sala-lactancia.service';
import { RolService } from '../../../../app/services/rol.service';
import { catchError, forkJoin, Observable, switchMap, tap, throwError } from 'rxjs';

export class EmpleadoPayload {
  primerNombre!: string;
  segundoNombre?: string;
  primerApellido!: string;
  segundoApellido?: string;
  perfilEmpleadoImg?: string;
  telefono?: string;
  cedula!: string;
  correo!: string;
  fechaNacimiento!: string;
  rol!: string;
  salaLactanciaId!: number;
  diasLaborablesEmpleadoId!: number;
  horarioEmpleadoId!: number;
  estado!: string;
}

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {
  empleados: PersonaEmpleado[] = [];
  empleadosFiltrados: PersonaEmpleado[] = [];
  busqueda = '';
  rolFiltro = 0;
  mostrarModal = false;
  modoEdicion = false;
  loading = true;
  empleadoActual: Partial<PersonaEmpleado> = {};
  horarioActual: Partial<HorariosEmpleado> = {};
  diasLaborablesActual: Partial<DiasLaborablesEmpleado> = {};
  salasLactancia: SalaLactancia[] = [];
  todosRoles: Roles[] = [];
  idUser = 0;

  // Variables de limites fecha nacimiento
  maxFechaNacimiento!: string;
  minFechaNacimiento!: string;

  constructor(
    private notificationService: NotificationService,
    private empleadoService: EmpleadoService,
    private horarioEmpleadoService: HorarioEmpleadoService,
    private diasLaborablesEmpleadoService: DiasLarolablesEmpleadoService,
    private salaLactanciaService: SalaLactanciaService,
    private rolService: RolService,
    private authService: AuthService,
    private maxAuthService: MaxAuthService
  ) {}

  ngOnInit() {
    this.cargarIdUser();
    this.cargarEmpleados();
    this.cargarSalasLactancia();
    this.cargarRoles();
    this.setLimitsFechaNacimiento();
  }

  cargarIdUser() {
    const user = this.maxAuthService.currentUserValue;
    this.idUser = user.id;
  }

  // ============================================ CARDS ==================================================

  cargarEmpleados() {
    this.empleadoService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.filtrarEmpleados();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error empleados', err);
        this.loading = false;
      },
    });
  }

  getNombreCompleto(item: PersonaEmpleado): string {
    if (!item) return '';
    const partes = [
      item.primerNombre,
      item.segundoNombre,
      item.primerApellido,
      item.segundoApellido,
    ].filter(Boolean);
    return partes.join(' ');
  }

  getSalaLactanciaNombre(idSala: number): string {
    const sala = this.salasLactancia.find((s) => s.idLactario === idSala);
    return sala ? sala.nombreCMedico : 'Desconocida';
  }

  // ✅ NUEVO: Obtener días laborables en formato texto
  obtenerDiasLaborables(empleado: PersonaEmpleado): string {
    if (!empleado.diasLaborablesEmpleado) return 'No especificado';

    const dias = empleado.diasLaborablesEmpleado;
    const diasSeleccionados = [];

    if (dias.diaLunes) diasSeleccionados.push('Lun');
    if (dias.diaMartes) diasSeleccionados.push('Mar');
    if (dias.diaMiercoles) diasSeleccionados.push('Mié');
    if (dias.diaJueves) diasSeleccionados.push('Jue');
    if (dias.diaViernes) diasSeleccionados.push('Vie');
    if (dias.diaSabado) diasSeleccionados.push('Sáb');
    if (dias.diaDomingo) diasSeleccionados.push('Dom');

    return diasSeleccionados.length > 0 ? diasSeleccionados.join(', ') : 'No especificado';
  }

  // ✅ NUEVO: Obtener horario en formato texto
  obtenerHorario(empleado: PersonaEmpleado): string {
    if (!empleado.horarioEmpleado) return 'No definido';

    const horario = empleado.horarioEmpleado;
    let resultado = `${horario.horaInicioJornada} - ${horario.horaFinJornada}`;

    if (horario.horaInicioDescanso && horario.horaFinDescanso) {
      resultado += ` (Descanso: ${horario.horaInicioDescanso} - ${horario.horaFinDescanso})`;
    }

    return resultado;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  filtrarEmpleados() {
    this.empleadosFiltrados = this.empleados.filter((emp) => {
      const nombreCompleto = [
        emp.primerNombre,
        emp.segundoNombre,
        emp.primerApellido,
        emp.segundoApellido,
      ]
        .filter(Boolean)
        .join(' ');

      const textoBusqueda = this.normalizarTexto(this.busqueda);

      const coincideBusqueda =
        this.normalizarTexto(nombreCompleto).includes(textoBusqueda) ||
        this.normalizarTexto(emp.correo).includes(textoBusqueda);

      const coincideRol =
        this.rolFiltro === 0 || (emp.rol && Number(emp.rol.idRol) === Number(this.rolFiltro));

      return coincideBusqueda && coincideRol;
    });
  }

  // ✅ MEJORADO: Ver detalles con horario y días laborables
  verDetalles(empleado: PersonaEmpleado) {
    const horario = this.obtenerHorario(empleado);
    const dias = this.obtenerDiasLaborables(empleado);

    Swal.fire({
      title: this.getNombreCompleto(empleado),
      html: `
        <div style="text-align: left;">
          <p><strong>🏷️ Rol:</strong> ${empleado.rol.nombreRol}</p>
          <p><strong>🪪 Cédula:</strong> ${empleado.cedula}</p>
          <p><strong>📧 Correo:</strong> ${empleado.correo}</p>
          <p><strong>📞 Teléfono:</strong> ${empleado.telefono || 'No especificado'}</p>
          <p><strong>🏥 Sala:</strong> ${this.getSalaLactanciaNombre(empleado.salaLactanciaId)}</p>
          <p><strong>⏰ Horario:</strong> ${horario}</p>
          <p><strong>📅 Días:</strong> ${dias}</p>
          <p><strong>📊 Estado:</strong> <span style="color: ${
            empleado.estado === 'ACTIVO' ? '#759932' : '#ADB5BD'
          };">${empleado.estado}</span></p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#759932',
    });
  }

  getRolColor(rol: string): string {
    const colores: { [key: string]: string } = {
      MEDICO: '#00fdfd',
      ADMINISTRADOR: '#00fa2a',
    };
    return colores[rol] || '#9A9595';
  }

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      ACTIVO: '#a7ff04',
      INACTIVO: '#f15a02',
    };
    return colores[estado] || '#9A9595';
  }

  changeEstado(id: number) {
    if (id === this.idUser) {
      this.notificationService.info('Usted no puede cambiar su estado');
      return;
    }
    this.empleadoService.switchEstado(id).subscribe({
      next: () => {
        this.notificationService.success('Se cambió el estado');
        this.cargarEmpleados();
      },
      error: (err) => {
        this.notificationService.error(`No se pudo cambiar el estado ${err}`);
        console.log('Error cambio estado: ', err);
        this.cargarEmpleados();
      },
    });
  }

  // ============================================== FORM =================================================

  setLimitsFechaNacimiento() {
    const hoy = new Date();

    const maxDate = new Date(hoy);
    maxDate.setFullYear(maxDate.getFullYear() - 18);
    this.maxFechaNacimiento = maxDate.toISOString().split('T')[0];

    const minDate = new Date(hoy);
    minDate.setFullYear(hoy.getFullYear() - 68);
    this.minFechaNacimiento = minDate.toISOString().split('T')[0];
  }

  cargarSalasLactancia() {
    this.salaLactanciaService.getAll().subscribe({
      next: (salas: any) => {
        this.salasLactancia = salas;
      },
      error: (err) => {
        console.error('Error salas', err);
      },
    });
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe({
      next: (roles: Roles[]) => {
        this.todosRoles = roles;
      },
      error: (err) => {
        console.error('Error roles', err);
      },
    });
  }

  getDiasLaborables(idDias: number) {
    this.diasLaborablesEmpleadoService.getDiasLaborables(idDias).subscribe({
      next: (dias: DiasLaborablesEmpleado) => {
        this.diasLaborablesActual = dias;
      },
      error: (err) => {
        console.error('Error dias laborables', err);
      },
    });
  }

  getHorario(idHorario: number) {
    this.horarioEmpleadoService.getHorario(idHorario).subscribe({
      next: (horario: HorariosEmpleado) => {
        this.horarioActual = horario;
      },
      error: (err) => {
        console.error('Error horarios', err);
      },
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.empleadoActual = {};
  }

  abrirModalEmpleado() {
    this.modoEdicion = false;
    this.empleadoActual = {
      idPerEmpleado: 0,
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      cedula: '',
      correo: '',
      fechaNacimiento: '',
      perfilEmpleadoImg: '',
      rol: { idRol: 0, nombreRol: '' },
      telefono: '',
      salaLactanciaId: 0,
      diasLaborablesEmpleadoId: 0,
      horarioEmpleadoId: 0,
      estado: 'ACTIVO',
    };
    this.horarioActual = {};
    this.diasLaborablesActual = {};
    this.mostrarModal = true;
  }

  crearHorario(): Observable<any> {
    if (!this.horarioActual.horaInicioJornada || !this.horarioActual.horaFinJornada) {
      this.notificationService.error(
        '⚠️ Debe llenar los campos solicitados (Hora de inicio y fin de jornada)'
      );
      return throwError(() => new Error('Campos de horario requeridos vacíos'));
    }

    if (
      (this.horarioActual.horaInicioDescanso && !this.horarioActual.horaFinDescanso) ||
      (!this.horarioActual.horaInicioDescanso && this.horarioActual.horaFinDescanso)
    ) {
      this.notificationService.error('⚠️ No puede llenar solo un horario de descanso');
      return throwError(() => new Error('Horario de descanso incompleto'));
    }

    const horarioNuevo: Partial<HorariosEmpleado> = {
      horaInicioJornada: this.horarioActual.horaInicioJornada,
      horaFinJornada: this.horarioActual.horaFinJornada,
      horaInicioDescanso: this.horarioActual.horaInicioDescanso,
      horaFinDescanso: this.horarioActual.horaFinDescanso,
    };

    return this.horarioEmpleadoService.create(horarioNuevo).pipe(
      tap((horario) => {
        this.empleadoActual.horarioEmpleadoId = horario.idHorarioEmpleado;
      }),
      catchError((err) => {
        if (err.status === 400) {
          return throwError(() => new Error('Horario inválido'));
        }
        return throwError(() => new Error('Error al crear el horario'));
      })
    );
  }

  crearDiasLaborables(): Observable<any> {
    const diasNuevos: Partial<DiasLaborablesEmpleado> = {
      diaLunes: this.diasLaborablesActual.diaLunes,
      diaMartes: this.diasLaborablesActual.diaMartes,
      diaMiercoles: this.diasLaborablesActual.diaMiercoles,
      diaJueves: this.diasLaborablesActual.diaJueves,
      diaViernes: this.diasLaborablesActual.diaViernes,
      diaSabado: this.diasLaborablesActual.diaSabado,
      diaDomingo: this.diasLaborablesActual.diaDomingo,
    };

    return this.diasLaborablesEmpleadoService.create(diasNuevos).pipe(
      tap((dias) => {
        this.empleadoActual.diasLaborablesEmpleadoId = dias.idDiaLaborableEmpleado;
      }),
      catchError((err) => {
        if (err.status === 400) {
          return throwError(() => new Error('Días laborables inválidos'));
        }
        return throwError(() => new Error('Error al crear los días laborables'));
      })
    );
  }

  editarEmpleado(item: PersonaEmpleado) {
    if (item.idPerEmpleado === this.idUser) {
      this.notificationService.info('Para editar sus datos, diríjase a la opción de configuración');
      return;
    }
    this.modoEdicion = true;
    this.empleadoActual = { ...item };
    this.getDiasLaborables(item.diasLaborablesEmpleadoId);
    this.getHorario(item.horarioEmpleadoId);
    this.mostrarModal = true;
  }

  editDiasLaborables(): Observable<any> {
    const diasActualizado = {
      diaLunes: this.diasLaborablesActual.diaLunes,
      diaMartes: this.diasLaborablesActual.diaMartes,
      diaMiercoles: this.diasLaborablesActual.diaMiercoles,
      diaJueves: this.diasLaborablesActual.diaJueves,
      diaViernes: this.diasLaborablesActual.diaViernes,
      diaSabado: this.diasLaborablesActual.diaSabado,
      diaDomingo: this.diasLaborablesActual.diaDomingo,
    };

    return this.diasLaborablesEmpleadoService
      .editDias(this.empleadoActual.diasLaborablesEmpleadoId!, diasActualizado)
      .pipe(
        catchError((err) => {
          if (err.status === 400) {
            return throwError(() => new Error('Datos de días laborables inválidos'));
          } else if (err.status === 404) {
            return throwError(() => new Error('Días laborables no encontrado'));
          }
          return throwError(() => new Error('Error al actualizar los días laborables'));
        })
      );
  }

  editHorario(): Observable<any> {
    if (!this.horarioActual.horaInicioJornada || !this.horarioActual.horaFinJornada) {
      this.notificationService.error(
        '⚠️ Debe llenar los campos solicitados (Hora de inicio y fin de jornada)'
      );
      return throwError(() => new Error('Campos requeridos vacíos'));
    }

    if (
      (this.horarioActual.horaInicioDescanso && !this.horarioActual.horaFinDescanso) ||
      (!this.horarioActual.horaInicioDescanso && this.horarioActual.horaFinDescanso)
    ) {
      this.notificationService.error('⚠️ No puede llenar solo un horario de descanso');
      return throwError(() => new Error('Horario de descanso incompleto'));
    }

    const horarioActualizado = {
      horaInicioJornada: this.horarioActual.horaInicioJornada,
      horaFinJornada: this.horarioActual.horaFinJornada,
      horaInicioDescanso: this.horarioActual.horaInicioDescanso,
      horaFinDescanso: this.horarioActual.horaFinDescanso,
    };

    return this.horarioEmpleadoService
      .editHorario(this.empleadoActual.horarioEmpleadoId!, horarioActualizado)
      .pipe(
        catchError((err) => {
          if (err.status === 400) {
            return throwError(() => new Error('Datos de horario inválidos'));
          } else if (err.status === 404) {
            return throwError(() => new Error('Horario no encontrado'));
          }
          return throwError(() => new Error('Error al actualizar el horario'));
        })
      );
  }

  guardarEmpleado() {
    if (
      !this.empleadoActual.primerNombre?.trim() ||
      !this.empleadoActual.primerApellido?.trim() ||
      !this.empleadoActual.cedula?.trim() ||
      !this.empleadoActual.correo?.trim()
    ) {
      this.notificationService.warning(
        'Por favor completa los campos solicitados (nombre, apellido, cedula, correo)'
      );
      return;
    }

    if (!this.empleadoActual.salaLactanciaId || this.empleadoActual.salaLactanciaId === 0) {
      this.notificationService.error('Sala de lactancia no cargada correctamente');
      return;
    }

    if (!this.empleadoActual.rol || this.empleadoActual.rol.idRol === 0) {
      this.notificationService.error('Rol no seleccionado');
      return;
    }

    let payload: Partial<any> = {
      primerNombre: this.empleadoActual.primerNombre,
      segundoNombre: this.empleadoActual.segundoNombre,
      primerApellido: this.empleadoActual.primerApellido,
      segundoApellido: this.empleadoActual.segundoApellido,
      perfilEmpleadoImg: this.empleadoActual.perfilEmpleadoImg,
      telefono: this.empleadoActual.telefono,
      cedula: this.empleadoActual.cedula,
      correo: this.empleadoActual.correo,
      fechaNacimiento: this.empleadoActual.fechaNacimiento,
      rol: this.empleadoActual.rol!.idRol === 1 ? 'ADMINISTRADOR' : 'MEDICO',
      salaLactanciaId: this.empleadoActual.salaLactanciaId,
      estado: this.empleadoActual.estado,
    };

    if (this.modoEdicion) {
      if (!this.empleadoActual.diasLaborablesEmpleadoId) {
        this.notificationService.error('Dias laborables no cargados correctamente');
        return;
      }

      if (!this.empleadoActual.horarioEmpleadoId) {
        this.notificationService.error('Edición: Horario no cargado correctamente');
        return;
      }

      Swal.fire({
        title: 'Procesando...',
        text: 'Por favor, espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      forkJoin({
        horario: this.editHorario(),
        dias: this.editDiasLaborables(),
        empleado: this.empleadoService.editEmpleado(this.empleadoActual.idPerEmpleado!, payload),
      }).subscribe({
        next: (results) => {
          Swal.fire(
            'Empleado Actualizado',
            `${results.empleado.primerNombre} ${results.empleado.primerApellido} editado con éxito`,
            'success'
          );
          this.cargarEmpleados();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error empleado', error);
          Swal.fire('Error', `No se pudo editar el empleado. Intente nuevamente`, 'error');
        },
      });
    } else {
      Swal.fire({
        title: 'Procesando...',
        text: 'Por favor, espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });
      this.crearHorario()
        .pipe(
          switchMap(() => {
            if (
              !this.empleadoActual.horarioEmpleadoId ||
              this.empleadoActual.horarioEmpleadoId === 0
            ) {
              return throwError(() => new Error('Creación: Horario no cargado correctamente'));
            }
            return this.crearDiasLaborables();
          }),
          switchMap(() => {
            if (
              !this.empleadoActual.diasLaborablesEmpleadoId ||
              this.empleadoActual.diasLaborablesEmpleadoId === 0
            ) {
              return throwError(() => new Error('Días laborables no cargados correctamente'));
            }
            payload = {
              ...payload,
              horarioEmpleadoId: this.empleadoActual.horarioEmpleadoId,
              diasLaborablesEmpleadoId: this.empleadoActual.diasLaborablesEmpleadoId,
            };
            return this.authService.createEmpleado(payload);
          })
        )
        .subscribe({
          next: (empleadoGuardado) => {
            this.empleados.push(empleadoGuardado);
            Swal.fire('Empleado Creado', `Empleado creado con éxito`, 'success');
            this.cerrarModal();
            this.cargarEmpleados();
          },
          error: (error) => {
            console.error('Error crear empleado', error);
            Swal.fire('Error', `Error al guardar empleado. Intente nuevamente`, 'error');
          },
        });
    }
  }

  eliminarEmpleado(item: PersonaEmpleado): void {
    if (item.idPerEmpleado === this.idUser) {
      this.notificationService.info('Usted no puede eliminar su propio usuario');
      return;
    }
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#759932',
    }).then((result) => {
      if (result.isConfirmed) {
        this.empleadoService
          .delete(item.idPerEmpleado)
          .pipe(
            switchMap(() => this.horarioEmpleadoService.delete(item.horarioEmpleadoId)),
            switchMap(() =>
              this.diasLaborablesEmpleadoService.delete(item.diasLaborablesEmpleadoId)
            )
          )
          .subscribe({
            next: () => {
              this.empleados = this.empleados.filter((c) => c.idPerEmpleado !== item.idPerEmpleado);
              this.cargarEmpleados();
              Swal.fire('Eliminado', 'Empleado eliminado con éxito', 'success');
            },
            error: (err) => {
              console.error('Error al eliminar el empleado', err);
              this.notificationService.error('Error al eliminar el empleado');
            },
          });
      }
    });
  }
}
