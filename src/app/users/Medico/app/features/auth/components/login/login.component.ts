import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UsuarioSesion } from '../../../../core/models/database.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<UsuarioSesion>();
  @Output() switchToRegister = new EventEmitter<void>();
  @Output() switchToRecover = new EventEmitter<void>();
  
  loginData = {
    identificacion: '',
    password: ''
  };
  
  isLoading = false; // Nueva propiedad para controlar estado de carga
  
  carouselSlides = [
    {
      image: 'https://elcomercio-elcomercio-prod.web.arc-cdn.net/resizer/v2/WXXOZWDLPVAARDAFGQ5XLVQPHA.jpg?auth=5f8f1f2a4911679b4b9232016ff683d755d150b9e11288903dc68b16584ad078&width=640&smart=true&quality=75',
      title: 'Cuidado Médico Integral',
      description: 'Sistema diseñado para brindar la mejor atención médica con tecnología de vanguardia y personal especializado.'
    },
    {
      image: 'https://www.lechedeflorida.com/file/444/FDF_Banner_600x314-6.jpg',
      title: 'Tecnología Hospitalaria',
      description: 'Instalaciones equipadas con la última tecnología para diagnósticos precisos y tratamientos efectivos.'
    },
    {
      image: 'https://maternidad21.com/wp-content/uploads/2022/04/cuanto-dura-la-lactancia-materna-con-biberon-1024x576.jpg',
      title: 'Especialistas en Pediatría',
      description: 'Atención especializada para los más pequeños con enfoque en desarrollo y bienestar infantil.'
    }
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

    onLoginSubmit(): void {
      // Validar campos requeridos
      if (!this.loginData.identificacion || !this.loginData.password) {
        this.notificationService.showWarning(
          'Campos Requeridos',
          'Por favor, completa todos los campos'
        );
        return;
      }

    // Limpiar espacios en blanco
    this.loginData.identificacion = this.loginData.identificacion.trim();
    this.loginData.password = this.loginData.password.trim();

    // Verificar formato de identificación (opcional)
    if (this.loginData.identificacion.length < 5) {
      this.notificationService.showError(
        'Identificación Inválida',
        'La identificación debe tener al menos 5 caracteres'
      );
      return;
    }

    // Mostrar estado de carga
    this.isLoading = true;

    // Simular tiempo de carga para mejor experiencia de usuario
    setTimeout(() => {
      const user = this.authService.login(this.loginData.identificacion, this.loginData.password);
      
      if (user) {
        this.authService.saveUserSession(user);
        
        // Mostrar notificación de bienvenida
        this.notificationService.showWelcome(user);
        
        this.loginSuccess.emit(user);
        this.loginData = { identificacion: '', password: '' };
        
        // Mostrar mensaje adicional según rol
        this.showRoleSpecificMessage(user.rol);
      } else {
        this.notificationService.showError(
          'Credenciales Incorrectas',
          '💡 Datos de prueba:\n👨‍⚕️ Médico: 1723456789 / empleado123'
        );
      }
      
      this.isLoading = false;
    }, 1000); // Simular 1 segundo de carga
  }

  private showRoleSpecificMessage(rol: string): void {
    const messages: { [key: string]: { title: string; message: string } } = {
      'médico': {
        title: 'Bienvenido Médico',
        message: '👨‍⚕️ Acceso como médico especialista\n📋 Puedes ver lactarios, extracciones y temperatura de refrigeradores'
      },
      'administrador': {
        title: 'Bienvenido Administrador',
        message: '👔 Acceso como administrador\n⚙️ Puedes gestionar usuarios, roles y configuraciones del sistema'
      },
      'enfermera': {
        title: 'Bienvenida Enfermera',
        message: '👩‍⚕️ Acceso como enfermera\n💉 Puedes registrar extracciones y monitorear pacientes'
      },
      'paciente': {
        title: 'Bienvenido Paciente',
        message: '👤 Acceso como paciente\n📅 Puedes ver tu historial y agendar citas'
      }
    };

    const messageConfig = messages[rol.toLowerCase()] || {
      title: 'Bienvenido',
      message: `Acceso como ${rol}`
    };

    // Mostrar notificación específica del rol (opcional)
    setTimeout(() => {
      this.notificationService.showInfo(messageConfig.title, messageConfig.message);
    }, 500);
  }

  fillTestCredentials(): void {
    this.loginData.identificacion = '1723456789';
    this.loginData.password = 'empleado123';
    
    // Mostrar notificación informativa
    this.notificationService.showInfo(
      'Credenciales de Prueba',
      'Se han cargado las credenciales de prueba. Haz clic en "Iniciar Sesión" para continuar.'
    );
  }

  onSwitchToRegister(): void {
    this.switchToRegister.emit();
  }

  onSwitchToRecover(): void {
    this.switchToRecover.emit();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLoginSubmit();
    }
  }

  clearForm(): void {
    this.loginData = { identificacion: '', password: '' };
    
    // Mostrar notificación informativa
    this.notificationService.showInfo(
      'Formulario Limpiado',
      'Los campos han sido limpiados. Puedes ingresar nuevas credenciales.'
    );
  }
}