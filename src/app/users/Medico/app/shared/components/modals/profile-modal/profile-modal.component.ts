import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(
    private modalService: ModalService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.resetEditedProfile();
  }

  onClose() {
    this.closeModal.emit();
    this.modalService.close();
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.editedProfile = { ...this.profileData };
      // Convertir fecha si existe
      if (this.editedProfile.fecha_nacimiento) {
        this.editedProfile.fecha_nacimiento = new Date(this.editedProfile.fecha_nacimiento).toISOString().split('T')[0];
      }
    } else {
      this.resetEditedProfile();
    }
  }

  resetEditedProfile() {
    this.editedProfile = {
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      correo: '',
      telefono: '',
      fecha_nacimiento: '',
      cedula: '',
      rol: ''
    };
    
    if (this.profileData) {
      Object.assign(this.editedProfile, this.profileData);
      if (this.editedProfile.fecha_nacimiento) {
        this.editedProfile.fecha_nacimiento = new Date(this.editedProfile.fecha_nacimiento).toISOString().split('T')[0];
      }
    }
  }

  saveProfile() {
    if (this.validateProfile()) {
      this.profileUpdated.emit(this.editedProfile);
      this.editMode = false;
      alert('✅ Perfil actualizado exitosamente');
    }
  }

  validateProfile(): boolean {
    if (!this.editedProfile.primer_nombre.trim()) {
      alert('El primer nombre es requerido');
      return false;
    }
    if (!this.editedProfile.primer_apellido.trim()) {
      alert('El primer apellido es requerido');
      return false;
    }
    if (!this.editedProfile.correo.includes('@')) {
      alert('Ingrese un correo electrónico válido');
      return false;
    }
    return true;
  }

  getPasswordStrength(password: string): { width: string; class: string; text: string } {
    return this.authService.getPasswordStrength(password);
  }

  getNombreCompleto(): string {
    const nombres = [this.editedProfile.primer_nombre, this.editedProfile.segundo_nombre].filter(Boolean).join(' ');
    const apellidos = [this.editedProfile.primer_apellido, this.editedProfile.segundo_apellido].filter(Boolean).join(' ');
    return `${nombres} ${apellidos}`.trim();
  }
}