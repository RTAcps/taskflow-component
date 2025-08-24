import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() {}

  /**
   * Exibe uma notificação de sucesso
   * @param message Mensagem de sucesso
   * @param title Título da notificação (opcional)
   */
  success(message: string, title: string = 'Sucesso') {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal-confirm-button'
      }
    });
  }

  /**
   * Exibe uma notificação de erro
   * @param message Mensagem de erro
   * @param title Título da notificação (opcional)
   */
  error(message: string, title: string = 'Erro') {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal-confirm-button'
      }
    });
  }

  /**
   * Exibe uma notificação de alerta
   * @param message Mensagem de alerta
   * @param title Título da notificação (opcional)
   */
  warn(message: string, title: string = 'Atenção') {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal-confirm-button'
      }
    });
  }

  /**
   * Exibe uma notificação informativa
   * @param message Mensagem informativa
   * @param title Título da notificação (opcional)
   */
  info(message: string, title: string = 'Informação') {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal-confirm-button'
      }
    });
  }

  /**
   * Exibe uma caixa de diálogo de confirmação
   * @param message Mensagem de confirmação
   * @param title Título da notificação
   * @returns Promise que resolve para true se confirmado, false caso contrário
   */
  async confirm(message: string, title: string = 'Confirmação'): Promise<boolean> {
    const result = await Swal.fire({
          title,
          text: message,
          icon: 'question',
          confirmButtonColor: '#3B82F6',
          cancelButtonColor: '#6B7280',
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Cancelar',
          buttonsStyling: true,
          customClass: {
            confirmButton: 'swal-confirm-button',
            cancelButton: 'swal-cancel-button',
          }
      });
      return result.isConfirmed;
  }
}
