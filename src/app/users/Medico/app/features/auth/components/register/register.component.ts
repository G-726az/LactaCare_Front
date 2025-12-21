import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioSesion } from '../../../../core/models/database.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  @Output() registerSuccess = new EventEmitter<UsuarioSesion>();
  @Output() switchToLogin = new EventEmitter<void>();
  
  registerData = {
    cedula: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo: '',
    telefono: '',
    fecha_nacimiento: '',
    password: '',
    confirmPassword: ''
  };
  
  carouselSlides = [
    {
      image: 'https://elcomercio-elcomercio-prod.web.arc-cdn.net/resizer/v2/DA5B52BEFBE3VHQPLKNEIEXXEQ.jpg?auth=2321de0d25ee909772a6f6f0ce2414748c266afdcbd4632db441167d74313a92&width=640&smart=true&quality=75',
      title: 'Únete a Nuestro Equipo',
      description: 'Forma parte de una comunidad con nuestro sistema LactaCare.'
    },
    {
      image: 'https://elcomercio.pe/resizer/J19DiwBEdMckUk4yBJgJjOYmGvE=/640x0/smart/filters:format(jpeg):quality(75)/cloudfront-us-east-1.images.arcpublishing.com/elcomercio/3R4LKFH7J5FFPB7KFHCTNXSACI.jpg',
      title: 'Trabajo en Equipo',
      description: 'Colabora con especialistas de diferentes áreas para brindar atención integral a los pacientes.'
    },
    {
      image: 'https://hospitalprivado.com.ar/uploads/cache/news_d_lactancia-materna-6388.jpg',
      title: 'Tecnología Avanzada',
      description: 'Accede a herramientas digitales de vanguardia para gestión de pacientes y telemedicina.'
    }
  ];

  constructor(private authService: AuthService) {}

  onRegisterSubmit(): void {
    if (!this.registerData.cedula || !this.registerData.primer_nombre || !this.registerData.primer_apellido || !this.registerData.correo) {
      alert('Por favor, completa los campos obligatorios (*)');
      return;
    }
    
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    if (this.registerData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    const user = this.authService.register(this.registerData);
    
    if (user) {
      this.authService.saveUserSession(user);
      
      alert(`✅ ¡Registro exitoso!\n\n👨‍⚕️ Bienvenido/a, Dr./Dra. ${user.nombre_completo}\n📋 Ya puedes acceder al panel médico.`);
      
      this.registerSuccess.emit(user);
      this.resetForm();
    } else {
      alert('Esta cédula ya está registrada en el sistema');
    }
  }

  getPasswordStrength(password: string): { width: string; class: string; text: string } {
    return this.authService.getPasswordStrength(password);
  }

  private resetForm(): void {
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
      confirmPassword: ''
    };
  }
}