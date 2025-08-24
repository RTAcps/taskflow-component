import { Injectable, Injector } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShellNavigationService {
  private isStandalone = true;

  constructor(private router: Router, private injector: Injector) {
    // Detectar se está em modo standalone ou em shell
    this.isStandalone = window.location.port === '4201' && window.parent === window;
    console.log('[Component MFE] Running in', this.isStandalone ? 'standalone' : 'shell', 'mode');
    
    // Se não estiver em modo standalone, monitorar as navegações
    if (!this.isStandalone) {
      this.setupRouterListener();
      this.setupClickInterceptor();
    }
  }

  private setupRouterListener() {
    // Escutar eventos de navegação do Angular Router
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const path = event.urlAfterRedirects || event.url;
      console.log('[MFE] Navigation occurred:', path);
      this.notifyShell(path);
    });
  }
  
  // Interceptar cliques em links para notificar a shell
  private setupClickInterceptor() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      
      // Se for um clique em uma âncora e não tiver o atributo target="_blank"
      if (anchor && !anchor.getAttribute('target')) {
        const href = anchor.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
          // Prevenir navegação padrão
          event.preventDefault();
          
          console.log('[MFE] Link click intercepted:', href);
          
          // Usar o Router para navegar internamente
          // (Isso vai disparar o NavigationEnd que será capturado pelo setupRouterListener)
          this.router.navigateByUrl(href);
        }
      }
    });
  }

  // Notificar a shell sobre navegação
  notifyShell(path: string) {
    try {
      // Não notificar para a mesma rota
      if (path === this.router.url) {
        return;
      }
      
      // Formatar caminho correto para shell
      const fullPath = path.startsWith('/') 
        ? `/project-management${path}` 
        : `/project-management/${path}`;
        
      // Tentar chamar função global da shell se disponível
      if (typeof (window as any).mfeNavigate === 'function') {
        console.log('[MFE] Calling shell.mfeNavigate with path:', fullPath);
        (window as any).mfeNavigate(fullPath);
        return;
      }

      // Caso contrário, disparar evento customizado
      console.log('[MFE] Dispatching mfe-navigate event with path:', fullPath);
      window.dispatchEvent(new CustomEvent('mfe-navigate', {
        detail: { path: fullPath },
        bubbles: true,
        cancelable: true
      }));
    } catch (e) {
      console.error('[MFE] Error notifying shell about navigation:', e);
    }
  }
}
