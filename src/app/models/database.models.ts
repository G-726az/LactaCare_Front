// Interfaces basadas en la estructura de la base de datos

export interface PersonaPaciente {
  Id_PerPaciente: number;
  Perfil_paciente_img: string;
  Cedula: string;
  Primer_nombre: string;
  Segundo_nombre?: string;
  Primer_apellido: string;
  Segundo_apellido?: string;
  Correo: string;
  Telefono: string;
  Fechanacimiento: Date;
  Discapacidad_paciente: boolean;
  password: string;
}

export interface PersonaEmpleado {
  Id_PerEmpleado: number;
  Perfil_empleado_img: string;
  Cedula: string;
  Primer_nombre: string;
  Segundo_nombre?: string;
  Primer_apellido: string;
  Segundo_apellido?: string;
  Correo: string;
  Telefono: string;
  Fechanacimiento: Date;
  Rol_empleado: number;
}

export interface Roles {
  Id_roles: number;
  Nombre_rol: string;
}

export interface ContactoEmergencia {
  Id_ContactoE: number;
  Id_PerPaciente: number;
  Nombre_ContactoE: string;
  Telefono_ContactoE: string;
}

export interface Institucion {
  Id_Institucion: number;
  Nombre_Institucion: string;
  Logo_Institucion: string;
}

export interface Lactario {
  Id_Lactario: number;
  Nombre_CMedico: string;
  Direccion_CMedico: string;
  Correo_CMedico: string;
  Telefono_CMedico: string;
  Latitud_CMedico: string;
  Longitud_CMedico: string;
  Horario_CMedico: number;
  Id_Institucion: number;
  id_diaslaborables: number;
}

export interface Sistema {
  Id_Sistema: number;
  Logo_Sistema: string;
  Nombre_Sistema: string;
  Eslogan: string;
}

export interface Horarios {
  Id_Horario: number;
  Hora_Inicio_Jornada: string;
  Hora_Fin_Jornada: string;
  Hora_Inicio_Descanso: string;
  Hora_Fin_Descanso: string;
}

export interface EmpleadoHorarios {
  Id_PerEmpleado: number;
  Id_Horario: number;
}

export interface Refrigerador {
  Id_refrigerador: number;
  Id_Lactario: number;
  Capacidad_max_refri: number;
  Piso_refrigerador: number;
  Fila_refrigerador: number;
  Columna_refrigerador: number;
}

export interface EstadoRefrigerador {
  Id_EstRefrigerador: number;
  Id_refrigerador: number;
  Temperatura_EstRefrigerador: number;
  HoraActividad_EstRefrigerador: string;
  FechaActividad_EstRefrigerador: Date;
}

export interface ContenedorLeche {
  Id_contenedor: number;
  Id_Atencion: number;
  Fechaextraccion_contenedor: Date;
  FechaCaducidad_contenedor: Date;
  Estado_contenedor: string;
  Cantidad_contendor: number;
}

export interface ChatbotConsultas {
  Id_Consulta: number;
  Fecha_Consulta: Date;
  Pregunta: string;
  Tema: string;
  Cantidad_Repeticiones: number;
  Id_Paciente: number;
}

export interface Reservas {
  Id_reservas: number;
  Id_lactario: number;
  Id_paciente: number;
  Estado: string;
  Fecha_reserva: Date;
  Hora_Inicio_reserva: string;
  Hora_Fin_reserva: string;
}

export interface Atenciones {
  Id_PerEmpleado: number;
  Id_Atencion: number;
  Id_reserva: number;
  Fecha_atencion: Date;
  Hora_atencion: string;
}

export interface DiasLaborables {
  id_dia_laborable: number;
  Dia_Lunes: number;
  Dia_Martes: number;
  Dia_Miercoles: number;
  Dia_Jueves: number;
  Dia_Viernes: number;
  Dia_Sabado: number;
  Dia_Domingo: number;
}

export interface UbicacionContenedor {
  id_ubicacion: number;
  id_contenedor: number;
  id_refrigerador: number;
  Piso_refrigerador: number;
  Fila_refrigerador: number;
  Columna_refrigerador: number;
}

export interface PersonaBebe {
  Id_bebe: number;
  Id_familiar: number;
  Nombre_bebe: string;
  fehca_nacimineto: Date;
  genero: string;
}

// Interfaces para datos combinados (útiles para el frontend)
export interface UsuarioSesion {
  id: number;
  cedula: string;
  nombre_completo: string;
  primer_nombre: string;
  primer_apellido: string;
  correo: string;
  telefono: string;
  tipo: 'empleado' | 'paciente';
  rol: string;
  rol_id: number;
  fecha_nacimiento: Date;
  perfil_img?: string;
}