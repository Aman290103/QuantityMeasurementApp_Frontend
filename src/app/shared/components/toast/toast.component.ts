import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ToastService }   from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container">
      @for (t of toastSvc.toasts(); track t.id) {
        <div class="toast {{ t.type }}" [class.leaving]="t.leaving">
          {{ t.message }}
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastSvc = inject(ToastService);
}
