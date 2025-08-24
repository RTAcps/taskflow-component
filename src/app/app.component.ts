import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ShellNavigationService } from './services/shell-navigation.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <!-- Header só aparece quando executando standalone (não na shell) -->
      <div class="app-header" *ngIf="isStandalone">
        <h1 class="app-title">
          📁 Project Management
        </h1>
        <p class="app-description">Manage your projects and tasks with a component-based approach.</p>
      </div>
      <div class="app-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .app-container {
      height: 100%;
      background-color: var(--surface-ground, #F8F9FA);
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background-color: var(--surface-card, #ffffff);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .app-title {
      color: var(--primary-color, #3B82F6);
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .app-description {
      color: var(--text-color-secondary, #6c757d);
      margin: 0;
    }
    
    .app-content {
      flex: 1;
      padding: 0 1rem 1rem;
      overflow-y: auto;
    }
    
    /* Injetar estilos base quando estiver em modo embed (não standalone) */
    :host-context(app-root) {
      --primary-color: #3B82F6;
      --primary-color-text: #ffffff;
      --text-color: #495057;
      --text-color-secondary: #6c757d;
      --surface-ground: #F8F9FA;
      --surface-card: #ffffff;
      --border-radius: 12px;
    }
  `]
})
export class AppComponent implements OnInit {
  
  // Detectar se está executando standalone ou na shell
  isStandalone = true;

  constructor(
    // Injetar o serviço para inicializá-lo e configurar os event listeners
    private shellNavigationService: ShellNavigationService
  ) {}

  ngOnInit() {
    // Verificar se está sendo executado dentro de uma shell
    // Se a URL contém localhost:4200 (shell) ou se há um parent frame
    this.isStandalone = window.location.port === '4201' && window.parent === window;
    
    console.log('TaskFlow Component - isStandalone:', this.isStandalone);
    console.log('Current port:', window.location.port);
    console.log('Has parent frame:', window.parent !== window);
  }
}
