import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // 👈 IMPORTAR AuthService

interface CarouselSlide {
  image: string;
  title: string;
  description: string;
}

interface LoginData {
  identificacion: string;
  password: string;
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
  tipo_usuario: 'paciente' | 'empleado';
  rol_empleado: string;
  discapacidad: boolean;
}

interface RecoveryData {
  correo: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
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
    identificacion: '',
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
    tipo_usuario: 'paciente',
    rol_empleado: '',
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
        title: 'Únete a Nuestro Equipo',
        description: 'Forma parte de una comunidad con nuestro sistema LactaCare.',
      },
      {
        image:
          'https://elcomercio.pe/resizer/J19DiwBEdMckUk4yBJgJjOYmGvE=/640x0/smart/filters:format(jpeg):quality(75)/cloudfront-us-east-1.images.arcpublishing.com/elcomercio/3R4LKFH7J5FFPB7KFHCTNXSACI.jpg',
        title: 'Trabajo en Equipo',
        description:
          'Colabora con especialistas de diferentes áreas para brindar atención integral a los pacientes.',
      },
      {
        image: 'https://hospitalprivado.com.ar/uploads/cache/news_d_lactancia-materna-6388.jpg',
        title: 'Tecnología Avanzada',
        description:
          'Accede a herramientas digitales de vanguardia para gestión de pacientes y telemedicina.',
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

  // ============================================================
  // 🔑 CONSTRUCTOR CON DEPENDENCIAS INYECTADAS
  // ============================================================
  constructor(
    private router: Router,
    private authService: AuthService // 👈 INYECTAR AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el perfil seleccionado desde localStorage
    const perfil = localStorage.getItem('perfilSeleccionado');
    if (perfil) {
      this.perfilSeleccionado = perfil;
      this.aplicarTemaSegunPerfil(perfil);
      this.mostrarIndicadorConTemporizador();
    }

    // Verificar si ya hay sesión activa
    const savedUser = localStorage.getItem('lactaCareUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      this.isAuthenticated = true;
      this.currentUserRole = userData.rol;
      this.redirectToDashboard(userData.rol);
    }

    // Inicializar el carrusel
    this.startCarouselAutoRotation('login');
  }

  ngOnDestroy(): void {
    Object.keys(this.carouselTimers).forEach((key) => {
      this.stopCarouselAutoRotation(key);
    });
    this.limpiarTemaPersonalizado();
  }

  // ============================================================
  // 🔐 MÉTODO DE LOGIN CON BACKEND REAL
  // ============================================================
  onLoginSubmit(): void {
    if (!this.loginData.identificacion || !this.loginData.password) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // Determinar el tipo de usuario según el perfil seleccionado
    let tipoUsuario = 'PACIENTE'; // Default
    if (this.perfilSeleccionado === 'ADMINISTRADOR') {
      tipoUsuario = 'ADMINISTRADOR';
    } else if (this.perfilSeleccionado === 'MEDICO') {
      tipoUsuario = 'MEDICO';
    } else if (this.perfilSeleccionado === 'PACIENTE') {
      tipoUsuario = 'PACIENTE';
    }

    console.log('🔐 Intentando login:', {
      cedula: this.loginData.identificacion,
      tipoUsuario: tipoUsuario,
    });

    // Deshabilitar el botón mientras se procesa
    const btnSubmit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = 'Iniciando sesión...';
    }

    // 🔥 LLAMAR AL SERVICIO DE AUTENTICACIÓN
    this.authService
      .login(this.loginData.identificacion, this.loginData.password, tipoUsuario)
      .subscribe({
        next: (response) => {
          console.log('📦 Respuesta recibida:', response);

          if (response.success && response.data) {
            console.log('✅ Login exitoso');

            // Mensaje de bienvenida
            alert(`✅ Bienvenido/a, ${response.data.primer_nombre}\n📋 Rol: ${response.data.rol}`);

            // Limpiar formulario
            this.loginData.identificacion = '';
            this.loginData.password = '';

            // Redirigir según el rol
            this.redirectToDashboard(response.data.rol);
          } else {
            console.error('❌ Login fallido:', response.message);
            alert(`❌ Error: ${response.message}`);

            // Re-habilitar el botón
            if (btnSubmit) {
              btnSubmit.disabled = false;
              btnSubmit.innerText = 'Iniciar Sesión';
            }
          }
        },
        error: (error) => {
          console.error('❌ Error en login:', error);
          alert('❌ Error de conexión. Verifica que el backend esté corriendo.');

          // Re-habilitar el botón
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Iniciar Sesión';
          }
        },
      });
  }

  // ============================================================
  // 📝 MÉTODO DE REGISTRO CON BACKEND REAL
  // ============================================================
  onRegisterSubmit(): void {
    if (
      !this.registerData.cedula ||
      !this.registerData.primer_nombre ||
      !this.registerData.primer_apellido ||
      !this.registerData.password
    ) {
      alert('Por favor, completa los campos obligatorios (*)');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.registerData.tipo_usuario === 'empleado' && !this.registerData.rol_empleado) {
      alert('Por favor, selecciona un rol para el empleado');
      return;
    }

    console.log('📝 Intentando registro:', {
      cedula: this.registerData.cedula,
      tipo: this.registerData.tipo_usuario,
    });

    // Deshabilitar el botón mientras se procesa
    const btnSubmit = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = 'Registrando...';
    }

    // Preparar datos para enviar
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
      tipo_usuario: this.registerData.tipo_usuario,
      rol_empleado: this.registerData.rol_empleado || undefined,
      discapacidad: this.registerData.discapacidad || false,
    };

    // 🔥 LLAMAR AL SERVICIO DE REGISTRO
    this.authService.register(registerRequest).subscribe({
      next: (response) => {
        console.log('📦 Respuesta recibida:', response);

        if (response.success) {
          console.log('✅ Registro exitoso');

          const tipoRegistro =
            this.registerData.tipo_usuario === 'empleado' ? 'empleado' : 'paciente';
          alert(
            `✅ ¡Registro exitoso como ${tipoRegistro}!\n\n👤 Ahora puedes iniciar sesión con tus credenciales.`
          );

          // Limpiar formulario y cambiar a login
          this.resetRegisterForm();
          this.switchTab('login');
        } else {
          console.error('❌ Registro fallido:', response.message);
          alert(`❌ Error: ${response.message}`);

          // Re-habilitar el botón
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText =
              this.registerData.tipo_usuario === 'empleado'
                ? 'Registrar Empleado'
                : 'Registrar Paciente';
          }
        }
      },
      error: (error) => {
        console.error('❌ Error en registro:', error);
        alert('❌ Error de conexión. Verifica que el backend esté corriendo.');

        // Re-habilitar el botón
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerText =
            this.registerData.tipo_usuario === 'empleado'
              ? 'Registrar Empleado'
              : 'Registrar Paciente';
        }
      },
    });
  }

  // ============================================================
  // 🔀 MÉTODO DE REDIRECCIÓN ACTUALIZADO
  // ============================================================
  redirectToDashboard(rol: string): void {
    console.log('Redirigiendo a dashboard:', rol);

    setTimeout(() => {
      if (rol === 'Administrador' || rol === 'ADMIN') {
        this.router.navigate(['/admin/dashboard']);
      } else if (rol === 'Médico' || rol === 'MEDICO') {
        this.router.navigate(['/medico/dashboard']);
      } else if (rol === 'Paciente' || rol === 'PACIENTE') {
        this.router.navigate(['/paciente/dashboard']);
      } else {
        console.error('Rol no reconocido:', rol);
        alert('Error: Rol no reconocido');
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
    const loginContainer = document.querySelector('.auth-container.active');
    if (!loginContainer) return;

    if (perfil === 'ADMINISTRADOR') {
      loginContainer.setAttribute('data-theme', 'admin');
    } else if (perfil === 'MEDICO') {
      loginContainer.setAttribute('data-theme', 'medico');
    } else if (perfil === 'PACIENTE') {
      loginContainer.setAttribute('data-theme', 'paciente');
    }
  }

  limpiarTemaPersonalizado(): void {
    const containers = document.querySelectorAll('.auth-container');
    containers.forEach((container) => {
      container.removeAttribute('data-theme');
    });
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
      tipo_usuario: 'paciente',
      rol_empleado: '',
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
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    this.recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.recoveryStep = 2;
    alert(
      `Código enviado a ${this.recoveryData.correo}\nPara esta demostración, el código es: ${this.recoveryCode}`
    );
  }

  onRecoveryStep2(): void {
    if (this.recoveryData.code !== this.recoveryCode) {
      alert('Código incorrecto. Intenta nuevamente.');
      return;
    }
    this.recoveryStep = 3;
  }

  onRecoveryStep3(): void {
    if (this.recoveryData.newPassword !== this.recoveryData.confirmNewPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.recoveryData.newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    this.recoveryStep = 4;
  }

  // Métodos para botones de prueba (solo para desarrollo)
  fillAdminCredentials(): void {
    this.loginData.identificacion = '1712345678';
    this.loginData.password = 'empleado123';
  }

  fillDoctorCredentials(): void {
    this.loginData.identificacion = '1723456789';
    this.loginData.password = 'empleado123';
  }

  fillPacienteCredentials(): void {
    this.loginData.identificacion = '1756789012';
    this.loginData.password = 'madre2024';
  }
}
