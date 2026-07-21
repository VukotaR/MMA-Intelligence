import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Toast,
  ToastService,
} from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-error]="toast.type === 'error'"
          [class.toast-warning]="toast.type === 'warning'"
          [class.toast-info]="toast.type === 'info'"
        >
          <div class="toast-content">
            <strong>{{ toast.title }}</strong>

            @if (toast.message) {
              <span>{{ toast.message }}</span>
            }
          </div>

          <button
            type="button"
            class="toast-close"
            (click)="removeToast(toast)"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-container.css',
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  removeToast(toast: Toast): void {
    this.toastService.remove(toast.id);
  }
}