import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paciente-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="paciente-header">
      <div class="header-container">
        <!-- Logo Izquierdo -->
        <div class="header-logo">
          <i class="fas fa-baby"></i>
          <span>LactaCare</span>
        </div>

        <!-- Mensaje de Bienvenida Derecho -->
        <div class="header-welcome">
          <span class="welcome-text">¡Bienvenida, <strong>{{ nombrePaciente }}</strong>!</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .paciente-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      display: flex;
      align-items: center;
    }

    .header-container {
      width: 100%;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .header-logo:hover {
      transform: scale(1.05);
    }

    .header-logo i {
      font-size: 2rem;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    .header-welcome {
      display: flex;
      align-items: center;
    }

    .welcome-text {
      color: white;
      font-size: 1.1rem;
      font-weight: 400;
      letter-spacing: 0.5px;
    }

    .welcome-text strong {
      font-weight: 700;
      margin-left: 0.25rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-container {
        padding: 0 1rem;
      }

      .header-logo {
        font-size: 1.2rem;
      }

      .header-logo i {
        font-size: 1.5rem;
      }

      .welcome-text {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .welcome-text {
        font-size: 0.8rem;
      }

      .header-logo span {
        display: none;
      }
    }
  `]
})
export class PacienteHeaderComponent {
  @Input() nombrePaciente: string = 'Usuario';
}