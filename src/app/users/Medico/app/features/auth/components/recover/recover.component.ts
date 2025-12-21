import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, FormsModule, CarouselComponent],
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.scss']
})
export class RecoverComponent {
  @Output() recoverSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  
  recoveryData = {
    correo: '',
    code: '',
    newPassword: '',
    confirmNewPassword: ''
  };
  
  recoveryStep: 1 | 2 | 3 | 4 = 1;
  recoveryCode: string = '';
  
  carouselSlides = [
    {
      image: 'https://bbtipsmexico.com.mx/wp-content/uploads/2023/07/07_LactanciaMaterna_BbTips.jpg.avif',
      title: 'Seguridad Garantizada',
      description: 'Nuestro sistema utiliza encriptación de última generación para proteger toda la información médica.'
    },
    {
      image: 'https://bbtipsmexico.com.mx/wp-content/uploads/2023/07/07_LactanciaMaterna_BbTips.jpg.avif',
      title: 'Soporte 24/7',
      description: 'Equipo de soporte técnico disponible las 24 horas para asistencia inmediata con tu cuenta.'
    },
    {
      image: 'https://bbtipsmexico.com.mx/wp-content/uploads/2023/07/07_LactanciaMaterna_BbTips.jpg.avif',
      title: 'Verificación de Identidad',
      description: 'Proceso seguro de verificación en múltiples pasos para garantizar la protección de tu cuenta.'
    }
  ];

  constructor(private authService: AuthService) {}

  onRecoveryStep1(): void {
    if (!this.recoveryData.correo.includes('@') || !this.recoveryData.correo.includes('.')) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }
    
    this.recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.recoveryStep = 2;
    
    alert(`Código enviado a ${this.recoveryData.correo}\nPara esta demostración, el código es: ${this.recoveryCode}`);
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
    console.log('Password reset for:', this.recoveryData.correo);
  }

  getPasswordStrength(password: string): { width: string; class: string; text: string } {
    return this.authService.getPasswordStrength(password);
  }
}