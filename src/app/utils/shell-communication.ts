/**
 * Utilitário para comunicação com o aplicativo shell
 */

/**
 * Envia uma mensagem de erro para o shell exibir ao usuário
 * @param message A mensagem de erro a ser exibida
 * @param type O tipo de notificação ('error' ou 'warning')
 * @param redirectToHome Se deve redirecionar para a home após um timeout
 * @param timeout Tempo (ms) após o qual redirecionar para home (se redirectToHome=true)
 * @param title Título opcional para a notificação
 */
export function reportErrorToShell(
  message: string, 
  type: 'error' | 'warning' = 'error',
  redirectToHome = false,
  timeout = 0,
  title?: string
): void {
  try {
    // Verifica se estamos rodando dentro do shell (existe a função mfeError)
    if (typeof (window as any).mfeError === 'function') {
      // Chama a função disponibilizada pelo shell
      (window as any).mfeError(message, type, redirectToHome, timeout);
    } else {
      // Envia um evento customizado para o shell (alternativa)
      const event = new CustomEvent('mfe-error', {
        detail: {
          message,
          type,
          redirectToHome,
          timeout,
          title
        }
      });
      window.dispatchEvent(event);
    }
    
    // Log do erro para debug
    if (type === 'error') {
      console.error('[MFE] Reportando erro para o shell:', message);
    } else {
      console.warn('[MFE] Reportando aviso para o shell:', message);
    }
  } catch (err) {
    // Fallback para o console caso a comunicação com o shell falhe
    console.error('[MFE] Erro ao comunicar com o shell:', err);
    console.error('[MFE] Mensagem original:', message);
    
    // Se a comunicação falhar e for um erro crítico que exige redirecionamento,
    // tenta redirecionar localmente como último recurso
    if (redirectToHome) {
      try {
        setTimeout(() => {
          window.location.href = '/';
        }, timeout > 0 ? timeout : 5000);
      } catch {
        console.error('[MFE] Falha ao redirecionar para a página inicial');
      }
    }
  }
}

/**
 * Navega para uma rota dentro do shell
 * @param path O caminho para navegação
 */
export function navigateInShell(path: string): void {
  try {
    // Verifica se estamos rodando dentro do shell (existe a função mfeNavigate)
    if (typeof (window as any).mfeNavigate === 'function') {
      // Chama a função disponibilizada pelo shell
      (window as any).mfeNavigate(path);
    } else {
      // Envia um evento customizado para o shell (alternativa)
      const event = new CustomEvent('mfe-navigate', {
        detail: { path }
      });
      window.dispatchEvent(event);
    }
  } catch (err) {
    console.error('[MFE] Erro ao navegar via shell:', err);
    
    // Tenta navegar diretamente como fallback
    try {
      window.location.href = path;
    } catch {
      reportErrorToShell('Não foi possível navegar para a página solicitada.', 'error');
    }
  }
}
