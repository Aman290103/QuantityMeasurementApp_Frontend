// ============================================================
// Quantity Nexus – ToastService  (UC20 Angular)
//
// UC19 equivalent: showToast() was duplicated in both
// auth.js and history.js. Angular extracts this as a
// single injectable service (Reusable UI logic).
// ============================================================

import { Injectable, signal, computed } from '@angular/core';
import { Toast } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  // Angular Signals for reactive state management
  private _toasts = signal<Toast[]>([]);
  readonly toasts = computed(() => this._toasts());

  show(message: string, type: Toast['type'] = 'info'): void {
    const id = Date.now();
    this._toasts.update(list => [...list, { id, message, type }]);

    // Auto-dismiss after 3 s  (same behaviour as UC19)
    setTimeout(() => this.dismiss(id), 3000);
  }

  dismiss(id: number): void {
    // Mark as leaving first so CSS exit animation can play
    this._toasts.update(list =>
      list.map(t => t.id === id ? { ...t, leaving: true } : t)
    );
    setTimeout(() => {
      this._toasts.update(list => list.filter(t => t.id !== id));
    }, 350);
  }
}
