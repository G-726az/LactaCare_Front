import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss']
})
export class WelcomeModalComponent {
  @Input() usuario: any;
  @Output() closeModal = new EventEmitter<void>();

  constructor(private modalService: ModalService) {}

  onClose() {
    this.closeModal.emit();
    this.modalService.close();
  }
}