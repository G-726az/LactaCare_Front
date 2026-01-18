import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../../../../../services/paciente.service';
import { AuthService } from '../../../../../../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { DataSharingService, PerfilActualizadoEvent } from '../services/data-sharing.service';

@Component({
  selector: 'app-perfil-madres',
  templateUrl: './perfil-madres.component.html',
  styleUrls: ['./perfil-madres.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class PerfilMadresComponent implements OnInit {
  pacienteData: any = {
    id: 0,
    imagenPerfil: '/assets/images/default-avatar.png',
    cedula: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    telefono: '',
    fechaNacimiento: '',
    discapacidad: false,
    nombreCompleto: '',
    rol: 'Madre Lactante',
  };

  editMode = false;
  loading = false;
  errores: any = {};
  editandoImagen = false;

  constructor(
    private pacienteService: PacienteService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private dataSharingService: DataSharingService // 🔥 NUEVO
  ) {}

  ngOnInit(): void {
    this.cargarDatosPaciente();
  }

  cargarDatosPaciente(): void {
    this.loading = true;
    this.errores = {};

    const currentUser = this.authService.currentUserValue;

    if (!currentUser || !currentUser.id) {
      console.error('❌ Usuario no autenticado');
      this.cargarDatosLocales();
      this.loading = false;
      return;
    }

    const idPaciente = currentUser.id;
    console.log('🔄 Cargando datos del paciente ID:', idPaciente);

    this.pacienteService.getPacienteById(idPaciente).subscribe({
      next: (response) => {
        console.log('✅ Respuesta completa del servicio:', response);
        console.log('✅ Data del servicio:', response.data);

        if (response.success && response.data) {
          this.mapearDatosAPacienteData(response.data);
          console.log('✅ PacienteData final:', this.pacienteData);
        } else {
          console.error('❌ Respuesta sin datos válidos');
          this.cargarDatosLocales();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error recargando datos:', error);
        this.cargarDatosLocales();
        this.loading = false;
      },
    });
  }

  cargarDatosLocales(): void {
    console.log('🔄 Intentando cargar datos desde localStorage');

    let userDataStr = localStorage.getItem('userData');

    if (!userDataStr) {
      userDataStr = localStorage.getItem('lactaCareUser');
    }

    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        console.log('📦 Datos encontrados en localStorage:', userData);

        if (userData.primerNombre || userData.primer_nombre) {
          if (userData.primerNombre) {
            this.mapearDatosAPacienteData(userData);
          } else if (userData.primer_nombre) {
            this.mapearDatosDesdeLogin(userData);
          }
        }

        console.log('✅ Datos cargados desde localStorage:', this.pacienteData);
      } catch (error) {
        console.error('❌ Error al parsear datos locales:', error);
      }
    } else {
      console.warn('⚠️ No se encontraron datos en localStorage');
    }
  }

  mapearDatosDesdeLogin(data: any): void {
    console.log('🗺️ Mapeando desde formato login:', data);

    this.pacienteData = {
      id: data.id || 0,
      imagenPerfil: data.perfil_img || data.imagen_perfil || '/assets/images/default-avatar.png',
      cedula: data.cedula || '',
      primerNombre: data.primer_nombre || '',
      segundoNombre: data.segundo_nombre || '',
      primerApellido: data.primer_apellido || '',
      segundoApellido: data.segundo_apellido || '',
      correo: data.correo || data.email || '',
      telefono: data.telefono || '',
      fechaNacimiento: data.fecha_nacimiento || '',
      discapacidad: data.discapacidad || false,
      nombreCompleto: data.nombre_completo || this.construirNombreCompleto(data),
      rol: 'Madre Lactante',
    };

    console.log('📋 SegundoNombre mapeado:', this.pacienteData.segundoNombre);
    console.log('📋 SegundoApellido mapeado:', this.pacienteData.segundoApellido);
  }

  mapearDatosAPacienteData(data: any): void {
    console.log('🗺️ Mapeando datos formato backend:', data);
    console.log(
      '🔍 data.segundoNombre recibido:',
      data.segundoNombre,
      'tipo:',
      typeof data.segundoNombre
    );
    console.log(
      '🔍 data.segundoApellido recibido:',
      data.segundoApellido,
      'tipo:',
      typeof data.segundoApellido
    );

    // 🔥 CRÍTICO: Convertir null a string vacío explícitamente
    const segundoNombre =
      data.segundoNombre === null || data.segundoNombre === undefined
        ? ''
        : String(data.segundoNombre);

    const segundoApellido =
      data.segundoApellido === null || data.segundoApellido === undefined
        ? ''
        : String(data.segundoApellido);

    this.pacienteData = {
      id: data.id || 0,
      imagenPerfil: data.imagenPerfil || '/assets/images/default-avatar.png',
      cedula: data.cedula || '',
      primerNombre: data.primerNombre || '',
      segundoNombre: segundoNombre,
      primerApellido: data.primerApellido || '',
      segundoApellido: segundoApellido,
      correo: data.correo || '',
      telefono: data.telefono || '',
      fechaNacimiento: data.fechaNacimiento || '',
      discapacidad: data.discapacidad || false,
      nombreCompleto: data.nombreCompleto || this.construirNombreCompleto(data),
      rol: 'Madre Lactante',
    };

    console.log('✅ PacienteData.segundoNombre final:', this.pacienteData.segundoNombre);
    console.log('✅ PacienteData.segundoApellido final:', this.pacienteData.segundoApellido);
  }

  construirNombreCompleto(data?: any): string {
    const source = data || this.pacienteData;

    const primerNombre = source.primerNombre || source.primer_nombre || '';
    const segundoNombre = source.segundoNombre || source.segundo_nombre || '';
    const primerApellido = source.primerApellido || source.primer_apellido || '';
    const segundoApellido = source.segundoApellido || source.segundo_apellido || '';

    const partes = [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean);

    return partes.join(' ');
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.errores = {};
    this.editandoImagen = false;

    if (this.editMode) {
      console.log('📝 Modo edición activado');
      console.log('🔍 SegundoNombre en edición:', this.pacienteData.segundoNombre);
      console.log('🔍 SegundoApellido en edición:', this.pacienteData.segundoApellido);
    }
  }

  habilitarEdicionImagen(): void {
    if (!this.editMode) {
      this.notificationService.info('ℹ️ Activa el modo edición para cambiar la foto');
      return;
    }
    this.editandoImagen = true;
  }

  cancelarEdicionImagen(): void {
    this.editandoImagen = false;
  }

  aplicarLinkImagen(): void {
    if (!this.pacienteData.imagenPerfil || this.pacienteData.imagenPerfil.trim() === '') {
      this.pacienteData.imagenPerfil = '/assets/images/default-avatar.png';
    }
    this.editandoImagen = false;
    this.notificationService.success(
      '✅ Link de imagen actualizado. Guarda los cambios para aplicar.'
    );
  }

  guardarCambios(): void {
    if (!this.validarDatos()) {
      return;
    }

    this.loading = true;
    this.errores = {};

    console.log('💾 Guardando cambios para paciente ID:', this.pacienteData.id);

    const datosActualizados = {
      cedula: this.pacienteData.cedula,
      imagenPerfil: this.pacienteData.imagenPerfil || null,
      primerNombre: this.pacienteData.primerNombre,
      segundoNombre: this.pacienteData.segundoNombre || '',
      primerApellido: this.pacienteData.primerApellido,
      segundoApellido: this.pacienteData.segundoApellido || '',
      correo: this.pacienteData.correo,
      telefono: this.pacienteData.telefono,
      fechaNacimiento: this.pacienteData.fechaNacimiento,
      discapacidad: this.pacienteData.discapacidad || false,
    };

    console.log('📤 Datos a enviar al backend:');
    console.log('📦 Payload completo:', datosActualizados);

    this.pacienteService.actualizarPaciente(this.pacienteData.id, datosActualizados).subscribe({
      next: (response) => {
        console.log('✅ Actualización exitosa:', response);

        if (response.success && response.data) {
          console.log('🔄 Remapeando datos después de actualizar:', response.data);
          this.mapearDatosAPacienteData(response.data);
          this.pacienteData.nombreCompleto = this.construirNombreCompleto();

          console.log('✅ Datos actualizados en el componente:');
          console.log('  - segundoNombre:', this.pacienteData.segundoNombre);
          console.log('  - segundoApellido:', this.pacienteData.segundoApellido);

          // 🔥 NUEVO: Emitir evento de actualización de perfil
          this.emitirEventoActualizacion();
        }

        this.notificationService.success('✅ Datos actualizados correctamente');
        this.editMode = false;
        this.editandoImagen = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al actualizar:', error);

        let mensajeError = '❌ Error al actualizar los datos';
        if (error.message) {
          mensajeError = error.message;
        }

        this.notificationService.error(mensajeError);
        this.loading = false;
      },
    });
  }

  // 🔥 NUEVO MÉTODO: Emitir evento de actualización
  private emitirEventoActualizacion(): void {
    const perfilActualizado: PerfilActualizadoEvent = {
      id: this.pacienteData.id,
      nombreCompleto: this.pacienteData.nombreCompleto,
      primerNombre: this.pacienteData.primerNombre,
      segundoNombre: this.pacienteData.segundoNombre,
      primerApellido: this.pacienteData.primerApellido,
      segundoApellido: this.pacienteData.segundoApellido,
      cedula: this.pacienteData.cedula,
      correo: this.pacienteData.correo,
      telefono: this.pacienteData.telefono,
      imagenPerfil: this.pacienteData.imagenPerfil,
      fechaNacimiento: this.pacienteData.fechaNacimiento,
      discapacidad: this.pacienteData.discapacidad,
    };

    console.log('📢 Emitiendo evento de actualización de perfil:', perfilActualizado);
    this.dataSharingService.actualizarPerfilPaciente(perfilActualizado);
  }

  validarDatos(): boolean {
    this.errores = {};
    let valido = true;

    // Validar cédula (10 dígitos)
    if (!this.pacienteData.cedula || !/^\d{10}$/.test(this.pacienteData.cedula)) {
      this.errores['cedula'] = 'La cédula debe tener 10 dígitos';
      valido = false;
    }

    // Validar primer nombre
    if (!this.pacienteData.primerNombre || this.pacienteData.primerNombre.trim() === '') {
      this.errores['primerNombre'] = 'El primer nombre es obligatorio';
      valido = false;
    }

    // Validar primer apellido
    if (!this.pacienteData.primerApellido || this.pacienteData.primerApellido.trim() === '') {
      this.errores['primerApellido'] = 'El primer apellido es obligatorio';
      valido = false;
    }

    // Validar email
    if (!this.pacienteData.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.pacienteData.correo)) {
      this.errores['correo'] = 'El formato del correo electrónico no es válido';
      valido = false;
    }

    // Validar teléfono (10 dígitos)
    if (!this.pacienteData.telefono || !/^\d{10}$/.test(this.pacienteData.telefono)) {
      this.errores['telefono'] = 'El teléfono debe tener 10 dígitos';
      valido = false;
    }

    // Validar URL de imagen (opcional, pero si existe debe ser válida)
    if (this.pacienteData.imagenPerfil && this.pacienteData.imagenPerfil.trim() !== '') {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      const isLocalPath = this.pacienteData.imagenPerfil.startsWith('/assets/');

      if (!urlPattern.test(this.pacienteData.imagenPerfil) && !isLocalPath) {
        this.errores['imagenPerfil'] = 'El link de la imagen no es válido';
        valido = false;
      }
    }

    if (!valido) {
      console.log('❌ Validación fallida:', this.errores);
      this.notificationService.warning('⚠️ Por favor, corrige los errores en el formulario');
    }

    return valido;
  }

  cancelarEdicion(): void {
    this.cargarDatosPaciente();
    this.editMode = false;
    this.editandoImagen = false;
    this.errores = {};
  }

  cambiarFoto(): void {
    this.habilitarEdicionImagen();
  }

  calcularEdad(): number {
    if (!this.pacienteData.fechaNacimiento) return 0;

    const hoy = new Date();
    const nacimiento = new Date(this.pacienteData.fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }
}