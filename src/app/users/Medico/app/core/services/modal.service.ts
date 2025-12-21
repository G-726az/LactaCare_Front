import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new Subject<{type: string, data?: any}>();
  modal$ = this.modalSubject.asObservable();

  constructor() {}

  showWelcome(usuario: any) {
    this.modalSubject.next({
      type: 'welcome',
      data: usuario
    });
  }

  showReport(reportData: any) {
    this.modalSubject.next({
      type: 'report',
      data: reportData
    });
  }

  showProfile(profileData: any) {
    this.modalSubject.next({
      type: 'profile',
      data: profileData
    });
  }

  close() {
    this.modalSubject.next({ type: 'close' });
  }
}