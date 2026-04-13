// ============================================================
// Quantity Nexus – HistoryComponent  (UC20 Angular)
// UC19 history.html + history.js → Angular @for template loop
// ============================================================

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule }                                from '@angular/common';
import { LucideAngularModule }                         from 'lucide-angular';
import { HeaderComponent }                             from '../../shared/components/header/header.component';
import { HistoryService }                              from '../../core/services/history.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-page-wrap">
      <section class="container">

        <app-header></app-header>

        <div class="glass-card history-page-card">

          <div class="history-header">
            <div>
              <h2>Activity Records</h2>
              <p class="subtitle">Detailed log of your recent measurements</p>
            </div>
            <div class="hist-actions">
              <button class="btn btn-primary" (click)="historySvc.export()">
                <lucide-icon name="download" [size]="18"></lucide-icon>
                Export Reports
              </button>
              <button class="btn btn-outline sm" (click)="historySvc.clear()">
                Clear Activity Log
              </button>
            </div>
          </div>

          @if (historySvc.items().length === 0) {
            <div class="empty-state">
              <lucide-icon name="inbox" [size]="64"></lucide-icon>
              <p>No activity records found</p>
            </div>
          } @else {
            <ul class="history-list">
              @for (item of historySvc.items(); track item.id) {
                <li class="history-item">
                  <div class="hist-main">
                    <span class="badge">{{ item.type }}</span>
                    <span class="hist-val">{{ item.from }}</span>
                    <span class="hist-arrow">
                      <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
                    </span>
                    <span class="hist-val success">{{ item.to }}</span>
                  </div>
                  <div class="hist-meta">
                    <span class="hist-label">{{ item.date }}</span>
                    <span class="hist-label">{{ item.time }}</span>
                  </div>
                </li>
              }
            </ul>
          }

        </div>
      </section>
    </div>
  `
})
export class HistoryComponent {
  historySvc = inject(HistoryService);
}
