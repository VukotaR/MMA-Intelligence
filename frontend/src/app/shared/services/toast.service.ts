import { Injectable, signal } from '@angular/core';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private nextId = 1;

  success(
    title: string,
    message?: string,
    duration = 3000
  ): void {
    this.show('success', title, message, duration);
  }

  error(
    title: string,
    message?: string,
    duration = 4000
  ): void {
    this.show('error', title, message, duration);
  }

  warning(
    title: string,
    message?: string,
    duration = 3500
  ): void {
    this.show('warning', title, message, duration);
  }

  info(
    title: string,
    message?: string,
    duration = 3000
  ): void {
    this.show('info', title, message, duration);
  }

  remove(id: number): void {
    this.toasts.update((toasts) =>
      toasts.filter((toast) => toast.id !== id)
    );
  }

  private show(
    type: ToastType,
    title: string,
    message?: string,
    duration = 3000
  ): void {
    const toast: Toast = {
      id: this.nextId++,
      type,
      title,
      message,
    };

    this.toasts.update((toasts) => [
      ...toasts,
      toast,
    ]);

    window.setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }
}