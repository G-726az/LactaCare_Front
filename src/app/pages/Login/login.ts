import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

interface CarouselSlide {
  image: string;
  title: string;
  description: string;
}

interface LoginData {
  correo: string;
  password: string;
}

interface RecoveryData {
  correo: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface RegisterData {
  cedula: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  password: string;
  confirmPassword: string;
  discapacidad: boolean;
}

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Estados de autenticación
  isAuthenticated = false;
  currentUserRole: string = '';

  // Perfil seleccionado desde el header
  perfilSeleccionado: string = '';
  mostrarIndicadorPerfil: boolean = false;

  // Estados para las pestañas
  activeTab: 'login' | 'register' | 'recover' = 'login';
  recoveryStep: 1 | 2 | 3 | 4 = 1;

  // Datos del formulario
  loginData: LoginData = {
    correo: '',
    password: '',
  };

  registerData: RegisterData = {
    cedula: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo: '',
    telefono: '',
    fecha_nacimiento: '',
    password: '',
    confirmPassword: '',
    discapacidad: false,
  };

  recoveryData: RecoveryData = {
    correo: '',
    code: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  recoveryCode: string = '';

  // Datos del carrusel
  carouselSlides: { [key: string]: CarouselSlide[] } = {
    login: [
      {
        image:
          'https://elcomercio-elcomercio-prod.web.arc-cdn.net/resizer/v2/WXXOZWDLPVAARDAFGQ5XLVQPHA.jpg?auth=5f8f1f2a4911679b4b9232016ff683d755d150b9e11288903dc68b16584ad078&width=640&smart=true&quality=75',
        title: 'Cuidado Médico Integral',
        description:
          'Sistema diseñado para brindar la mejor atención médica con tecnología de vanguardia y personal especializado.',
      },
      {
        image: 'https://www.lechedeflorida.com/file/444/FDF_Banner_600x314-6.jpg',
        title: 'Tecnología Hospitalaria',
        description:
          'Instalaciones equipadas con la última tecnología para diagnósticos precisos y tratamientos efectivos.',
      },
      {
        image:
          'https://maternidad21.com/wp-content/uploads/2022/04/cuanto-dura-la-lactancia-materna-con-biberon-1024x576.jpg',
        title: 'Especialistas en Pediatría',
        description:
          'Atención especializada para los más pequeños con enfoque en desarrollo y bienestar infantil.',
      },
    ],
    register: [
      {
        image:
          'https://elcomercio-elcomercio-prod.web.arc-cdn.net/resizer/v2/DA5B52BEFBE3VHQPLKNEIEXXEQ.jpg?auth=2321de0d25ee909772a6f6f0ce2414748c266afdcbd4632db441167d74313a92&width=640&smart=true&quality=75',
        title: 'Registro de Pacientes',
        description: 'Forma parte de nuestra comunidad con el sistema LactaCare.',
      },
      {
        image:
          'https://elcomercio.pe/resizer/J19DiwBEdMckUk4yBJgJjOYmGvE=/640x0/smart/filters:format(jpeg):quality(75)/cloudfront-us-east-1.images.arcpublishing.com/elcomercio/3R4LKFH7J5FFPB7KFHCTNXSACI.jpg',
        title: 'Atención Personalizada',
        description:
          'Recibe atención médica personalizada y seguimiento continuo de tu salud y la de tu bebé.',
      },
      {
        image: 'https://hospitalprivado.com.ar/uploads/cache/news_d_lactancia-materna-6388.jpg',
        title: 'Acceso Digital',
        description:
          'Accede a tu información médica desde cualquier lugar con nuestro sistema digital.',
      },
    ],
    recover: [
      {
        image:
          'https://bbtipsmexico.com.mx/wp-content/uploads/2023/07/07_LactanciaMaterna_BbTips.jpg.avif',
        title: 'Seguridad Garantizada',
        description:
          'Nuestro sistema utiliza encriptación de última generación para proteger toda la información médica.',
      },
      {
        image:
          'https://bbtipsmexico.com.mx/wp-content/uploads/2023/07/07_LactanciaMaterna_BbTips.jpg.avif',
        title: 'Soporte 24/7',
        description:
          'Equipo de soporte técnico disponible las 24 horas para asistencia inmediata con tu cuenta.',
      },
      {
        image:
          'https://bbtipsmexico.com.mx/wp-content/uploads/2023/07/07_LactanciaMaterna_BbTips.jpg.avif',
        title: 'Verificación de Identidad',
        description:
          'Proceso seguro de verificación en múltiples pasos para garantizar la protección de tu cuenta.',
      },
    ],
  };

  currentSlideIndex: { [key: string]: number } = {
    login: 0,
    register: 0,
    recover: 0,
  };

  private carouselTimers: { [key: string]: any } = {};

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargar perfil seleccionado
    this.cargarPerfilSeleccionado();

    // Escuchar cambios de perfil
    this.escucharCambiosPerfil();

    // Verificar si ya hay sesión activa
    const savedUser = localStorage.getItem('lactaCareUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      this.isAuthenticated = true;
      this.currentUserRole = userData.rol;
      this.redirectToDashboard(userData.rol);
    }

    // Verificar si debemos mostrar el registro automáticamente (para pacientes)
    this.verificarRegistroAutomatico();

    // Inicializar el carrusel
    this.startCarouselAutoRotation('login');
  }

  ngOnDestroy(): void {
    Object.keys(this.carouselTimers).forEach((key) => {
      this.stopCarouselAutoRotation(key);
    });
    this.limpiarTemaPersonalizado();
  }

  verificarRegistroAutomatico(): void {
    // Verificar si el perfil es paciente y debemos mostrar el registro
    if (
      this.perfilSeleccionado === 'PACIENTE' &&
      localStorage.getItem('mostrarRegistroPrimero') === 'true'
    ) {
      setTimeout(() => {
        this.switchTab('register');
        // Eliminar la bandera para que no se repita
        localStorage.removeItem('mostrarRegistroPrimero');
      }, 300);
    }
  }

  cargarPerfilSeleccionado(): void {
    const perfil = localStorage.getItem('perfilSeleccionado');
    if (perfil) {
      this.perfilSeleccionado = perfil;
      this.mostrarIndicadorConTemporizador();
      // Aplicar tema inmediatamente después de que el DOM esté listo
      setTimeout(() => {
        this.aplicarTemaSegunPerfil(perfil);
        this.actualizarVistaSegunPerfil();
      }, 0);
    }
  }

  escucharCambiosPerfil(): void {
    // Escuchar eventos storage (cambios desde otras pestañas)
    window.addEventListener('storage', (event) => {
      if (event.key === 'perfilSeleccionado') {
        const perfil = event.newValue;
        if (perfil && perfil !== this.perfilSeleccionado) {
          this.perfilSeleccionado = perfil;
          this.mostrarIndicadorConTemporizador();
          setTimeout(() => {
            this.aplicarTemaSegunPerfil(perfil);
            this.actualizarVistaSegunPerfil();
            // Si cambió a paciente, verificar si mostrar registro
            if (perfil === 'PACIENTE') {
              this.verificarRegistroAutomatico();
            }
          }, 0);
        }
      }
    });

    // Escuchar eventos personalizados (cambios desde la misma pestaña)
    window.addEventListener('perfilCambiado', (event: any) => {
      const perfil = event.detail.perfil;
      if (perfil && perfil !== this.perfilSeleccionado) {
        this.perfilSeleccionado = perfil;
        this.mostrarIndicadorConTemporizador();
        setTimeout(() => {
          this.aplicarTemaSegunPerfil(perfil);
          this.actualizarVistaSegunPerfil();
          // Si cambió a paciente, verificar si mostrar registro
          if (perfil === 'PACIENTE') {
            this.verificarRegistroAutomatico();
          }
        }, 0);
      }
    });
  }

  actualizarVistaSegunPerfil(): void {
    // Forzar la detección de cambios en Angular
    this.cdr.detectChanges();

    // Si estamos en registro y cambiamos a un perfil que no es paciente, volver a login
    if (this.activeTab === 'register' && this.perfilSeleccionado !== 'PACIENTE') {
      this.switchTab('login');
    }
  }

  // ============================================================
  // 🔐 MÉTODO DE LOGIN CON BACKEND REAL - ACTUALIZADO
  // ============================================================
  onLoginSubmit(): void {
    console.log('=== INICIO LOGIN ===');
    console.log('1. Datos del formulario:', this.loginData);
    console.log('2. Perfil seleccionado:', this.perfilSeleccionado);

    // ✅ Validar correo en lugar de cédula
    if (!this.loginData.correo || !this.loginData.password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // ✅ Validar formato de correo básico
    if (!this.loginData.correo.includes('@') || !this.loginData.correo.includes('.')) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    // Determinar el tipo de usuario
    let tipoUsuario = 'PACIENTE';
    if (this.perfilSeleccionado === 'ADMINISTRADOR') {
      tipoUsuario = 'ADMINISTRADOR';
    } else if (this.perfilSeleccionado === 'MEDICO') {
      tipoUsuario = 'MEDICO';
    } else if (this.perfilSeleccionado === 'PACIENTE') {
      tipoUsuario = 'PACIENTE';
    }

    console.log('3. Tipo de usuario determinado:', tipoUsuario);

    // Mostrar loading
    Swal.fire({
      title: 'Iniciando sesión...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    console.log('4. Llamando a authService.login...');

    // 🔥 LLAMAR AL SERVICIO DE AUTENTICACIÓN CON CORREO
    this.authService.login(this.loginData.correo, this.loginData.password, tipoUsuario).subscribe({
      next: (response) => {
        console.log('5. ✅ Respuesta recibida:', response);

        Swal.close();

        if (response.success && response.data) {
          console.log('6. ✅ Login exitoso, datos del usuario:', response.data);

          const userData = response.data;

          // Construir nombre completo para mostrar
          const nombreCompleto = [
            userData.primer_nombre || userData.primer_nombre,
            userData.primer_apellido || userData.primer_apellido,
          ]
            .filter(Boolean)
            .join(' ');

          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido/a!',
            html: `<strong>${nombreCompleto}</strong><br><small>Rol: ${userData.rol}</small>`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => {
            console.log('7. Redirigiendo...');
            this.loginData.correo = ''; // ✅ Limpiar correo
            this.loginData.password = '';
            if (userData.status === 'PASSWORD_CHANGE_REQUIRED') {
              console.log('A cambiar password....');
              console.log(userData.status);
              this.router.navigate(['/change-password']);
              return;
            }
            this.redirectToDashboard(userData.rol);
          });
        } else {
          console.log('6. ❌ Login fallido:', response.message);

          Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: response.message || 'Credenciales incorrectas',
            confirmButtonColor: '#ef4444',
          });
        }
      },
      error: (error) => {
        console.log('5. ❌ ERROR en la petición:', error);
        console.log('   - Status:', error.status);
        console.log('   - StatusText:', error.statusText);
        console.log('   - Error completo:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
          confirmButtonColor: '#ef4444',
        });
      },
    });
  }

  // ============================================================
  // 📝 MÉTODO DE REGISTRO CON BACKEND REAL (SOLO PACIENTES)
  // ============================================================
  onRegisterSubmit(): void {
    if (
      !this.registerData.cedula ||
      !this.registerData.primer_nombre ||
      !this.registerData.primer_apellido ||
      !this.registerData.password
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa los campos obligatorios (*)',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor, verifica que ambas contraseñas sean iguales',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    // Deshabilitar el botón mientras se procesa
    const btnSubmit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = 'Registrando...';
    }

    // Mostrar loading
    Swal.fire({
      title: 'Registrando...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // Preparar datos para enviar (siempre como paciente)
    const registerRequest = {
      cedula: this.registerData.cedula,
      primer_nombre: this.registerData.primer_nombre,
      segundo_nombre: this.registerData.segundo_nombre || undefined,
      primer_apellido: this.registerData.primer_apellido,
      segundo_apellido: this.registerData.segundo_apellido || undefined,
      correo: this.registerData.correo || undefined,
      telefono: this.registerData.telefono || undefined,
      fecha_nacimiento: this.registerData.fecha_nacimiento || undefined,
      password: this.registerData.password,
      tipo_usuario: 'paciente' as const,
      discapacidad: this.registerData.discapacidad || false,
    };

    // 🔥 LLAMAR AL SERVICIO DE REGISTRO
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            html: '¡Tu cuenta de paciente ha sido creada!<br><br>Ahora puedes iniciar sesión con tus credenciales.',
            confirmButtonColor: '#10b981',
          }).then(() => {
            // Limpiar formulario y cambiar a login
            this.resetRegisterForm();
            this.switchTab('login');
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error en el registro',
            text: response.message || 'No se pudo completar el registro',
            confirmButtonColor: '#ef4444',
          });

          // Re-habilitar el botón
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Registrar Paciente';
          }
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
          confirmButtonColor: '#ef4444',
        });

        // Re-habilitar el botón
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerText = 'Registrar Paciente';
        }
      },
    });
  }

  // ============================================================
  // 🔀 MÉTODO DE REDIRECCIÓN ACTUALIZADO
  // ============================================================
  redirectToDashboard(rol: string): void {
    setTimeout(() => {
      // Normalizar el rol a mayúsculas para comparación
      const rolNormalizado = rol.toUpperCase();

      if (rolNormalizado === 'ADMINISTRADOR' || rolNormalizado === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (rolNormalizado === 'MÉDICO' || rolNormalizado === 'MEDICO') {
        this.router.navigate(['/medico/dashboard']);
      } else if (rolNormalizado === 'PACIENTE') {
        this.router.navigate(['/paciente/dashboard']);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Rol no reconocido: ' + rol,
          confirmButtonColor: '#ef4444',
        });
      }
    }, 100);
  }

  // ============================================================
  // 🎨 MÉTODOS DE UI Y CARRUSEL
  // ============================================================
  mostrarIndicadorConTemporizador(): void {
    this.mostrarIndicadorPerfil = true;

    setTimeout(() => {
      const indicator = document.querySelector('.perfil-indicator');
      if (indicator) {
        indicator.classList.add('fade-out');
      }
    }, 3000);

    setTimeout(() => {
      this.mostrarIndicadorPerfil = false;
    }, 5000);
  }

  aplicarTemaSegunPerfil(perfil: string): void {
    // Aplicar tema a todos los contenedores de autenticación
    const allContainers = document.querySelectorAll('.auth-container');

    allContainers.forEach((container) => {
      // Primero limpiar todos los temas
      container.removeAttribute('data-theme');

      if (perfil === 'ADMINISTRADOR') {
        container.setAttribute('data-theme', 'admin');
      } else if (perfil === 'MEDICO') {
        container.setAttribute('data-theme', 'medico');
      } else if (perfil === 'PACIENTE') {
        container.setAttribute('data-theme', 'paciente');
      }
    });

    // También aplicar clase al body para tema global
    document.body.setAttribute('data-perfil', perfil.toLowerCase());
  }

  limpiarTemaPersonalizado(): void {
    const containers = document.querySelectorAll('.auth-container');
    containers.forEach((container) => {
      container.removeAttribute('data-theme');
    });
  }

  // Verificar si se debe mostrar la pestaña de registro
  // Solo los pacientes pueden registrarse
  mostrarRegistro(): boolean {
    return this.perfilSeleccionado === 'PACIENTE';
  }

  switchTab(tab: 'login' | 'register' | 'recover'): void {
    this.activeTab = tab;
    this.recoveryStep = 1;
    this.startCarouselAutoRotation(tab);

    setTimeout(() => {
      if (this.perfilSeleccionado) {
        this.aplicarTemaSegunPerfil(this.perfilSeleccionado);
      }
    }, 100);
  }

  logout(): void {
    this.isAuthenticated = false;
    this.currentUserRole = '';
    localStorage.removeItem('lactaCareUser');
    localStorage.removeItem('perfilSeleccionado');
    this.router.navigate(['/login']);
  }

  resetRegisterForm(): void {
    this.registerData = {
      cedula: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      correo: '',
      telefono: '',
      fecha_nacimiento: '',
      password: '',
      confirmPassword: '',
      discapacidad: false,
    };
  }

  // Métodos del carrusel
  startCarouselAutoRotation(tab: string): void {
    this.stopCarouselAutoRotation(tab);
    this.carouselTimers[tab] = setInterval(() => {
      this.nextSlide(tab);
    }, 5000);
  }

  stopCarouselAutoRotation(tab: string): void {
    if (this.carouselTimers[tab]) {
      clearInterval(this.carouselTimers[tab]);
      delete this.carouselTimers[tab];
    }
  }

  goToSlide(tab: string, index: number): void {
    this.currentSlideIndex[tab] = index;
    this.resetCarouselTimer(tab);
  }

  nextSlide(tab: string): void {
    const slides = this.carouselSlides[tab];
    this.currentSlideIndex[tab] = (this.currentSlideIndex[tab] + 1) % slides.length;
    this.resetCarouselTimer(tab);
  }

  prevSlide(tab: string): void {
    const slides = this.carouselSlides[tab];
    this.currentSlideIndex[tab] = (this.currentSlideIndex[tab] - 1 + slides.length) % slides.length;
    this.resetCarouselTimer(tab);
  }

  resetCarouselTimer(tab: string): void {
    this.stopCarouselAutoRotation(tab);
    this.startCarouselAutoRotation(tab);
  }

  // Métodos para recuperación de contraseña
  getPasswordStrength(password: string): { width: string; class: string; text: string } {
    if (!password) {
      return { width: '0%', class: '', text: 'Seguridad: Muy débil' };
    }

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    if (strength <= 1) {
      return { width: '25%', class: 'strength-weak', text: 'Seguridad: Muy débil' };
    } else if (strength === 2) {
      return { width: '25%', class: 'strength-weak', text: 'Seguridad: Débil' };
    } else if (strength === 3) {
      return { width: '50%', class: 'strength-fair', text: 'Seguridad: Regular' };
    } else if (strength === 4) {
      return { width: '75%', class: 'strength-good', text: 'Seguridad: Buena' };
    } else {
      return { width: '100%', class: 'strength-strong', text: 'Seguridad: Excelente' };
    }
  }

  onRecoveryStep1(): void {
    if (!this.recoveryData.correo.includes('@') || !this.recoveryData.correo.includes('.')) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    this.recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.recoveryStep = 2;

    Swal.fire({
      icon: 'success',
      title: 'Código enviado',
      html: `Se ha enviado un código a <strong>${this.recoveryData.correo}</strong><br><br><small>Para esta demostración, el código es: <strong>${this.recoveryCode}</strong></small>`,
      confirmButtonColor: '#3b82f6',
    });
  }

  onRecoveryStep2(): void {
    if (this.recoveryData.code !== this.recoveryCode) {
      Swal.fire({
        icon: 'error',
        title: 'Código incorrecto',
        text: 'El código ingresado no es válido. Intenta nuevamente.',
        confirmButtonColor: '#ef4444',
      });
      return;
    }
    this.recoveryStep = 3;
  }

  onRecoveryStep3(): void {
    if (this.recoveryData.newPassword !== this.recoveryData.confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor, verifica que ambas contraseñas sean iguales',
        confirmButtonColor: '#ef4444',
      });
      return;
    }

    if (this.recoveryData.newPassword.length < 8) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 8 caracteres',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    this.recoveryStep = 4;
  }

  // Métodos para botones de prueba (solo para desarrollo)
  fillAdminCredentials(): void {
    this.loginData.correo = 'admin@lactapp.com'; // ✅ Administrador
    this.loginData.password = 'Ads726a';
  }

  fillDoctorCredentials(): void {
    this.loginData.correo = 'medico@lactapp.com'; // ✅ Medico
    this.loginData.password = 'Ads726a';
  }

  fillPacienteCredentials(): void {
    this.loginData.correo = 'gls@gmail.com'; // ✅ Paciente
    this.loginData.password = 'Ads726az';
  }
}
