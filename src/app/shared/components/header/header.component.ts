// ============================================================
// Quantity Nexus – HeaderComponent  (UC20 Angular)
// Reusable header — Component composition replacing copy-pasted HTML
// ============================================================

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive }                from '@angular/router';
import { LucideAngularModule }                         from 'lucide-angular';
import { AuthService }                                 from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="dash-header">

      <!-- User greeting -->
      <div class="dash-user">
        <div class="avatar">{{ auth.initials() }}</div>
        <div class="greeting">
          <p>Welcome back,</p>
          <h2>{{ auth.firstName() }}</h2>
        </div>
      </div>

      <!-- Navigation links (routerLinkActive = Dynamic class binding) -->
      <nav class="dash-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
          <lucide-icon name="layout-dashboard" [size]="18"></lucide-icon>
          Dashboard
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-link">
          <lucide-icon name="history" [size]="18"></lucide-icon>
          History
        </a>
      </nav>

      <!-- Logout (Event handling in template) -->
      <button class="btn btn-ghost" (click)="auth.logout()">
        <lucide-icon name="log-out" [size]="18"></lucide-icon>
        <span>Logout</span>
      </button>

    </header>
  `
})
export class HeaderComponent {
  auth = inject(AuthService);
}
