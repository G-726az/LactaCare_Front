import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { ModalService } from '../../../../core/services/modal.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss']
})
export class ProfileModalComponent implements OnInit {
  @Input() profileData: any;
  @Output() closeModal = new EventEmitter<void>();
  @Output() profileUpdated = new EventEmitter<any>();
  
  editMode = false;
  editedProfile: any;
  today = new Date();
  originalProfile: any;

  constructor(
    private modalService: ModalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.resetEditedProfile();
    this.originalProfile = this.profileData ? { ...this.profileData } : null;
    
    // Configurar SweetAlert globalmente para que tenga z-index alto
    this.configureSweetAlert();
  }

  // Configurar SweetAlert para que se muestre sobre el modal
  private configureSweetAlert(): void {
    // Sobrescribir el método _main de SweetAlert para ajustar z-index
    const originalOpen = (Swal as any).fire;
    (Swal as any).fire = function(...args: any[]) {
      const swalInstance = originalOpen.apply(this, args);
      
      // Ajustar z-index después de que se abra el modal
      setTimeout(() => {
        const container = document.querySelector('.swal2-container') as HTMLElement;
        const popup = document.querySelector('.swal2-popup') as HTMLElement;
        
        if (container) {
          container.style.zIndex = '20000';
        }
        if (popup) {
          popup.style.zIndex = '20001';
        }
      }, 10);
      
      return swalInstance;
    };
  }

  onClose() {
    if (this.editMode) {
      Swal.fire({
        title: '¿Cerrar perfil?',
        text: 'Tienes cambios sin guardar. ¿Estás seguro de cerrar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar',
        cancelButtonText: 'Seguir editando',
        customClass: {
          container: 'swal2-high-zindex'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.closeModal.emit();
          this.modalService.close();
        }
      });
    } else {
      this.closeModal.emit();
      this.modalService.close();
    }
  }

  toggleEdit() {
    if (this.editMode) {
      this.cancelEdit();
    } else {
      this.editMode = true;
      this.editedProfile = { ...this.profileData };
      if (this.editedProfile.fecha_nacimiento) {
        const fecha = new Date(this.editedProfile.fecha_nacimiento);
        this.editedProfile.fecha_nacimiento = fecha.toISOString().split('T')[0];
      }
    }
  }

  cancelEdit() {
    Swal.fire({
      title: '¿Cancelar edición?',
      text: 'Los cambios no guardados se perderán',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6c757d',
      cancelButtonColor: '#1976d2',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Seguir editando',
      customClass: {
        container: 'swal2-high-zindex'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.editMode = false;
        this.resetEditedProfile();
      }
    });
  }

  resetEditedProfile() {
    this.editedProfile = {
      primer_nombre: 'Carlos',
      segundo_nombre: '',
      primer_apellido: 'Ruiz',
      segundo_apellido: '',
      cedula: '1723456789',
      correo: 'c.ruiz@lactacare.com',
      telefono: '0987654321',
      fecha_nacimiento: '1978-11-22',
      rol: 'Médico',
      nombre_completo: 'Carlos Ruiz'
    };
    
    if (this.profileData) {
      Object.assign(this.editedProfile, this.profileData);
      if (this.editedProfile.fecha_nacimiento) {
        try {
          const fecha = new Date(this.editedProfile.fecha_nacimiento);
          if (!isNaN(fecha.getTime())) {
            this.editedProfile.fecha_nacimiento = fecha.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn('Error al parsear fecha de nacimiento:', e);
        }
      }
    }
  }

  saveProfile() {
    if (this.validateProfile()) {
      Swal.fire({
        title: '¿Guardar cambios?',
        text: 'Se actualizará la información de tu perfil médico',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        customClass: {
          container: 'swal2-high-zindex'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.editedProfile.fecha_nacimiento) {
            this.editedProfile.fecha_nacimiento = new Date(this.editedProfile.fecha_nacimiento).toISOString();
          }
          
          this.editedProfile.nombre_completo = this.getNombreCompleto();
          
          if (this.profileData?.id_usuario) {
            const updatedUser = this.authService.updateProfile(
              this.profileData.id_usuario,
              this.editedProfile
            );
            
            if (updatedUser) {
              this.profileUpdated.emit(updatedUser);
              this.editMode = false;
              
              // Mostrar éxito
              this.showSweetAlert('¡Perfil Actualizado!', '✅ Tu información médica ha sido actualizada exitosamente', 'success');
            } else {
              this.showSweetAlert('Error', 'No se pudo actualizar el perfil', 'error');
            }
          } else {
            this.profileUpdated.emit(this.editedProfile);
            this.editMode = false;
            this.showSweetAlert('¡Perfil Actualizado!', '✅ Tu información médica ha sido actualizada exitosamente', 'success');
          }
        }
      });
    }
  }

  validateProfile(): boolean {
    const errors = [];
    
    if (!this.editedProfile.primer_nombre?.trim()) {
      errors.push('El primer nombre es requerido');
    }
    
    if (!this.editedProfile.primer_apellido?.trim()) {
      errors.push('El primer apellido es requerido');
    }
    
    if (!this.editedProfile.correo?.trim()) {
      errors.push('El correo electrónico es requerido');
    } else if (!this.isValidEmail(this.editedProfile.correo)) {
      errors.push('Ingrese un correo electrónico válido');
    }
    
    if (this.editedProfile.telefono && !this.isValidPhone(this.editedProfile.telefono)) {
      errors.push('Ingrese un número de teléfono válido (10 dígitos)');
    }
    
    if (errors.length > 0) {
      this.showSweetAlert(
        'Error de validación',
        `<div class="text-left">
          <p class="mb-2">Por favor corrige los siguientes errores:</p>
          <ul class="list-disc pl-4">
            ${errors.map(error => `<li class="mb-1">${error}</li>`).join('')}
          </ul>
        </div>`,
        'error'
      );
      return false;
    }
    
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  getNombreCompleto(): string {
    const nombres = [this.editedProfile.primer_nombre, this.editedProfile.segundo_nombre]
      .filter(Boolean)
      .join(' ');
    
    const apellidos = [this.editedProfile.primer_apellido, this.editedProfile.segundo_apellido]
      .filter(Boolean)
      .join(' ');
    
    return `${nombres} ${apellidos}`.trim();
  }

  // Método helper para SweetAlert con clase personalizada
  private showSweetAlert(title: string, html: string, icon: 'success' | 'error' | 'info' | 'warning' | 'question'): void {
    Swal.fire({
      title,
      html,
      icon,
      confirmButtonColor: icon === 'error' ? '#dc3545' : '#1976d2',
      confirmButtonText: 'Aceptar',
      customClass: {
        container: 'swal2-high-zindex'
      }
    });
  }

  exportToPDF(): void {
    // Mostrar loading
    Swal.fire({
      title: 'Generando PDF...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        container: 'swal2-high-zindex'
      }
    });

    // Crear contenido HTML para el PDF
    const pdfContent = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1976d2;">LactaCare - Perfil Médico</h1>
          <p style="color: #666;">Sistema de Gestión de Lactarios</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
        </div>
        
        <div style="display: flex; align-items: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; background: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px;">
            <span style="font-size: 24px; color: #1976d2;">👨‍⚕️</span>
          </div>
          <div>
            <h2 style="margin: 0; color: #1f2937;">${this.getNombreCompleto()}</h2>
            <p style="margin: 5px 0; color: #1976d2; font-weight: bold;">${this.editedProfile.rol || 'Médico'}</p>
            <p style="margin: 5px 0; color: #6b7280;">Miembro desde: ${this.today.getFullYear()}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e3a8a; border-bottom: 2px solid #e3f2fd; padding-bottom: 10px;">
            <span>📋</span> Información Personal
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Primer Nombre:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.primer_nombre || ''}</td>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Segundo Nombre:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.segundo_nombre || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Primer Apellido:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.primer_apellido || ''}</td>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Segundo Apellido:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.segundo_apellido || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Cédula:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.cedula || ''}</td>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Fecha Nacimiento:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.formatDate(this.editedProfile.fecha_nacimiento)}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e3a8a; border-bottom: 2px solid #e3f2fd; padding-bottom: 10px;">
            <span>📞</span> Información de Contacto
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #eee; width: 30%;"><strong>Correo Electrónico:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.correo || ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Teléfono:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.telefono || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e3a8a; border-bottom: 2px solid #e3f2fd; padding-bottom: 10px;">
            <span>🔒</span> Información del Sistema
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Rol:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;">${this.editedProfile.rol || 'Médico'}</td>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Estado:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee; color: #059669;"><strong>Activo</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Último Acceso:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;" colspan="3">${this.today.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #eee;"><strong>Especialidad:</strong></td>
              <td style="padding: 8px; border: 1px solid #eee;" colspan="3">Pediatría - Lactancia</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px dashed #ddd;">
          <p style="color: #6b7280; font-size: 12px;">
            <strong>Nota:</strong> Este es un documento oficial del Sistema LactaCare.<br>
            Generado el ${this.today.toLocaleDateString('es-ES')} a las ${this.today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}<br>
            Firma digital: ${this.getNombreCompleto()}
          </p>
        </div>
      </div>
    `;

    // Crear elemento temporal para renderizar el HTML
    const element = document.createElement('div');
    element.innerHTML = pdfContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.width = '800px';
    document.body.appendChild(element);

    // Generar PDF
    setTimeout(() => {
      html2canvas(element).then(canvas => {
        const imgWidth = 190;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`perfil-medico-${this.getNombreCompleto().replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.pdf`);
        
        document.body.removeChild(element);
        Swal.close();
        
        this.showSweetAlert('✅ PDF Generado', 'Tu perfil médico ha sido exportado exitosamente', 'success');
      }).catch(error => {
        document.body.removeChild(element);
        Swal.close();
        this.showSweetAlert('Error', 'No se pudo generar el PDF', 'error');
      });
    }, 500);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  }
}