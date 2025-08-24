/**
 * Utilitário para comunicação com o aplicativo shell
 */

/**
 * Envia uma mensagem de erro para o shell exibir ao usuário
 * @param message A mensagem de erro a ser exibida
 * @param type O tipo de notificação ('error' ou 'warning')
 */
export function reportErrorToShell(message: string, type: 'error' | 'warning' = 'error'): void {
  try {
    // Verifica se estamos rodando dentro do shell (existe a função mfeError)
    if (typeof (window as any).mfeError === 'function') {
      // Chama a função disponibilizada pelo shell
      (window as any).mfeError(message, type);
    } else {
      // Envia um evento customizado para o shell (alternativa)
      const event = new CustomEvent('mfe-error', {
        detail: {
          message,
          type
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
