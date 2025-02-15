import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastOptions, ToastType } from '../../type/toast';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private defaultKey = 'global-toast';
  private defaultLifeTime = 5000;

  constructor(private messageService: MessageService) {}

  /**
   * Show a toast notification
   * @param options Toast configuration options
   */
  show(options: ToastOptions): void {
    this.messageService.add({
      key: options.key || this.defaultKey,
      severity: options.type || ToastType.INFO,
      summary: options.summary || this.getSummaryForType(options.type),
      detail: options.detail,
      life: options.life || this.defaultLifeTime,
      sticky: options.sticky || false
    });
  }

  /**
   * Show success toast
   * @param detail Message details
   * @param summary Optional summary
   */
  success(detail: string, summary?: string): void {
    this.show({
      type: ToastType.SUCCESS,
      detail,
      summary: summary || 'Success'
    });
  }

  /**
   * Show info toast
   * @param detail Message details
   * @param summary Optional summary
   */
  info(detail: string, summary?: string): void {
    this.show({
      type: ToastType.INFO,
      detail,
      summary: summary || 'Information'
    });
  }

  /**
   * Show warning toast
   * @param detail Message details
   * @param summary Optional summary
   */
  warn(detail: string, summary?: string): void {
    this.show({
      type: ToastType.WARN,
      detail,
      summary: summary || 'Warning'
    });
  }

  /**
   * Show error toast
   * @param detail Message details
   * @param summary Optional summary
   */
  error(detail: string, summary?: string): void {
    this.show({
      type: ToastType.ERROR,
      detail,
      summary: summary || 'Error'
    });
  }

  /**
   * Clear all toasts or toasts with a specific key
   * @param key Optional key to clear specific toasts
   */
  clear(key?: string): void {
    this.messageService.clear(key);
  }

  /**
   * Get default summary for each toast type
   * @param type Toast type
   */
  private getSummaryForType(type?: ToastType): string {
    switch (type) {
      case ToastType.SUCCESS: return 'Success';
      case ToastType.INFO: return 'Information';
      case ToastType.WARN: return 'Warning';
      case ToastType.ERROR: return 'Error';
      default: return '';
    }
  }
}
