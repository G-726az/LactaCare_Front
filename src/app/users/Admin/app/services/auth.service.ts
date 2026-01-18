import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PersonaEmpleado } from '../../../../models/database.models';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private urlEndPointRegisterEmpleado: string = `${environment.apiUrl}/empleados/admin/crear`;

  /*
  getAccessToken(): string | null {
    const user = JSON.parse(localStorage.getItem('lactaCareUser')!);
    const token = user.access_token;
    console.log('AuthService: Access Token retrieved:', token);
    return token;
  }
  */

  constructor(private http: HttpClient) {}

  createEmpleado(data: Partial<PersonaEmpleado>): Observable<PersonaEmpleado> {
    //const token = this.getAccessToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<PersonaEmpleado>(this.urlEndPointRegisterEmpleado, data, { headers });
  }
}
