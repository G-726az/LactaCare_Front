import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

interface CambiarPasswordInicialRequest {
  correo: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePasswordComponent {
  changePasswordData: CambiarPasswordInicialRequest = {
    correo: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {}

  editPasswordInicial() {
    if (
      !this.changePasswordData.correo ||
      !this.changePasswordData.currentPassword ||
      !this.changePasswordData.newPassword
    ) {
      this.notificationService.error('Por favor, complete todos los campos obligatorios.');
      return;
    }

    if (this.changePasswordData.newPassword !== this.changePasswordData.confirmNewPassword) {
      this.notificationService.error('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    this.authService
      .changePassword(
        this.changePasswordData.correo,
        this.changePasswordData.currentPassword,
        this.changePasswordData.newPassword
      )
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña cambiada',
            text: 'Por favor haga login con sus nuevas credenciales',
          });
          this.cerrarSesion();
        },
      });
    error: () => {
      this.notificationService.error(
        'Error al cambiar la contraseña. Por favor, verifique sus datos e intente nuevamente.'
      );
    };
  }

  onSubmit() {
    this.editPasswordInicial();
  }

  cerrarSesion() {
    this.notificationService.info('Por favor haga login con sus nuevas credenciales');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
