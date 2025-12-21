import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  cedula: string;
  password: string;
  tipoUsuario: 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE';
}

export interface RegisterRequest {
  cedula: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  correo?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  password: string;
  tipo_usuario: 'paciente' | 'empleado';
  rol_empleado?: string; // Solo para empleados
  discapacidad?: boolean; // Solo para pacientes
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    cedula: string;
    nombre_completo: string;
    correo: string;
    telefono: string;
    rol: string;
    rol_id: number;
    tipo: string;
    primer_nombre: string;
    primer_apellido: string;
    fecha_nacimiento?: string;
    perfil_img?: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private http: HttpClient) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<any>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  private getStoredUser(): any {
    try {
      const storedUser = localStorage.getItem('lactaCareUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error al recuperar usuario almacenado:', error);
      localStorage.removeItem('lactaCareUser');
      return null;
    }
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
   * 🔐 Método de Login con Backend Real
   */
  login(cedula: string, password: string, tipoUsuario: string): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const loginData: LoginRequest = {
      cedula,
      password,
      tipoUsuario: tipoUsuario as 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE',
    };

    console.log('🚀 Enviando petición de login:', {
      url: `${this.apiUrl}/auth/login`,
      data: { ...loginData, password: '***' },
    });

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData, {
        headers,
        withCredentials: false,
      })
      .pipe(
        map((response) => {
          console.log('✅ Respuesta del servidor:', response);

          if (response.success && response.data) {
            try {
              // Guardar en localStorage
              localStorage.setItem('lactaCareUser', JSON.stringify(response.data));
              this.currentUserSubject.next(response.data);
              console.log('✅ Usuario guardado en localStorage');
            } catch (error) {
              console.error('❌ Error al guardar en localStorage:', error);
            }
          }
          return response;
        }),
        catchError((error) => {
          console.error('❌ Error en la petición:', error);

          let errorMessage = 'Error de conexión con el servidor';

          if (error.status === 0) {
            errorMessage =
              'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
          } else if (error.status === 404) {
            errorMessage = 'Endpoint no encontrado. Verifica la URL del backend.';
          } else if (error.status === 401) {
            errorMessage = 'Cédula o contraseña incorrecta';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          const errorResponse: LoginResponse = {
            success: false,
            message: errorMessage,
          };

          return of(errorResponse);
        })
      );
  }

  /**
   * 📝 Método de Registro con Backend Real
   */
  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    console.log('🚀 Enviando petición de registro:', {
      url: `${this.apiUrl}/auth/register`,
      data: { ...registerData, password: '***' },
    });

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register`, registerData, {
        headers,
        withCredentials: false,
      })
      .pipe(
        map((response) => {
          console.log('✅ Respuesta del servidor:', response);
          return response;
        }),
        catchError((error) => {
          console.error('❌ Error en la petición:', error);

          let errorMessage = 'Error de conexión con el servidor';

          if (error.status === 0) {
            errorMessage =
              'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos';
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          const errorResponse: RegisterResponse = {
            success: false,
            message: errorMessage,
          };

          return of(errorResponse);
        })
      );
  }

  /**
   * 🚪 Cerrar Sesión
   */
  logout(): void {
    try {
      localStorage.removeItem('lactaCareUser');
      this.currentUserSubject.next(null);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  }

  /**
   * ✅ Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  /**
   * 👤 Obtener rol del usuario
   */
  getUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.rol : null;
  }

  /**
   * 🏷️ Obtener tipo de usuario
   */
  getUserType(): string | null {
    const user = this.currentUserValue;
    return user ? user.tipo : null;
  }

  /**
   * 🆔 Obtener ID del usuario
   */
  getUserId(): number | null {
    const user = this.currentUserValue;
    return user ? user.id : null;
  }

  /**
   * 🔢 Obtener rol_id del usuario
   */
  getUserRoleId(): number | null {
    const user = this.currentUserValue;
    return user ? user.rol_id : null;
  }
}
