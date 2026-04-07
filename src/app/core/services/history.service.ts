// ============================================================
// Quantity Nexus – HistoryService  (UC20 Angular)
//
// UC19 → Angular mapping:
//   DOM innerHTML     → Signal + *ngFor template loop
//   lucide.createIcons() → LucideAngularModule handles icons declaratively
//   showToast()       → ToastService
// ============================================================

import { Injectable, signal, computed } from '@angular/core';
import { HistoryItem } from '../models/models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  // Angular Signal for reactive history state
  private _items = signal<HistoryItem[]>(
    JSON.parse(localStorage.getItem('history') ?? '[]')
  );

  // Public computed view for templates (read-only)
  readonly items = computed(() => this._items());

  constructor(private toast: ToastService) {}

  // ── Add ────────────────────────────────────────────────────────────────────
  add(type: string, from: string, to: string): void {
    const item: HistoryItem = {
      id: Date.now(),
      type, from, to,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };
    // Prepend & keep last 50  (same as UC19)
    const updated = [item, ...this._items().slice(0, 49)];
    this._persist(updated);
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  async export(): Promise<void> {
    if (this._items().length === 0) {
      this.toast.show('No history to export', 'error');
      return;
    }

    this.toast.show('Generating Nexus Report…', 'info');

    try {
      const json = await new Promise<string>(res =>
        setTimeout(() => res(JSON.stringify(this._items(), null, 2)), 1000)
      );

      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), {
        href: url,
        download: `nexus_history_${new Date().toISOString().split('T')[0]}.json`
      });
      a.click();
      URL.revokeObjectURL(url);
      this.toast.show('History downloaded!', 'success');
    } catch {
      this.toast.show('Export failed', 'error');
    }
  }

  // ── Clear ──────────────────────────────────────────────────────────────────
  clear(): void {
    this._persist([]);
    this.toast.show('History cleared successfully', 'success');
  }

  private _persist(items: HistoryItem[]): void {
    localStorage.setItem('history', JSON.stringify(items));
    this._items.set(items);
  }
}
