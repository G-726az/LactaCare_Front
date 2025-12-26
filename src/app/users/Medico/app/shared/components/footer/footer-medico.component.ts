import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-medico.component.html',
  styleUrls: ['./footer-medico.component.scss']
})
export class FooterMedicoComponent {
  currentYear = new Date().getFullYear();
}