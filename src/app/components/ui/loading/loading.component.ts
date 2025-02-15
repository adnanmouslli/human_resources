import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" 
         class="loading-overlay" 
         [class.full-screen]="fullScreen"
         [ngStyle]="{'z-index': zIndex}">
      
      <div class="loading-backdrop"></div>
      
      <div class="loading-content" [ngClass]="size">
        <!-- Spinner Animation -->
        <ng-container [ngSwitch]="type">
          <!-- Modern Spinner -->
          <div *ngSwitchCase="'modern'" class="modern-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>

          <!-- Wave Animation -->
          <div *ngSwitchCase="'wave'" class="wave-spinner">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>

          <!-- Circle Pulse -->
          <div *ngSwitchCase="'circle'" class="circle-pulse">
            <div class="circle-container">
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </div>

          <!-- Default Prime NG -->
          <div *ngSwitchDefault class="default-spinner">
            <i class="pi pi-spin pi-spinner" [ngClass]="spinnerSizeClass"></i>
          </div>
        </ng-container>

        <!-- Loading Message -->
        <div *ngIf="message" class="loading-message" [ngClass]="messagePosition">
          {{ message }}
        </div>
      </div>
    </div>

    <style>
      .loading-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: all;
      }

      .loading-backdrop {
        position: absolute;
        inset: 0;
        background: var(--surface-ground);
        opacity: 0.9;
        backdrop-filter: blur(8px);
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 0.9; }
      }

      .loading-content {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        animation: scaleIn 0.3s ease;
      }

      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      /* Message Styling */
      .loading-message {
        color: var(--text-color);
        font-weight: 500;
        font-size: 1.1rem;
        text-align: center;
        background: var(--surface-card);
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        box-shadow: var(--card-shadow);
      }

      /* Modern Spinner */
      .modern-spinner {
        position: relative;
        width: 80px;
        height: 80px;
      }

      .spinner-ring {
        position: absolute;
        inset: 0;
        border: 4px solid transparent;
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: modernSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      }

      .spinner-ring:nth-child(1) { animation-delay: -0.45s; }
      .spinner-ring:nth-child(2) { animation-delay: -0.3s; }
      .spinner-ring:nth-child(3) { animation-delay: -0.15s; }

      @keyframes modernSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Wave Animation */
      .wave-spinner {
        display: flex;
        gap: 0.4rem;
        align-items: center;
        padding: 1rem;
      }

      .wave {
        width: 0.5rem;
        height: 2.5rem;
        background: var(--primary-color);
        border-radius: 1rem;
        animation: wave 1s ease-in-out infinite;
      }

      .wave:nth-child(2) { animation-delay: 0.1s; }
      .wave:nth-child(3) { animation-delay: 0.2s; }
      .wave:nth-child(4) { animation-delay: 0.3s; }
      .wave:nth-child(5) { animation-delay: 0.4s; }

      @keyframes wave {
        0%, 100% { transform: scaleY(0.5); }
        50% { transform: scaleY(1.5); }
      }

      /* Circle Pulse */
      .circle-pulse {
        width: 60px;
        height: 60px;
        margin-bottom: 0.5rem;
      }

      .circle-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .circle {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 3px solid var(--primary-color);
        border-radius: 50%;
        opacity: 1;
        animation: pulse 1.8s cubic-bezier(0.37, 0, 0.63, 1) infinite;
      }

      .circle:nth-child(2) {
        animation-delay: -0.9s;
      }

      @keyframes pulse {
        0% {
          transform: scale(0.6);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.5;
        }
        100% {
          transform: scale(1.8);
          opacity: 0;
        }
      }

      /* Responsive Sizing */
      .loading-content.small {
        transform: scale(0.75);
      }

      .loading-content.large {
        transform: scale(1.25);
      }

      /* Default Spinner Sizing */
      .default-spinner .pi {
        color: var(--primary-color);
      }

      .default-spinner .text-2xl { font-size: 2rem; }
      .default-spinner .text-4xl { font-size: 4rem; }
      .default-spinner .text-6xl { font-size: 6rem; }
    </style>
  `
})
export class LoadingComponent {
  @Input() show: boolean = false;
  @Input() fullScreen: boolean = true;
  @Input() message: string = 'جاري التحميل...';
  @Input() messagePosition: 'bottom' | 'right' = 'bottom';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() type: 'default' | 'modern' | 'wave' | 'circle' = 'modern';
  @Input() zIndex: number = 9999;

  get spinnerSizeClass(): string {
    switch (this.size) {
      case 'small': return 'text-2xl';
      case 'large': return 'text-6xl';
      default: return 'text-4xl';
    }
  }
}