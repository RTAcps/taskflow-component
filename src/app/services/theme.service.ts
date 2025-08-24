import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$: Observable<Theme> = this.themeSubject.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.initTheme();
    this.setupShellThemeListener();
  }

  /**
   * Inicializa o tema com base na preferência do usuário ou configuração da shell
   */
  private initTheme() {
    // Verificar se a shell definiu algum tema
    const shellTheme = this.getShellTheme();
    if (shellTheme) {
      this.setTheme(shellTheme);
      return;
    }

    // Verificar preferência no localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
      return;
    }

    // Verificar preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
  }

  /**
   * Configura um listener para detectar mudanças de tema da shell
   */
  private setupShellThemeListener() {
    // Ouvir eventos de mudança de tema da shell
    window.addEventListener('shell-theme-change', ((event: CustomEvent) => {
      if (event.detail && event.detail.theme) {
        this.setTheme(event.detail.theme);
      }
    }) as EventListener);

    // Verificar se a shell expôs uma função para obter o tema atual
    if (typeof (window as any).getShellTheme === 'function') {
      try {
        const currentShellTheme = (window as any).getShellTheme();
        if (currentShellTheme) {
          this.setTheme(currentShellTheme);
        }
      } catch (error) {
        console.error('[Theme] Error getting shell theme:', error);
      }
    }
  }

  /**
   * Obtém o tema atual da shell, se disponível
   */
  private getShellTheme(): Theme | null {
    try {
      // Verificar se a shell expôs uma função para obter o tema atual
      if (typeof (window as any).getShellTheme === 'function') {
        return (window as any).getShellTheme();
      }
      
      // Verificar se a shell definiu uma propriedade no window
      if ((window as any).shellTheme) {
        return (window as any).shellTheme;
      }
      
      // Verificar se há uma classe no body definida pela shell
      const bodyClasses = document.body.classList;
      if (bodyClasses.contains('dark-theme')) {
        return 'dark';
      }
      if (bodyClasses.contains('light-theme')) {
        return 'light';
      }
      
      return null;
    } catch (error) {
      console.error('[Theme] Error detecting shell theme:', error);
      return null;
    }
  }

  /**
   * Alterna entre os temas claro e escuro
   */
  public toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Define o tema atual
   * @param theme O tema a ser definido ('light' ou 'dark')
   */
  public setTheme(theme: Theme): void {
    const body = this.document.body;
    
    // Remover classes antigas
    body.classList.remove('light-theme', 'dark-theme');
    
    // Adicionar nova classe
    body.classList.add(`${theme}-theme`);
    
    // Atualizar o tema no localStorage
    localStorage.setItem('theme', theme);
    
    // Atualizar o observable
    this.themeSubject.next(theme);
    
    console.log('[Theme] Theme set to:', theme);
  }
}
