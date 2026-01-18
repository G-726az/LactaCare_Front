import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadoService } from '../../../medico/components/services/empleado.service';
import { AuthService } from '../../../../../../services/auth.service';
declare var Swal: any;

@Component({
  selector: 'app-miinformacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './miinformacion.html',
  styleUrls: ['./miinformacion.css'],
})
export class MiInformacionComponent implements OnInit {
  medicoData: any = {
    id: 0,
    imagenPerfil: 'https://ui-avatars.com/api/?name=Usuario&background=1976d2&color=fff&size=200',
    cedula: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    correo: '',
    telefono: '',
    fechaNacimiento: '',
    nombreCompleto: '',
    rol: 'Médico',
    especialidad: 'Pediatría - Lactancia',
  };

  editMode = false;
  loading = false;
  errores: any = {};
  editandoImagen = false;

  showPasswordChange = false;
  passwordChangeData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  today = new Date();
  originalData: any;

  private readonly DEFAULT_AVATAR =
    'https://ui-avatars.com/api/?name=Usuario&background=1976d2&color=fff&size=200';

  constructor(private empleadoService: EmpleadoService, private authService: AuthService) {}

  ngOnInit(): void {
    console.log('🚀 MiInformacionComponent inicializado');
    this.cargarDatosMedico();
  }

  cargarDatosMedico(): void {
    this.loading = true;
    this.errores = {};

    // 🔥 Cargar desde servicio (MODO REAL ACTIVADO)
    const currentUser = this.authService.currentUserValue;

    if (!currentUser || !currentUser.id) {
      console.error('❌ No hay usuario autenticado');
      this.cargarDatosLocales();
      this.loading = false;
      return;
    }

    const userId = currentUser.id;
    console.log('🔍 Cargando datos del empleado ID:', userId);

    this.empleadoService.getEmpleadoById(userId).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servicio:', response);

        if (response && response.data) {
          this.mapearDatosAMedicoData(response.data);
          this.originalData = { ...this.medicoData };
          console.log('✅ Datos de médico cargados:', this.medicoData);
        } else {
          console.warn('⚠️ Respuesta sin datos, cargando desde localStorage');
          this.cargarDatosLocales();
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar empleado:', error);
        this.cargarDatosLocales();
        this.loading = false;

        // Mostrar notificación de error
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'warning',
            title: 'Cargando datos locales',
            text: 'No se pudieron cargar los datos del servidor. Se usarán los datos guardados localmente.',
            timer: 3000,
            showConfirmButton: false,
          });
        }
      },
    });
  }

  cargarDatosLocales(): void {
    console.log('🔄 Cargando datos desde localStorage');

    const savedUser = localStorage.getItem('lactaCareUser') || localStorage.getItem('userData');

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('📦 Datos de localStorage:', userData);
        this.mapearDatosAMedicoData(userData);
        this.originalData = { ...this.medicoData };
        console.log('✅ Datos de médico cargados:', this.medicoData);
      } catch (error) {
        console.error('❌ Error al parsear datos:', error);
        this.cargarDatosPorDefecto();
      }
    } else {
      console.warn('⚠️ No hay datos guardados, cargando valores por defecto');
      this.cargarDatosPorDefecto();
    }
  }

  cargarDatosPorDefecto(): void {
    console.log('⚠️ Cargando datos por defecto');
    this.medicoData = {
      id: 0,
      imagenPerfil: this.DEFAULT_AVATAR,
      cedula: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      correo: '',
      telefono: '',
      fechaNacimiento: '',
      nombreCompleto: 'Usuario',
      rol: 'Médico',
      especialidad: 'Pediatría - Lactancia',
    };
    this.originalData = { ...this.medicoData };
  }

  mapearDatosAMedicoData(data: any): void {
    console.log('🗺️ Mapeando datos:', data);
    console.log(
      '🔍 segundoNombre recibido:',
      data.segundoNombre,
      '| segundo_nombre:',
      data.segundo_nombre
    );
    console.log(
      '🔍 segundoApellido recibido:',
      data.segundoApellido,
      '| segundo_apellido:',
      data.segundo_apellido
    );

    // 🔥 Manejar correctamente los valores null/undefined/vacíos
    let segundoNombre = '';
    if (
      data.segundoNombre !== null &&
      data.segundoNombre !== undefined &&
      data.segundoNombre !== ''
    ) {
      segundoNombre = String(data.segundoNombre);
    } else if (
      data.segundo_nombre !== null &&
      data.segundo_nombre !== undefined &&
      data.segundo_nombre !== ''
    ) {
      segundoNombre = String(data.segundo_nombre);
    }

    let segundoApellido = '';
    if (
      data.segundoApellido !== null &&
      data.segundoApellido !== undefined &&
      data.segundoApellido !== ''
    ) {
      segundoApellido = String(data.segundoApellido);
    } else if (
      data.segundo_apellido !== null &&
      data.segundo_apellido !== undefined &&
      data.segundo_apellido !== ''
    ) {
      segundoApellido = String(data.segundo_apellido);
    }

    console.log(
      '✅ segundoNombre procesado:',
      segundoNombre,
      '(length:',
      segundoNombre.length,
      ')'
    );
    console.log(
      '✅ segundoApellido procesado:',
      segundoApellido,
      '(length:',
      segundoApellido.length,
      ')'
    );

    // Obtener imagen de perfil con fallback
    let imagenPerfil =
      data.imagenPerfil || data.perfil_img || data.perfilEmpleadoImg || data.Perfil_empleado_img;

    // Si no hay imagen o es una ruta local que falla, usar avatar generado
    if (
      !imagenPerfil ||
      imagenPerfil.includes('user-avatar.png') ||
      imagenPerfil.includes('default-avatar.png')
    ) {
      const nombre = data.primerNombre || data.primer_nombre || 'Usuario';
      imagenPerfil = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        nombre
      )}&background=1976d2&color=fff&size=200`;
    }

    this.medicoData = {
      id: data.id || data.id_usuario || data.idPerEmpleado || data.Id_PerPaciente || 0,
      imagenPerfil: imagenPerfil,
      cedula: data.cedula || data.Cedula || '',
      primerNombre: data.primerNombre || data.primer_nombre || data.Primer_nombre || '',
      segundoNombre: segundoNombre,
      primerApellido: data.primerApellido || data.primer_apellido || data.Primer_apellido || '',
      segundoApellido: segundoApellido,
      correo: data.correo || data.Correo || data.email || '',
      telefono: data.telefono || data.Telefono || '',
      fechaNacimiento: this.parseFechaNacimiento(
        data.fechaNacimiento || data.fecha_nacimiento || data.Fechanacimiento
      ),
      nombreCompleto:
        data.nombreCompleto || data.nombre_completo || this.construirNombreCompleto(data),
      rol: data.rol || data.tipo || data.userType || 'Médico',
      especialidad: data.especialidad || 'Pediatría - Lactancia',
    };

    console.log('✅ MedicoData final mapeado:');
    console.log('   - segundoNombre:', this.medicoData.segundoNombre);
    console.log('   - segundoApellido:', this.medicoData.segundoApellido);
  }

  parseFechaNacimiento(fecha: any): string {
    if (!fecha) return '';

    try {
      let fechaParsed: Date;

      if (typeof fecha === 'string') {
        if (fecha.includes('T')) {
          fechaParsed = new Date(fecha);
        } else if (fecha.includes('-')) {
          fechaParsed = new Date(fecha + 'T00:00:00');
        } else {
          fechaParsed = new Date(fecha);
        }
      } else if (Array.isArray(fecha)) {
        const [year, month, day] = fecha;
        fechaParsed = new Date(year, month - 1, day);
      } else {
        fechaParsed = new Date(fecha);
      }

      if (!isNaN(fechaParsed.getTime())) {
        const year = fechaParsed.getFullYear();
        const month = String(fechaParsed.getMonth() + 1).padStart(2, '0');
        const day = String(fechaParsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.warn('⚠️ Error al parsear fecha:', e);
    }

    return '';
  }

  construirNombreCompleto(data?: any): string {
    const source = data || this.medicoData;

    const primerNombre = source.primerNombre || source.primer_nombre || '';
    const segundoNombre = source.segundoNombre || source.segundo_nombre || '';
    const primerApellido = source.primerApellido || source.primer_apellido || '';
    const segundoApellido = source.segundoApellido || source.segundo_apellido || '';

    const partes = [primerNombre, segundoNombre, primerApellido, segundoApellido].filter(Boolean);
    return partes.join(' ');
  }

  toggleEditMode(): void {
    if (this.editMode) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: '¿Cancelar edición?',
          text: 'Los cambios no guardados se perderán',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Sí, cancelar',
          cancelButtonText: 'Seguir editando',
          reverseButtons: true,
        }).then((result: any) => {
          if (result.isConfirmed) {
            this.cancelarEdicion();
            Swal.fire({
              title: 'Edición cancelada',
              text: 'Los cambios han sido descartados',
              icon: 'info',
              timer: 2000,
              showConfirmButton: false,
            });
          }
        });
      } else {
        if (confirm('¿Deseas cancelar la edición? Se perderán los cambios no guardados.')) {
          this.cancelarEdicion();
        }
      }
    } else {
      this.editMode = true;
      this.errores = {};
      this.editandoImagen = false;
      console.log('📝 Modo edición activado');
    }
  }

  habilitarEdicionImagen(): void {
    if (!this.editMode) {
      console.log('ℹ️ Activa el modo edición para cambiar la foto');
      alert('ℹ️ Activa el modo edición primero');
      return;
    }
    this.editandoImagen = true;
  }

  cancelarEdicionImagen(): void {
    this.editandoImagen = false;
    this.medicoData.imagenPerfil = this.originalData.imagenPerfil;
  }

  aplicarLinkImagen(): void {
    if (!this.medicoData.imagenPerfil || this.medicoData.imagenPerfil.trim() === '') {
      const nombre = this.medicoData.primerNombre || 'Usuario';
      this.medicoData.imagenPerfil = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        nombre
      )}&background=1976d2&color=fff&size=200`;
    }
    this.editandoImagen = false;
    console.log('✅ Link de imagen actualizado. Guarda los cambios para aplicar.');
  }

  togglePasswordChange(): void {
    this.showPasswordChange = !this.showPasswordChange;
    if (this.showPasswordChange) {
      this.passwordChangeData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
    }
  }

  guardarCambios(): void {
    if (!this.validarDatos()) {
      return;
    }

    this.loading = true;
    this.errores = {};

    console.log('💾 Guardando cambios para médico ID:', this.medicoData.id);

    const datosActualizados = {
      cedula: this.medicoData.cedula,
      perfilEmpleadoImg: this.medicoData.imagenPerfil || null,
      primerNombre: this.medicoData.primerNombre,
      segundoNombre: this.medicoData.segundoNombre || null,
      primerApellido: this.medicoData.primerApellido,
      segundoApellido: this.medicoData.segundoApellido || null,
      correo: this.medicoData.correo,
      telefono: this.medicoData.telefono,
      fechaNacimiento: this.medicoData.fechaNacimiento,
    };

    console.log('📤 Datos a enviar:', datosActualizados);

    // 🔥 LLAMADA REAL AL SERVICIO
    this.empleadoService.actualizarEmpleado(this.medicoData.id, datosActualizados).subscribe({
      next: (response) => {
        console.log('✅ Actualización exitosa:', response);

        if (response && response.data) {
          this.mapearDatosAMedicoData(response.data);
        }

        this.medicoData.nombreCompleto = this.construirNombreCompleto();

        // Actualizar localStorage
        const savedUser = JSON.parse(localStorage.getItem('lactaCareUser') || '{}');
        Object.assign(savedUser, {
          id: this.medicoData.id,
          cedula: this.medicoData.cedula,
          primer_nombre: this.medicoData.primerNombre,
          segundo_nombre: this.medicoData.segundoNombre,
          primer_apellido: this.medicoData.primerApellido,
          segundo_apellido: this.medicoData.segundoApellido,
          correo: this.medicoData.correo,
          telefono: this.medicoData.telefono,
          fechaNacimiento: this.medicoData.fechaNacimiento,
          imagenPerfil: this.medicoData.imagenPerfil,
          nombre_completo: this.medicoData.nombreCompleto,
        });
        localStorage.setItem('lactaCareUser', JSON.stringify(savedUser));

        this.originalData = { ...this.medicoData };
        this.editMode = false;
        this.editandoImagen = false;
        this.loading = false;

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'success',
            title: '¡Datos Actualizados!',
            text: 'Tu información ha sido guardada correctamente',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#1976d2',
          });
        } else {
          alert('✅ Datos actualizados correctamente');
        }
      },
      error: (error) => {
        console.error('❌ Error al actualizar:', error);
        this.loading = false;

        if (typeof Swal !== 'undefined') {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
            text: error.message || 'No se pudo guardar la información',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#dc3545',
          });
        } else {
          alert('❌ Error al actualizar los datos');
        }
      },
    });
  }

  onPasswordChange(): void {
    if (
      !this.passwordChangeData.currentPassword ||
      !this.passwordChangeData.newPassword ||
      !this.passwordChangeData.confirmPassword
    ) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Por favor, completa todos los campos',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f59e0b',
        });
      } else {
        alert('⚠️ Por favor, completa todos los campos');
      }
      return;
    }

    if (this.passwordChangeData.newPassword !== this.passwordChangeData.confirmPassword) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Contraseñas no coinciden',
          text: 'La nueva contraseña y su confirmación deben ser iguales',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545',
        });
      } else {
        alert('❌ Las contraseñas no coinciden');
      }
      return;
    }

    const passwordValidation = this.validatePasswordRequirements(
      this.passwordChangeData.newPassword
    );
    if (!passwordValidation.valid) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'error',
          title: 'Contraseña inválida',
          text: passwordValidation.message,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545',
        });
      } else {
        alert('❌ ' + passwordValidation.message);
      }
      return;
    }

    // 🔥 LLAMADA REAL AL SERVICIO
    this.empleadoService
      .cambiarPassword(this.medicoData.id, {
        passwordActual: this.passwordChangeData.currentPassword,
        passwordNueva: this.passwordChangeData.newPassword,
      })
      .subscribe({
        next: () => {
          this.showPasswordChange = false;
          this.passwordChangeData = { currentPassword: '', newPassword: '', confirmPassword: '' };

          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: '¡Contraseña Actualizada!',
              text: 'Tu contraseña ha sido cambiada exitosamente',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#10b981',
            });
          } else {
            alert('✅ Contraseña actualizada exitosamente');
          }
        },
        error: (error) => {
          console.error('❌ Error al cambiar contraseña:', error);

          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'error',
              title: 'Error al cambiar contraseña',
              text: error.message || 'Verifica tu contraseña actual',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#dc3545',
            });
          } else {
            alert('❌ No se pudo cambiar la contraseña');
          }
        },
      });
  }

  validatePasswordRequirements(password: string): { valid: boolean; message: string } {
    if (!password || password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener mínimo 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos 1 letra mayúscula' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos 1 letra minúscula' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'La contraseña debe contener al menos 1 número' };
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      return { valid: false, message: 'La contraseña no debe contener caracteres especiales' };
    }
    return { valid: true, message: 'Contraseña válida' };
  }

  getPasswordStrength(password: string): { width: string; class: string; text: string } {
    if (!password) {
      return { width: '0%', class: '', text: 'Seguridad: Muy débil' };
    }

    const validation = this.validatePasswordRequirements(password);
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    if (!validation.valid) {
      return { width: '25%', class: 'strength-weak', text: 'Seguridad: Débil' };
    }
    if (strength <= 50) {
      return { width: '50%', class: 'strength-fair', text: 'Seguridad: Regular' };
    } else if (strength === 75) {
      return { width: '75%', class: 'strength-good', text: 'Seguridad: Buena' };
    } else {
      return { width: '100%', class: 'strength-strong', text: 'Seguridad: Excelente' };
    }
  }

  hasUpperCase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  hasLowerCase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  hasNumber(password: string): boolean {
    return /[0-9]/.test(password);
  }

  hasSpecialChars(password: string): boolean {
    return /[^A-Za-z0-9]/.test(password);
  }

  validarDatos(): boolean {
    this.errores = {};
    let valido = true;

    if (!this.medicoData.cedula || !/^\d{10}$/.test(this.medicoData.cedula)) {
      this.errores['cedula'] = 'La cédula debe tener 10 dígitos';
      valido = false;
    }

    if (!this.medicoData.primerNombre || this.medicoData.primerNombre.trim() === '') {
      this.errores['primerNombre'] = 'El primer nombre es obligatorio';
      valido = false;
    }

    if (!this.medicoData.segundoNombre || this.medicoData.segundoNombre.trim() === '') {
      this.errores['segundoNombre'] = 'El segundo nombre es obligatorio';
      valido = false;
    }

    if (!this.medicoData.primerApellido || this.medicoData.primerApellido.trim() === '') {
      this.errores['primerApellido'] = 'El primer apellido es obligatorio';
      valido = false;
    }

    if (!this.medicoData.segundoApellido || this.medicoData.segundoApellido.trim() === '') {
      this.errores['segundoApellido'] = 'El segundo apellido es obligatorio';
      valido = false;
    }

    if (!this.medicoData.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.medicoData.correo)) {
      this.errores['correo'] = 'El formato del correo electrónico no es válido';
      valido = false;
    }

    if (this.medicoData.telefono && !/^\d{10}$/.test(this.medicoData.telefono)) {
      this.errores['telefono'] = 'El teléfono debe tener 10 dígitos';
      valido = false;
    }

    if (this.medicoData.imagenPerfil && this.medicoData.imagenPerfil.trim() !== '') {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      const isLocalPath = this.medicoData.imagenPerfil.startsWith('/assets/');

      if (!urlPattern.test(this.medicoData.imagenPerfil) && !isLocalPath) {
        this.errores['imagenPerfil'] = 'El link de la imagen no es válido';
        valido = false;
      }
    }

    if (!valido) {
      console.log('❌ Validación fallida:', this.errores);

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'warning',
          title: '⚠️ Errores en el formulario',
          html:
            '<div style="text-align: left;"><p style="margin-bottom: 10px;">Por favor, corrige los siguientes campos:</p><ul style="padding-left: 20px;">' +
            Object.keys(this.errores)
              .map(
                (campo) =>
                  `<li><strong>${this.getNombreCampo(campo)}:</strong> ${this.errores[campo]}</li>`
              )
              .join('') +
            '</ul></div>',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#1976d2',
        });
      } else {
        alert('⚠️ Por favor, corrige los errores en el formulario');
      }
    }

    return valido;
  }

  private getNombreCampo(campo: string): string {
    const nombres: any = {
      cedula: 'Cédula',
      primerNombre: 'Primer Nombre',
      segundoNombre: 'Segundo Nombre',
      primerApellido: 'Primer Apellido',
      segundoApellido: 'Segundo Apellido',
      correo: 'Correo Electrónico',
      telefono: 'Teléfono',
      imagenPerfil: 'Imagen de Perfil',
    };
    return nombres[campo] || campo;
  }

  cancelarEdicion(): void {
    this.medicoData = { ...this.originalData };
    this.editMode = false;
    this.editandoImagen = false;
    this.errores = {};
    this.showPasswordChange = false;
    console.log('❌ Edición cancelada');
  }

  calcularEdad(): number {
    if (!this.medicoData.fechaNacimiento) return 0;

    const hoy = new Date();
    const nacimiento = new Date(this.medicoData.fechaNacimiento);

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  exportToPDF(): void {
    console.log('📄 Exportando perfil a PDF...');
    alert(
      '🔄 Función de exportación a PDF en desarrollo\n\nPara implementarla, puedes usar:\n- jspdf\n- html2canvas\n- pdfmake'
    );
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return 'N/A';
    }
  }

  onImageError(event: any): void {
    console.warn('⚠️ Error al cargar imagen, usando avatar por defecto');
    const nombre = this.medicoData.primerNombre || 'Usuario';
    event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      nombre
    )}&background=1976d2&color=fff&size=200`;
  }
}
