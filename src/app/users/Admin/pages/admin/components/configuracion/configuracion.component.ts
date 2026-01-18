import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../app/services/notification.service';
import { AuthService } from '../../../../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { EmpleadoService } from '../../../../app/services/empleado.service';
import Swal from 'sweetalert2';
import { DiasLarolablesEmpleadoService } from '../../../../app/services/dias-laborables-empleado.service';
import { HorarioEmpleadoService } from '../../../../app/services/horario-empleado.service';
import { SalaLactanciaService } from '../../../../app/services/sala-lactancia.service';
import { PersonaEmpleado, SalaLactancia } from '../../../../../../models/database.models';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
})
export class ConfiguracionComponent implements OnInit {
  tabActiva = 'perfil';
  private idAdmin: number = 0;
  private modalImgEmpleado = false;
  loadingPerfil = true;
  loadingDias = true;
  loadingHorario = true;

  // ================================== Modelos de Datos ===========================================
  perfilData = {
    id: 0,
    foto: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    cedula: '',
    email: '',
    telefono: '',
    password: '',
    fechaNacimiento: '',
    idDiasLaborables: 0,
    idHorario: 0,
    idSalaLactancia: 0,
  };

  seguridadData = {
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
  };

  diasData = {
    diaLunes: false,
    diaMartes: false,
    diaMiercoles: false,
    diaJueves: false,
    diaViernes: false,
    diaSabado: false,
    diaDomingo: false,
  };

  horariosData = {
    inicioJornada: '',
    finJornada: '',
    inicioDescanso: '',
    finDescanso: '',
  };

  // ========================================== Validaciones =========================================
  maxFechaNacimiento!: string;
  minFechaNacimiento!: string;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private empleadoService: EmpleadoService,
    private diasLaborablesServiceEmpleado: DiasLarolablesEmpleadoService,
    private horarioEmpleadoService: HorarioEmpleadoService,
    private salaLactanciaService: SalaLactanciaService
  ) {}

  ngOnInit(): void {
    this.conseguirIdAuth();
    this.cargarAdmin();
    this.cargarSalas();
    this.setLimitsFechaNacimiento();
  }

  /* ===================================== CARGAR ID ADMIN DESDE AUTH =============================================== */
  conseguirIdAuth() {
    const user = this.authService.currentUserValue;

    //Verificar existencia del usuario
    if (!user) {
      this.notificationService.error('⚠️ Debes iniciar sesión');
      this.router.navigate(['/login']);
      return;
    }

    //Verificar rol administrador
    const rolNormalizado = user.rol?.toUpperCase();
    if (rolNormalizado !== 'ADMINISTRADOR' && rolNormalizado !== 'ADMIN') {
      this.notificationService.error('❌ No tienes permisos de administrador');
      this.router.navigate(['/login']);
      return;
    }

    //Set datos internos
    this.idAdmin = user.id;
    console.log('id: ', this.idAdmin);
  }

  /* ======================================= METODOS PARA ADMIN ======================================================*/

  // ------------------------------------------- Admin puro ------------------------------------------------------------

  cargarAdmin(): void {
    this.empleadoService.getEmpleado(this.idAdmin).subscribe((empleado: any) => {
      console.log('RESPUESTA BACKEND', empleado);

      this.perfilData = {
        id: empleado.idPerEmpleado,
        foto: empleado.perfilEmpleadoImg || 'assets/admin-avatar.png',
        primerNombre: empleado.primerNombre,
        segundoNombre: empleado.segundoNombre || '',
        primerApellido: empleado.primerApellido,
        segundoApellido: empleado.segundoApellido || '',
        cedula: empleado.cedula,
        email: empleado.correo,
        telefono: empleado.telefono,
        password: '',
        fechaNacimiento: empleado.fechaNacimiento || '',
        idDiasLaborables: empleado.diasLaborablesEmpleadoId,
        idHorario: empleado.horarioEmpleadoId,
        idSalaLactancia: empleado.salaLactanciaId,
      };
      this.cargarDiasLaborables();
      this.cargarHorario();
      this.loadingPerfil = false;
    });
  }

  editFotoPerfil() {
    if (!this.perfilData.foto) {
      this.notificationService.warning('⚠️ Por favor complete el url de imagen');
      return;
    }

    /*
    const regexImagen = /\.(png|jpg|jpeg)$/i;

    if (!regexImagen.test(this.perfilData.foto)) {
      this.notificationService.warning('⚠️ El URL debe ser una imagen (.png, .jpg, .jpeg)');
      return;
    }
    */

    const empladoActualizado = {
      perfilEmpleadoImg: this.perfilData.foto,
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.empleadoService.editImagen(this.perfilData.id, empladoActualizado).subscribe({
      next: () => {
        Swal.fire('Foto de perfil', 'Foto de perfil actualizada con éxito', 'success');
        this.cargarAdmin();
      },
      error: (err) => {
        Swal.fire('Error', 'Error al editar la imagen', 'error');
        this.notificationService.error(`Imagen: ${err}`);
        console.error('❌Imagen: ', err);
      },
    });
  }

  guardarPerfil() {
    if (
      !this.perfilData.primerNombre ||
      !this.perfilData.email ||
      !this.perfilData.primerApellido
    ) {
      this.notificationService.warning('⚠️ Por favor completa nombre y correo');
      return;
    }

    const empleadoActualizado = {
      perfilEmpleadoImg: this.perfilData.foto,
      primerNombre: this.perfilData.primerNombre,
      segundoNombre: this.perfilData.segundoNombre,
      primerApellido: this.perfilData.primerApellido,
      segundoApellido: this.perfilData.segundoApellido,
      cedula: this.perfilData.cedula,
      correo: this.perfilData.email,
      telefono: this.perfilData.telefono,
      fechaNacimiento: this.perfilData.fechaNacimiento,
    };

    this.empleadoService.editEmpleado(this.perfilData.id, empleadoActualizado).subscribe({
      next: () => {
        Swal.fire('Perfil', 'Perfil actualizado con éxito', 'success');
        this.cargarAdmin();
      },
      error: (err) => {
        Swal.fire('Error', 'Error al editar el perfil', 'error');
        this.notificationService.error(`Perfil: ${err}`);
        console.error('❌Perfil: ', err);
      },
    });
  }

  passwordStrength = 0;
  passwordLabel = 'Muy débil';
  passwordColor = '#ef4444';

  evaluarPassword(password: string) {
    let score = 0;

    if (!password) {
      this.resetPasswordStrength();
      return;
    }

    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 20;

    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;

    score = Math.min(score, 100);

    this.passwordStrength = score;

    if (score < 40) {
      this.passwordLabel = 'Débil';
      this.passwordColor = '#ef4444';
    } else if (score < 70) {
      this.passwordLabel = 'Media';
      this.passwordColor = '#f59e0b';
    } else {
      this.passwordLabel = 'Fuerte';
      this.passwordColor = '#22c55e';
    }
  }

  private resetPasswordStrength(): void {
    this.passwordStrength = 0;
    this.passwordLabel = 'Muy débil';
    this.passwordColor = '#ef4444';
  }

  cambiarPassword() {
    if (
      !this.seguridadData.passwordActual ||
      !this.seguridadData.passwordNueva ||
      !this.seguridadData.passwordConfirmar
    ) {
      this.notificationService.warning('⚠️ Completa todos los campos');
      return;
    }

    if (this.seguridadData.passwordNueva !== this.seguridadData.passwordConfirmar) {
      this.notificationService.error('❌ Las contraseñas no coinciden');
      return;
    }

    if (this.seguridadData.passwordNueva.length < 8) {
      this.notificationService.warning('⚠️ La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.empleadoService
      .editPassword(this.idAdmin, {
        passwordActual: this.seguridadData.passwordActual,
        passwordNueva: this.seguridadData.passwordNueva,
      })
      .subscribe({
        next: () => {
          Swal.fire('Cambio contraseña', '🔒 Contraseña cambiada con éxito', 'success');
          this.seguridadData = {
            passwordActual: '',
            passwordNueva: '',
            passwordConfirmar: '',
          };
        },
        error: (err) => {
          Swal.fire('Error', 'Error al cambiar de contraseña', 'error');
          this.notificationService.error(`Contraseña: ${err}`);
          console.error('❌Contraseña: ', err);
        },
      });
  }

  // -------------------------------------------- Dias laborables ----------------------------------------------------

  cargarDiasLaborables(): void {
    console.log(`idDiasPreService: ${this.perfilData.idDiasLaborables}`);
    this.diasLaborablesServiceEmpleado
      .getDiasLaborables(this.perfilData.idDiasLaborables)
      .subscribe((dias: any) => {
        console.log(`dias: ${dias}`);
        this.diasData = {
          diaLunes: dias.diaLunes,
          diaMartes: dias.diaMartes,
          diaMiercoles: dias.diaMiercoles,
          diaJueves: dias.diaJueves,
          diaViernes: dias.diaViernes,
          diaSabado: dias.diaSabado,
          diaDomingo: dias.diaDomingo,
        };
        this.loadingDias = false;
      });
  }

  editDiasLaborables() {
    const diasActualizado = {
      diaLunes: this.diasData.diaLunes,
      diaMartes: this.diasData.diaMartes,
      diaMiercoles: this.diasData.diaMiercoles,
      diaJueves: this.diasData.diaJueves,
      diaViernes: this.diasData.diaViernes,
      diaSabado: this.diasData.diaSabado,
      diaDomingo: this.diasData.diaDomingo,
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.diasLaborablesServiceEmpleado
      .editDias(this.perfilData.idDiasLaborables, diasActualizado)
      .subscribe({
        next: () => {
          Swal.close;
          Swal.fire('Actualizado', '🗓️ Dias laborables editado con éxito', 'success');
        },
        error: (err) => {
          Swal.fire('Error', 'Error al editar los Días laborables', 'error');
          this.notificationService.error(`Sala lactancia: ${err}`);
          console.error('❌Dias laborables: ', err);
        },
      });
  }

  // --------------------------------------------- Horario -----------------------------------------------------------

  cargarHorario(): void {
    console.log(`idHorarioPreServicio: ${this.perfilData.idHorario}`);
    this.horarioEmpleadoService.getHorario(this.perfilData.idHorario).subscribe((horario: any) => {
      console.log(`horario: ${horario}`);
      this.horariosData = {
        inicioJornada: horario.horaInicioJornada,
        finJornada: horario.horaFinJornada,
        inicioDescanso: horario.horaInicioDescanso,
        finDescanso: horario.horaFinDescanso,
      };
      this.loadingHorario = false;
    });
  }

  editHorario() {
    if (!this.horariosData.inicioJornada || !this.horariosData.finJornada) {
      this.notificationService.error(
        '⚠️ Debe llenar los campos solicitados (Hora de inicio y fin de jornada)'
      );
      return;
    }

    if (
      (this.horariosData.inicioDescanso && !this.horariosData.finDescanso) ||
      (this.horariosData.inicioDescanso && !this.horariosData.finDescanso)
    ) {
      this.notificationService.error('⚠️ No puede llenar solo un horario de descanso');
      return;
    }

    const horarioActualizado = {
      horaInicioJornada: this.horariosData.inicioJornada,
      horaFinJornada: this.horariosData.finJornada,
      horaInicioDescanso: this.horariosData.inicioDescanso,
      horaFinDescanso: this.horariosData.finDescanso,
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.horarioEmpleadoService
      .editHorario(this.perfilData.idHorario, horarioActualizado)
      .subscribe({
        next: () => {
          Swal.fire('Horario', '🕑 Horario editado con éxito', 'success');
        },
        error: (err) => {
          Swal.fire('Error', 'Error al editar el Horario', 'error');
          this.notificationService.error(`Horario: ${err}`);
          console.error('❌Horarios: ', err);
        },
      });
  }

  // ------------------------------------- Metodo unificado para boton editar -----------------------------------------

  editDiasHorarioSala() {
    this.editDiasLaborables();
    this.editHorario();
    this.editSalaLactancia();
    this.cargarAdmin();
    this.cargarSalas();
  }

  // ============================================ SALAS LACTANCIA =================================================== */

  salasLactancia: SalaLactancia[] = [];

  loadingSalas = true;

  cargarSalas() {
    this.salaLactanciaService.getAll().subscribe({
      next: (salas: any) => {
        this.salasLactancia = salas;
      },
      error: (err) => {
        console.error('Error salas', err);
      },
      complete: () => {
        this.loadingSalas = false;
      },
    });
  }

  editSalaLactancia() {
    if (this.perfilData.idSalaLactancia === 0) {
      this.notificationService.warning(
        '⚠️ Debe seleccionar una de las salas de lactancia disponibles'
      );
      return;
    }

    const adminActualizado: Partial<PersonaEmpleado> = {
      salaLactanciaId: this.perfilData.idSalaLactancia,
    };

    Swal.fire({
      title: 'Procesando...',
      text: 'Por favor, espere',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.empleadoService.editLactario(this.idAdmin, adminActualizado).subscribe({
      next: () => {
        Swal.close;
        Swal.fire('Sala de lactancia', 'Sala de lactancia edita con éxito', 'success');
      },
      error: (err) => {
        Swal.fire('Error', 'Error al editar la Sala de lactancia', 'error');
        this.notificationService.error(`Sala lactancia: ${err}`);
        console.error('❌Sala Lactancia: ', err);
      },
    });
  }

  // ================================== METODOS DE VALIDACION Y NAVEGACION =============================================
  setLimitsFechaNacimiento() {
    const hoy = new Date();

    const maxDate = new Date(hoy);
    maxDate.setFullYear(maxDate.getFullYear() - 18);
    this.maxFechaNacimiento = maxDate.toISOString().split('T')[0];

    const minDate = new Date(hoy);
    minDate.setFullYear(hoy.getFullYear() - 68);
    this.minFechaNacimiento = minDate.toISOString().split('T')[0];
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
    if (tab === 'sistema') {
    }
  }

  irASeguridad() {
    this.cambiarTab('seguridad');
    this.notificationService.info('📍 Redirigido a configuración de seguridad');
  }

  mostrarModalImgEmpleado() {
    this.modalImgEmpleado = true;
  }
}
