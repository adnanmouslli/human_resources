export interface ToastOptions {
  summary?: string;
  detail: string;
  type?: ToastType;
  life?: number;
  key?: string;
  sticky?: boolean;
}

export enum ToastType {
  SUCCESS = 'success',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}
