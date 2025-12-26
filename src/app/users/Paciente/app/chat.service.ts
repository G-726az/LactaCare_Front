import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importamos HttpHeaders
import { Observable } from 'rxjs';

export interface PreguntaRequest {
  pregunta: string;
  latitud: number;
  longitud: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat/preguntar';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    // Buscador del token
    const usuarioJson = localStorage.getItem('lactaCareUser');
    if (usuarioJson) {
      try {
        const usuarioObj = JSON.parse(usuarioJson);
        const token = usuarioObj.token || usuarioObj.access_token;
        if (token) {
          headers = headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (e) {
        console.error('Error al leer token', e);
      }
    }
    return headers;
  }

  enviarMensaje(datos: PreguntaRequest): Observable<string> {
    // Enviamos el token junto con la petición
    return this.http.post(this.apiUrl, datos, {
      headers: this.getHeaders(),
      responseType: 'text',
    });
  }
}
