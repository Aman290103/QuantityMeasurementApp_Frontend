import { Injectable, signal, computed, inject } from '@angular/core';
import { HistoryItem } from '../models/models';
import { ToastService } from './toast.service';
import { MeasurementService } from './measurement.service';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private measurementSvc = inject(MeasurementService);
  private toast = inject(ToastService);

  private _items = signal<HistoryItem[]>([]);
  readonly items = computed(() => this._items());

  constructor() {
    this.refresh();
  }

  // ── Refresh from Backend ───────────────────────────────────────────────────
  refresh(): void {
    this.measurementSvc.getAllHistory().subscribe({
      next: (dtos) => {
        // Map backend DTOs to HistoryItem interface
        const items: HistoryItem[] = dtos.map(d => ({
          id: Math.random(), // Unique ID for trackBy
          type: d.thisMeasurementType.replace('Unit', ''),
          from: `${d.thisValue} ${d.thisUnit}`,
          to: d.operation === 'COMPARE' 
              ? `${d.thatValue} ${d.thatUnit} (${d.resultString === 'true' ? 'Equal' : 'Not Equal'})`
              : `${d.resultValue?.toFixed(3)} ${d.resultUnit || d.thisUnit}`,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString()
        }));
        this._items.set(items.reverse()); // Show newest first
      },
      error: () => this.toast.show('Failed to load history from server', 'error')
    });
  }

  // ── Add (Local placeholder for instant UI, will be synced on next refresh) ──
  add(type: string, from: string, to: string): void {
    const item: HistoryItem = {
      id: Date.now(),
      type, from, to,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString()
    };
    this._items.update(prev => [item, ...prev].slice(0, 100));
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  async export(): Promise<void> {
    if (this._items().length === 0) {
      this.toast.show('No history to export', 'error');
      return;
    }

    this.toast.show('Generating Nexus Report…', 'info');

    try {
      const json = JSON.stringify(this._items(), null, 2);
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
    this.measurementSvc.clearHistory().subscribe({
      next: () => {
        this._items.set([]);
        this.toast.show('History cleared from database', 'success');
      },
      error: () => this.toast.show('Failed to clear database history', 'error')
    });
  }
}
