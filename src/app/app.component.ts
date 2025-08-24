import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ShellNavigationService } from './services/shell-navigation.service';
import { ThemeService } from './services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkTheme">
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
    
    /* Aplicar transições suaves para mudanças de tema */
    :host {
      transition: background-color var(--transition-speed, 0.3s),
                  color var(--transition-speed, 0.3s),
                  border-color var(--transition-speed, 0.3s);
    }
    
    /* Tema compartilhado, agora usando variáveis CSS do arquivo themes.css */
    :host-context(.dark-theme) .app-container {
      background-color: var(--surface-ground);
    }
    
    :host-context(.dark-theme) .app-header {
      background-color: var(--surface-card);
    }
    
    :host-context(.dark-theme) .app-title {
      color: var(--primary-color);
    }
    
    :host-context(.dark-theme) .app-description {
      color: var(--text-color-secondary);
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isStandalone = true;
  isDarkTheme = false;
  private themeSubscription: Subscription | undefined;

  constructor(
    private readonly shellNavigationService: ShellNavigationService,
    private readonly themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isStandalone = window.location.port === '4201' && window.parent === window;
    
    console.log('TaskFlow Component - isStandalone:', this.isStandalone);
    console.log('Current port:', window.location.port);
    console.log('Has parent frame:', window.parent !== window);
    
    // Observar mudanças de tema
    this.themeSubscription = this.themeService.theme$.subscribe(theme => {
      console.log('Theme changed to:', theme);
      this.isDarkTheme = theme === 'dark';
      
      // Atualizar classes no body
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${theme}-theme`);
    });
  }
  
  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }
}
