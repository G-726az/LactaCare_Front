import { Injectable } from '@angular/core';
import { PersonaEmpleado, Roles, UsuarioSesion } from '../models/database.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private rolesBD: Roles[] = [
    { Id_roles: 2, Nombre_rol: 'Médico' }
  ];
  
  private empleadosBD: PersonaEmpleado[] = [
    {
      Id_PerEmpleado: 1,
      Perfil_empleado_img: 'assets/profiles/doctor.jpg',
      Cedula: '1723456789',
      Primer_nombre: 'Carlos',
      Segundo_nombre: 'Alberto',
      Primer_apellido: 'Ruiz',
      Segundo_apellido: 'Méndez',
      Correo: 'c.ruiz@lactacare.com',
      Telefono: '0987654321',
      Fechanacimiento: new Date('1978-11-22'),
      Rol_empleado: 2,
    }
  ];

  constructor() {
    // Cargar datos del localStorage si existen
    const savedEmpleados = localStorage.getItem('lactaCareEmpleados');
    if (savedEmpleados) {
      this.empleadosBD = JSON.parse(savedEmpleados);
    }
  }

  login(identificacion: string, password: string): UsuarioSesion | null {
    // Buscar como empleado (médico)
    const usuarioEncontrado = this.empleadosBD.find(
      emp => emp.Cedula === identificacion
    );
    
    if (!usuarioEncontrado || password !== 'empleado123') {
      return null;
    }
    
    const rolInfo = this.rolesBD.find(r => r.Id_roles === usuarioEncontrado.Rol_empleado);
    const segundoNombre = usuarioEncontrado.Segundo_nombre ? ` ${usuarioEncontrado.Segundo_nombre}` : '';
    const segundoApellido = usuarioEncontrado.Segundo_apellido ? ` ${usuarioEncontrado.Segundo_apellido}` : '';
    const nombreCompleto = `${usuarioEncontrado.Primer_nombre}${segundoNombre} ${usuarioEncontrado.Primer_apellido}${segundoApellido}`.trim();
    
    return {
      id: usuarioEncontrado.Id_PerEmpleado,
      cedula: usuarioEncontrado.Cedula,
      nombre_completo: nombreCompleto,
      primer_nombre: usuarioEncontrado.Primer_nombre,
      primer_apellido: usuarioEncontrado.Primer_apellido,
      correo: usuarioEncontrado.Correo,
      telefono: usuarioEncontrado.Telefono,
      tipo: 'empleado',
      rol: rolInfo?.Nombre_rol || 'Médico',
      rol_id: usuarioEncontrado.Rol_empleado,
      fecha_nacimiento: usuarioEncontrado.Fechanacimiento,
      perfil_img: usuarioEncontrado.Perfil_empleado_img
    };
  }

  register(registerData: any): UsuarioSesion | null {
    // Validar que la cédula no exista
    const cedulaExiste = this.empleadosBD.some(
      emp => emp.Cedula === registerData.cedula
    );
    
    if (cedulaExiste) {
      return null;
    }
    
    // Crear nuevo médico
    const nuevoMedico: PersonaEmpleado = {
      Id_PerEmpleado: this.empleadosBD.length + 1,
      Perfil_empleado_img: 'assets/profiles/default.jpg',
      Cedula: registerData.cedula,
      Primer_nombre: registerData.primer_nombre,
      Segundo_nombre: registerData.segundo_nombre || '',
      Primer_apellido: registerData.primer_apellido,
      Segundo_apellido: registerData.segundo_apellido || '',
      Correo: registerData.correo,
      Telefono: registerData.telefono || '',
      Fechanacimiento: registerData.fecha_nacimiento ? new Date(registerData.fecha_nacimiento) : new Date(),
      Rol_empleado: 2
    };
    
    // Agregar a la lista
    this.empleadosBD.push(nuevoMedico);
    
    // Guardar en localStorage
    localStorage.setItem('lactaCareEmpleados', JSON.stringify(this.empleadosBD));
    
    const rolInfo = this.rolesBD.find(r => r.Id_roles === nuevoMedico.Rol_empleado);
    const nombreCompleto = `${nuevoMedico.Primer_nombre} ${nuevoMedico.Primer_apellido}`.trim();
    
    return {
      id: nuevoMedico.Id_PerEmpleado,
      cedula: nuevoMedico.Cedula,
      nombre_completo: nombreCompleto,
      primer_nombre: nuevoMedico.Primer_nombre,
      primer_apellido: nuevoMedico.Primer_apellido,
      correo: nuevoMedico.Correo,
      telefono: nuevoMedico.Telefono,
      tipo: 'empleado',
      rol: rolInfo?.Nombre_rol || 'Médico',
      rol_id: nuevoMedico.Rol_empleado,
      fecha_nacimiento: nuevoMedico.Fechanacimiento,
      perfil_img: nuevoMedico.Perfil_empleado_img
    };
  }

  logout(): void {
    localStorage.removeItem('lactaCareUser');
  }

  saveUserSession(user: UsuarioSesion): void {
    localStorage.setItem('lactaCareUser', JSON.stringify(user));
  }

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
}