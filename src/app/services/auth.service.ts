import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// ✅ CAMBIO: Usar correo en lugar de cedula
export interface LoginRequest {
  correo: string; // ✅ Cambio: antes era 'cedula'
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
  tipo_usuario: 'paciente';
  discapacidad?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    cedula: string;
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    nombreCompleto?: string;
    correo: string;
    telefono: string;
    fechaNacimiento?: string;
    imagenPerfil?: string;
    rol: string;
    rol_id: number;
    tipo: string;
    discapacidad?: boolean;
    authProvider?: string;
    accountStatus?: string;
    profileCompleted?: boolean;
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
      localStorage.removeItem('lactaCareUser');
      return null;
    }
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
   * 🔐 Método de Login con Correo - ACTUALIZADO
   */
  login(correo: string, password: string, tipoUsuario: string): Observable<LoginResponse> {
    console.log('=== AUTH SERVICE LOGIN ===');
    console.log('A. Parámetros recibidos:', { correo, password: '***', tipoUsuario });
    console.log('B. API URL:', this.apiUrl);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // ✅ CAMBIO: Enviar correo en lugar de cedula
    const loginData: LoginRequest = {
      correo: correo.trim().toLowerCase(), // ✅ Normalizar correo
      password,
      tipoUsuario: tipoUsuario as 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE',
    };

    console.log('C. Datos a enviar:', loginData);
    console.log('D. URL completa:', `${this.apiUrl}/auth/login`);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData, {
        headers,
        withCredentials: false,
      })
      .pipe(
        map((response) => {
          console.log('E. ✅ Respuesta RAW del servidor:', response);

          if (response.success && response.data) {
            try {
              // ✅ Construir nombreCompleto si no viene del backend
              if (!response.data.nombreCompleto) {
                response.data.nombreCompleto = [
                  response.data.primer_nombre,
                  response.data.segundo_nombre,
                  response.data.primer_apellido,
                  response.data.segundo_apellido,
                ]
                  .filter(Boolean)
                  .join(' ');
              }

              // ✅ Guardar datos con estructura camelCase
              localStorage.setItem('lactaCareUser', JSON.stringify(response.data));
              this.currentUserSubject.next(response.data);
              console.log('F. ✅ Usuario guardado en localStorage');
              console.log('   - Datos guardados:', response.data);
            } catch (error) {
              console.error('F. ❌ Error al guardar en localStorage:', error);
            }
          }
          return response;
        }),
        catchError((error) => {
          console.log('E. ❌ ERROR HTTP:', error);
          console.log('   - Status code:', error.status);
          console.log('   - Error body:', error.error);
          console.log('   - Headers:', error.headers);

          let errorMessage = 'Error de conexión con el servidor';

          if (error.status === 0) {
            errorMessage =
              'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
            console.log('   🚨 CORS o backend no disponible');
          } else if (error.status === 404) {
            errorMessage = 'Endpoint no encontrado. Verifica la URL del backend.';
            console.log('   🚨 Ruta incorrecta');
          } else if (error.status === 401) {
            errorMessage = 'Correo o contraseña incorrecta'; // ✅ Mensaje actualizado
            console.log('   🚨 Credenciales inválidas');
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor.';
            console.log('   🚨 Error en backend');
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
   * 📝 Método de Registro (sin cambios - ya usa correo)
   */
  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    console.log('=== AUTH SERVICE REGISTER ===');
    console.log('A. Datos de registro:', registerData);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register`, registerData, {
        headers,
        withCredentials: false,
      })
      .pipe(
        map((response) => {
          console.log('B. ✅ Respuesta del registro:', response);
          return response;
        }),
        catchError((error) => {
          console.log('B. ❌ ERROR en registro:', error);
          let errorMessage = 'Error de conexión con el servidor';

          if (error.status === 0) {
            errorMessage =
              'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos';
          } else if (error.status === 409) {
            errorMessage = error.error?.message || 'La cédula o correo ya están registrados';
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
      console.log('✅ Sesión cerrada correctamente');
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
   * 📧 Obtener correo del usuario
   */
  getUserEmail(): string | null {
    const user = this.currentUserValue;
    return user ? user.correo : null;
  }

  /**
   * 👤 Obtener nombre completo del usuario
   */
  getUserFullName(): string | null {
    const user = this.currentUserValue;
    if (!user) return null;

    if (user.nombreCompleto) return user.nombreCompleto;

    return [user.primerNombre, user.segundoNombre, user.primerApellido, user.segundoApellido]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * 📊 Obtener datos completos del usuario
   */
  getUserData(): any {
    return this.currentUserValue;
  }
}
