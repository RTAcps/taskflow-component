/**
 * Bootstrap do Angular Application
 * Este arquivo é carregado dinamicamente pelo main.ts
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appComponentConfig } from './app/app.config';

console.log('Bootstrapping TaskFlow Component Angular application...');

// Configuração adicional para Zone.js para evitar conflitos
(window as any).Zone = (window as any).Zone || {};

bootstrapApplication(AppComponent, appComponentConfig)
  .then(() => {
    console.log('TaskFlow Component Angular application bootstrapped successfully!');
    
    // Sinalizar que a aplicação está pronta
    window.dispatchEvent(new CustomEvent('taskflow-component-ready', {
      detail: { component: 'taskflow-component', status: 'ready' }
    }));
  })
  .catch(err => {
    console.error('Error bootstrapping TaskFlow Component Angular application:', err);
  });
