import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SistemaAlerta } from '../../../../models/database.models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SistemaAlertaService {
  private urlEndPoint = `${environment.apiUrl}/sistema-alertas`;

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  getAlertas(): Observable<SistemaAlerta[]> {
    return this.http.get<SistemaAlerta[]>(this.urlEndPoint).pipe(map((response) => response as SistemaAlerta[]));
  }
}
