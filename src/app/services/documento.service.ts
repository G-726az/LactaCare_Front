import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentoService {
  private baseUrl = 'http://localhost:8080/api/documentos';

  constructor(private http: HttpClient) {}

  private obtenerCabeceras(): HttpHeaders {
    const usuarioJson = localStorage.getItem('lactaCareUser');
    let token = '';

    if (usuarioJson) {
      try {
        const usuarioObj = JSON.parse(usuarioJson);
        token = usuarioObj.access_token;
      } catch (e) {
        console.error('Error al procesar el token de usuario', e);
      }
    }

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl, { headers: this.obtenerCabeceras() });
  }

  subir(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.baseUrl}/upload`, formData, { headers: this.obtenerCabeceras() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.obtenerCabeceras() });
  }

  verArchivo(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/ver`, {
      headers: this.obtenerCabeceras(),
      responseType: 'blob',
    });
  }
}
