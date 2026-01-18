import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  correo: string;
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
    status?: string;
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
   * 🔐 LOGIN - CON SOPORTE PARA MOCK
   */
  login(correo: string, password: string, tipoUsuario: string): Observable<LoginResponse> {
    console.log('=== AUTH SERVICE LOGIN ===');
    console.log('A. useMockAuth:', environment.useMockAuth);
    console.log('B. Datos:', { correo, tipoUsuario });

    // ✅ MODO MOCK - SIMULAR RESPUESTA SIN BACKEND
    if (environment.useMockAuth) {
      console.log('🎭 MODO MOCK ACTIVADO');
      return this.mockLogin(correo, password, tipoUsuario);
    }

    // 🌐 MODO REAL - LLAMAR AL BACKEND
    console.log('🌐 MODO REAL - Llamando al backend');
    console.log('C. API URL:', this.apiUrl);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    const loginData: LoginRequest = {
      correo: correo.trim().toLowerCase(),
      password,
      tipoUsuario: tipoUsuario as 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE',
    };

    console.log('D. Datos a enviar:', loginData);
    console.log('E. URL completa:', `${this.apiUrl}/auth/login`);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData, {
        headers,
        withCredentials: false,
      })
      .pipe(
        map((response) => {
          console.log('F. ✅ Respuesta RAW del servidor:', response);

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
              console.log('G. ✅ Usuario guardado en localStorage');
              console.log('   - Datos guardados:', response.data);
            } catch (error) {
              console.error('G. ❌ Error al guardar en localStorage:', error);
            }
          }
          return response;
        }),
        catchError((error) => {
          console.log('F. ❌ ERROR HTTP:', error);
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
            errorMessage = 'Correo o contraseña incorrecta';
            console.log('   🚨 Credenciales inválidas');
          } else if (error.status === 500) {
            errorMessage = 'Error interno del servidor.';
            console.log('   🚨 Error en backend');
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          return of({
            success: false,
            message: errorMessage,
          });
        })
      );
  }

  /**
   * 🎭 MOCK LOGIN - SIMULAR RESPUESTA
   */
  private mockLogin(
    correo: string,
    password: string,
    tipoUsuario: string
  ): Observable<LoginResponse> {
    console.log('🎭 Ejecutando Mock Login...');

    // Determinar el rol basado en el tipo de usuario
    let rol = 'PACIENTE';
    let rol_id = 6;

    if (tipoUsuario === 'ADMINISTRADOR') {
      rol = 'ADMINISTRADOR';
      rol_id = 1;
    } else if (tipoUsuario === 'MEDICO') {
      rol = 'MEDICO';
      rol_id = 2;
    }

    // Simular datos de usuario
    const mockUserData = {
      id: Math.floor(Math.random() * 1000),
      cedula: '1234567890',
      primer_nombre: 'Usuario',
      segundo_nombre: 'Demo',
      primer_apellido: 'Prueba',
      segundo_apellido: 'Mock',
      nombreCompleto: 'Usuario Demo Prueba Mock',
      correo: correo,
      telefono: '0999999999',
      fechaNacimiento: '1990-01-01',
      imagenPerfil: 'https://i.pravatar.cc/150?img=1',
      rol: rol,
      rol_id: rol_id,
      tipo: tipoUsuario,
      discapacidad: false,
      authProvider: 'LOCAL',
      accountStatus: 'ACTIVE',
      profileCompleted: true,
    };

    // Guardar en localStorage
    localStorage.setItem('lactaCareUser', JSON.stringify(mockUserData));
    this.currentUserSubject.next(mockUserData);

    // Simular delay de red (1 segundo)
    return of({
      success: true,
      message: 'Login exitoso (MODO MOCK)',
      data: mockUserData,
    }).pipe(delay(1000));
  }

  /**
   * 📝 REGISTRO - CON SOPORTE PARA MOCK
   */
  register(registerData: RegisterRequest): Observable<RegisterResponse> {
    console.log('=== AUTH SERVICE REGISTER ===');
    console.log('A. useMockAuth:', environment.useMockAuth);
    console.log('B. Datos de registro:', registerData);

    // ✅ MODO MOCK
    if (environment.useMockAuth) {
      console.log('🎭 MODO MOCK ACTIVADO - Registro');
      return of({
        success: true,
        message: 'Registro exitoso (MODO MOCK)',
      }).pipe(delay(1000));
    }

    // 🌐 MODO REAL
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
          console.log('C. ✅ Respuesta del registro:', response);
          return response;
        }),
        catchError((error) => {
          console.log('C. ❌ ERROR en registro:', error);
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

          return of({
            success: false,
            message: errorMessage,
          });
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
  changePassword(correo: string, passwordActual: string, nuevaPassword: string): Observable<void> {
    const url = `${this.apiUrl}${environment.endpoints.changePassword}`;
    const body = {
      correo,
      passwordActual,
      nuevaPassword,
    };
    return this.http.post<void>(url, body).pipe();
  }
}
