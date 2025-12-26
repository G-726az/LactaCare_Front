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
      // Convertir strings de fecha de vuelta a objetos Date
      const parsedEmpleados = JSON.parse(savedEmpleados);
      this.empleadosBD = parsedEmpleados.map((emp: any) => ({
        ...emp,
        Fechanacimiento: emp.Fechanacimiento ? new Date(emp.Fechanacimiento) : new Date()
      }));
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
    
    // Convertir Date a string ISO para la sesión
    const fechaNacimientoString = usuarioEncontrado.Fechanacimiento 
      ? usuarioEncontrado.Fechanacimiento.toISOString() 
      : new Date().toISOString();
    
    return {
      id_usuario: usuarioEncontrado.Id_PerEmpleado,
      primer_nombre: usuarioEncontrado.Primer_nombre,
      segundo_nombre: usuarioEncontrado.Segundo_nombre || '',
      primer_apellido: usuarioEncontrado.Primer_apellido,
      segundo_apellido: usuarioEncontrado.Segundo_apellido || '',
      cedula: usuarioEncontrado.Cedula,
      correo: usuarioEncontrado.Correo,
      telefono: usuarioEncontrado.Telefono,
      fecha_nacimiento: fechaNacimientoString,
      rol: rolInfo?.Nombre_rol || 'Médico',
      nombre_completo: nombreCompleto,
      // Agregar campos adicionales requeridos por UsuarioSesion
      usuario: usuarioEncontrado.Correo.split('@')[0],
      estado: 'Activo',
      fecha_registro: new Date().toISOString(),
      ultimo_acceso: new Date().toISOString()
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
    
    // Convertir fecha de nacimiento a Date si es string
    const fechaNacimiento = registerData.fecha_nacimiento 
      ? new Date(registerData.fecha_nacimiento)
      : new Date();
    
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
      Fechanacimiento: fechaNacimiento,
      Rol_empleado: 2
    };
    
    // Agregar a la lista
    this.empleadosBD.push(nuevoMedico);
    
    // Guardar en localStorage (convertir Date a string para JSON)
    const empleadosParaGuardar = this.empleadosBD.map(emp => ({
      ...emp,
      Fechanacimiento: emp.Fechanacimiento.toISOString()
    }));
    localStorage.setItem('lactaCareEmpleados', JSON.stringify(empleadosParaGuardar));
    
    const rolInfo = this.rolesBD.find(r => r.Id_roles === nuevoMedico.Rol_empleado);
    const nombreCompleto = `${nuevoMedico.Primer_nombre} ${nuevoMedico.Primer_apellido}`.trim();
    
    return {
      id_usuario: nuevoMedico.Id_PerEmpleado,
      primer_nombre: nuevoMedico.Primer_nombre,
      segundo_nombre: nuevoMedico.Segundo_nombre,
      primer_apellido: nuevoMedico.Primer_apellido,
      segundo_apellido: nuevoMedico.Segundo_apellido,
      cedula: nuevoMedico.Cedula,
      correo: nuevoMedico.Correo,
      telefono: nuevoMedico.Telefono,
      fecha_nacimiento: nuevoMedico.Fechanacimiento.toISOString(),
      rol: rolInfo?.Nombre_rol || 'Médico',
      nombre_completo: nombreCompleto,
      usuario: nuevoMedico.Correo.split('@')[0],
      estado: 'Activo',
      fecha_registro: new Date().toISOString(),
      ultimo_acceso: new Date().toISOString()
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

  // Método para actualizar perfil
  updateProfile(userId: number, updatedData: any): UsuarioSesion | null {
    const empleadoIndex = this.empleadosBD.findIndex(emp => emp.Id_PerEmpleado === userId);
    
    if (empleadoIndex === -1) {
      return null;
    }
    
    // Actualizar datos
    const empleado = this.empleadosBD[empleadoIndex];
    
    if (updatedData.primer_nombre) {
      empleado.Primer_nombre = updatedData.primer_nombre;
    }
    if (updatedData.segundo_nombre !== undefined) {
      empleado.Segundo_nombre = updatedData.segundo_nombre;
    }
    if (updatedData.primer_apellido) {
      empleado.Primer_apellido = updatedData.primer_apellido;
    }
    if (updatedData.segundo_apellido !== undefined) {
      empleado.Segundo_apellido = updatedData.segundo_apellido;
    }
    if (updatedData.correo) {
      empleado.Correo = updatedData.correo;
    }
    if (updatedData.telefono !== undefined) {
      empleado.Telefono = updatedData.telefono;
    }
    if (updatedData.fecha_nacimiento) {
      empleado.Fechanacimiento = new Date(updatedData.fecha_nacimiento);
    }
    
    // Guardar en localStorage
    const empleadosParaGuardar = this.empleadosBD.map(emp => ({
      ...emp,
      Fechanacimiento: emp.Fechanacimiento.toISOString()
    }));
    localStorage.setItem('lactaCareEmpleados', JSON.stringify(empleadosParaGuardar));
    
    // Crear objeto de sesión actualizado
    const rolInfo = this.rolesBD.find(r => r.Id_roles === empleado.Rol_empleado);
    const nombreCompleto = `${empleado.Primer_nombre} ${empleado.Primer_apellido}`.trim();
    
    return {
      id_usuario: empleado.Id_PerEmpleado,
      primer_nombre: empleado.Primer_nombre,
      segundo_nombre: empleado.Segundo_nombre || '',
      primer_apellido: empleado.Primer_apellido,
      segundo_apellido: empleado.Segundo_apellido || '',
      cedula: empleado.Cedula,
      correo: empleado.Correo,
      telefono: empleado.Telefono,
      fecha_nacimiento: empleado.Fechanacimiento.toISOString(),
      rol: rolInfo?.Nombre_rol || 'Médico',
      nombre_completo: nombreCompleto,
      usuario: empleado.Correo.split('@')[0],
      estado: 'Activo',
      fecha_registro: new Date().toISOString(),
      ultimo_acceso: new Date().toISOString()
    };
  }
}