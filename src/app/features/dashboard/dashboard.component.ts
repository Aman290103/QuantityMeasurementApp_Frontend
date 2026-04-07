// ============================================================
// Quantity Nexus – DashboardComponent  (UC20 Angular)
//
// UC19 → Angular mapping:
//   class QuantityApp {}         → standalone component + injected services
//   cacheDOM() / bindEvents()    → template bindings (no DOM queries)
//   classList.add/remove()       → [ngClass] / dynamic class binding
//   innerHTML = options.map()    → @for with <option> in template
//   this.currentType             → Signal (reactive state)
//   this.currentAction           → Signal
//   addEventListener('input')    → (input) / (change) event handlers
//   document.getElementById()   → local template variables (#ref)
// ============================================================

import {
  Component, inject, signal, computed, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { LucideAngularModule }  from 'lucide-angular';
import { HeaderComponent }      from '../../shared/components/header/header.component';
import { UnitService }          from '../../core/services/unit.service';
import { HistoryService }       from '../../core/services/history.service';
import { UnitType, ActionMode, ArithOp } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-page-wrap">
      <section class="container">

        <!-- Reusable Header (Component composition / Props Passing) -->
        <app-header></app-header>

        <div class="dash-grid">

          <!-- ── Sidebar: Unit Type Selector ─────────────────────────────── -->
          <aside class="sidebar glass-card">
            <h3>Quantity Type</h3>
            <div class="type-grid">
              <!--
                @for = Angular structural directive (replaces UC19 hardcoded buttons)
                [class.active] = Dynamic class binding  (replaces classList.toggle)
                (click) = Event handler in template     (replaces addEventListener)
              -->
              @for (ut of unitSvc.unitTypes; track ut.key) {
                <button
                  class="type-btn"
                  [class.active]="currentType() === ut.key"
                  (click)="switchType(ut.key)"
                >
                  <lucide-icon [name]="ut.icon" [size]="28"></lucide-icon>
                  <span>{{ ut.label }}</span>
                </button>
              }
            </div>
          </aside>

          <!-- ── Main Converter Card ──────────────────────────────────────── -->
          <div class="main-card glass-card">

            <div class="card-header">
              <!-- Action mode switcher -->
              <div class="action-chooser">
                @for (mode of actionModes; track mode) {
                  <button
                    class="action-btn"
                    [class.active]="currentAction() === mode"
                    (click)="switchAction(mode)"
                  >{{ mode }}</button>
                }
              </div>

              <!-- Unit search box -->
              <div class="search-box">
                <lucide-icon name="search" [size]="16"></lucide-icon>
                <input
                  type="text"
                  placeholder="Search units…"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearch($event)"
                >
              </div>
            </div>

            <!-- ── Conversion UI (Conditional rendering) ─────────────────── -->
            @if (currentAction() !== 'Arithmetic') {
              <div class="conversion-group">

                <div class="input-card">
                  <label>From</label>
                  <!--
                    [(ngModel)] = Two-way binding – Angular's equivalent of
                    UC19's input[value] + addEventListener('input')
                  -->
                  <input
                    type="number"
                    class="input-display"
                    [(ngModel)]="fromValue"
                    (ngModelChange)="doConvert()"
                  >
                  <select
                    class="unit-select"
                    [(ngModel)]="fromUnit"
                    (ngModelChange)="doConvert()"
                  >
                    @for (u of filteredUnits(); track u) {
                      <option [value]="u">{{ u }}</option>
                    }
                  </select>
                </div>

                <!-- Swap button with rotate animation -->
                <div class="swap-icon" (click)="swapUnits()" title="Swap units">
                  <lucide-icon name="arrow-right-left" [size]="20"></lucide-icon>
                </div>

                <div class="input-card">
                  <label>To</label>
                  <div class="input-display readonly">{{ toValue() }}</div>
                  <select
                    class="unit-select"
                    [(ngModel)]="toUnit"
                    (ngModelChange)="doConvert()"
                  >
                    @for (u of filteredUnits(); track u) {
                      <option [value]="u">{{ u }}</option>
                    }
                  </select>
                </div>

              </div>
            }

            <!-- ── Arithmetic UI ──────────────────────────────────────────── -->
            @if (currentAction() === 'Arithmetic') {
              <div class="arithmetic-group">
                <div class="multi-row">

                  <div class="input-card">
                    <input type="number" class="input-display" placeholder="0"
                           [(ngModel)]="arith.v1" (ngModelChange)="doArithmetic()">
                    <select class="unit-select"
                            [(ngModel)]="arith.u1" (ngModelChange)="doArithmetic()">
                      @for (u of filteredUnits(); track u) {
                        <option [value]="u">{{ u }}</option>
                      }
                    </select>
                  </div>

                  <div class="op-bubble">
                    <select [(ngModel)]="arith.op" (ngModelChange)="doArithmetic()">
                      <option value="add">+</option>
                      <option value="sub">-</option>
                      <option value="div">/</option>
                    </select>
                  </div>

                  <div class="input-card">
                    <input type="number" class="input-display" placeholder="0"
                           [(ngModel)]="arith.v2" (ngModelChange)="doArithmetic()">
                    <select class="unit-select"
                            [(ngModel)]="arith.u2" (ngModelChange)="doArithmetic()">
                      @for (u of filteredUnits(); track u) {
                        <option [value]="u">{{ u }}</option>
                      }
                    </select>
                  </div>

                </div>

                <div class="result-row">
                  <div class="input-card full">
                    <label>Result In</label>
                    <div class="input-display readonly">{{ arithResult() }}</div>
                    <select class="unit-select"
                            [(ngModel)]="arith.resultUnit"
                            (ngModelChange)="doArithmetic()"
                            [disabled]="arith.op === 'div'">
                      @for (u of filteredUnits(); track u) {
                        <option [value]="u">{{ u }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>
            }

          </div><!-- /main-card -->
        </div><!-- /dash-grid -->

      </section>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  unitSvc    = inject(UnitService);
  historySvc = inject(HistoryService);

  // ── Component State (Angular Signals replace UC19 class properties) ────────
  currentType   = signal<UnitType>('Length');
  currentAction = signal<ActionMode>('Conversion');
  searchQuery   = signal('');

  actionModes: ActionMode[] = ['Conversion', 'Comparison', 'Arithmetic'];

  // Conversion state (State & controlled inputs)
  fromValue  = 1;
  fromUnit   = '';
  toUnit     = '';
  toValue    = signal('---');

  // Arithmetic state
  arith = {
    v1: 0, u1: '', v2: 0, u2: '',
    op: 'add' as ArithOp,
    resultUnit: ''
  };
  arithResult = signal('0.000');

  // Computed filtered units list (replaces UC19 handleSearch + renderUnits)
  filteredUnits = computed(() =>
    this.unitSvc.getUnits(this.currentType(), this.searchQuery())
  );

  ngOnInit(): void {
    this._resetUnits();
  }

  // ── Event Handlers ────────────────────────────────────────────────────────

  switchType(type: UnitType): void {
    this.currentType.set(type);
    this._resetUnits();
    this._runCurrentAction();
  }

  switchAction(mode: ActionMode): void {
    this.currentAction.set(mode);
    this._runCurrentAction();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    // Re-pick first available unit if current vanishes from filter
    const units = this.filteredUnits();
    if (units.length && !units.includes(this.fromUnit)) this.fromUnit = units[0];
    if (units.length && !units.includes(this.toUnit))   this.toUnit   = units[Math.min(1, units.length - 1)];
  }

  swapUnits(): void {
    [this.fromUnit, this.toUnit] = [this.toUnit, this.fromUnit];
    this.doConvert();
  }

  doConvert(): void {
    if (!this.fromUnit || !this.toUnit) return;
    const result = this.unitSvc.convert(
      this.fromValue, this.fromUnit, this.toUnit, this.currentType()
    );
    const formatted = isNaN(result) ? '---' : result.toFixed(3);
    this.toValue.set(formatted);

    if (this.fromValue > 0 && !isNaN(result)) {
      this.historySvc.add(
        this.currentType(),
        `${this.fromValue} ${this.fromUnit}`,
        `${formatted} ${this.toUnit}`
      );
    }
  }

  doArithmetic(): void {
    if (!this.arith.u1 || !this.arith.u2) return;

    const { v1, u1, v2, u2, op, resultUnit } = this.arith;
    const res = this.unitSvc.arithmetic(v1, u1, v2, u2, op, resultUnit, this.currentType());

    if (res.error) { this.arithResult.set(res.error === 'Division by zero' ? 'Err' : res.error); return; }
    this.arithResult.set(res.value.toFixed(3));
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _resetUnits(): void {
    const units = this.unitSvc.getUnits(this.currentType());
    this.fromUnit          = units[0]  ?? '';
    this.toUnit            = units[1]  ?? units[0] ?? '';
    this.arith.u1          = units[0]  ?? '';
    this.arith.u2          = units[1]  ?? units[0] ?? '';
    this.arith.resultUnit  = units[0]  ?? '';
    this.searchQuery.set('');
  }

  private _runCurrentAction(): void {
    if (this.currentAction() === 'Arithmetic') this.doArithmetic();
    else this.doConvert();
  }
}
