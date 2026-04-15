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
import { MeasurementService }   from '../../core/services/measurement.service';
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

            <!-- ── Conversion/Comparison UI ──────────────────────────────── -->
            @if (currentAction() !== 'Arithmetic') {
              <div class="conversion-group">

                <div class="input-card">
                  <label>{{ currentAction() === 'Comparison' ? 'Quantity 1' : 'From' }}</label>
                  <input
                    type="number"
                    class="input-display"
                    [(ngModel)]="fromValue"
                    (ngModelChange)="runAction()"
                  >
                  <select
                    class="unit-select"
                    [(ngModel)]="fromUnit"
                    (ngModelChange)="runAction()"
                  >
                    @for (u of filteredUnits(); track u) {
                      <option [value]="u">{{ u }}</option>
                    }
                  </select>
                </div>

                <!-- Swap/Compare icon -->
                <div class="swap-icon" (click)="swapUnits()" [title]="currentAction() === 'Comparison' ? 'Compare' : 'Swap units'">
                  <lucide-icon [name]="currentAction() === 'Comparison' ? 'scale' : 'arrow-right-left'" [size]="20"></lucide-icon>
                </div>

                <div class="input-card">
                  <label>{{ currentAction() === 'Comparison' ? 'Quantity 2' : 'To' }}</label>
                  @if (currentAction() === 'Comparison') {
                    <input
                      type="number"
                      class="input-display"
                      [(ngModel)]="toValueInput"
                      (ngModelChange)="runAction()"
                    >
                  } @else {
                     <div class="input-display readonly">{{ toValue() }}</div>
                  }
                  <select
                    class="unit-select"
                    [(ngModel)]="toUnit"
                    (ngModelChange)="runAction()"
                  >
                    @for (u of filteredUnits(); track u) {
                      <option [value]="u">{{ u }}</option>
                    }
                  </select>
                </div>

                <!-- Comparison Result Bubble -->
                @if (currentAction() === 'Comparison') {
                  <div class="comparison-result" [class.equal]="isEqual()">
                    {{ isEqual() ? 'Equal' : 'Not Equal' }}
                  </div>
                }

              </div>
            }

            <!-- ── Arithmetic UI ──────────────────────────────────────────── -->
            @if (currentAction() === 'Arithmetic') {
              <div class="arithmetic-group">
                <div class="multi-row">

                  <div class="input-card">
                    <input type="number" class="input-display" placeholder="0"
                           [(ngModel)]="arith.v1" (ngModelChange)="runAction()">
                    <select class="unit-select"
                            [(ngModel)]="arith.u1" (ngModelChange)="runAction()">
                      @for (u of filteredUnits(); track u) {
                        <option [value]="u">{{ u }}</option>
                      }
                    </select>
                  </div>

                  <div class="op-bubble">
                    <select [(ngModel)]="arith.op" (ngModelChange)="runAction()">
                      <option value="add">+</option>
                      <option value="sub">-</option>
                      <option value="div">/</option>
                    </select>
                  </div>

                  <div class="input-card">
                    <input type="number" class="input-display" placeholder="0"
                           [(ngModel)]="arith.v2" (ngModelChange)="runAction()">
                    <select class="unit-select"
                            [(ngModel)]="arith.u2" (ngModelChange)="runAction()">
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
                            (ngModelChange)="runAction()"
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
  unitSvc        = inject(UnitService);
  historySvc     = inject(HistoryService);
  measurementSvc = inject(MeasurementService);

  currentType   = signal<UnitType>('Length');
  currentAction = signal<ActionMode>('Conversion');
  searchQuery   = signal('');

  actionModes: ActionMode[] = ['Conversion', 'Comparison', 'Arithmetic'];

  fromValue  = 1;
  fromUnit   = '';
  toUnit     = '';
  toValue    = signal('---');
  toValueInput = 1; // for comparison mode
  isEqual      = signal(false);

  arith = {
    v1: 0, u1: '', v2: 0, u2: '',
    op: 'add' as ArithOp,
    resultUnit: ''
  };
  arithResult = signal('0.000');

  filteredUnits = computed(() =>
    this.unitSvc.getUnits(this.currentType(), this.searchQuery())
  );

  ngOnInit(): void {
    this._resetUnits();
    this.runAction();
  }

  switchType(type: UnitType): void {
    this.currentType.set(type);
    this._resetUnits();
    this.runAction();
  }

  switchAction(mode: ActionMode): void {
    this.currentAction.set(mode);
    this.runAction();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
    const units = this.filteredUnits();
    if (units.length && !units.includes(this.fromUnit)) this.fromUnit = units[0];
    if (units.length && !units.includes(this.toUnit))   this.toUnit   = units[Math.min(1, units.length - 1)];
  }

  swapUnits(): void {
    if (this.currentAction() === 'Comparison') {
      this.runAction();
    } else {
      [this.fromUnit, this.toUnit] = [this.toUnit, this.fromUnit];
      this.runAction();
    }
  }

  runAction(): void {
    const mode = this.currentAction();
    if (mode === 'Conversion') this.doConvert();
    else if (mode === 'Comparison') this.doCompare();
    else this.doArithmetic();
  }

  doConvert(): void {
    if (!this.fromUnit || !this.toUnit) return;
    this.measurementSvc.convert(this.fromValue, this.fromUnit, this.toUnit, this.currentType())
      .subscribe({
        next: (res) => {
          this.toValue.set(res.resultValue?.toFixed(3) || '---');
          // Add to local history too for UI responsiveness
          this.historySvc.add(this.currentType(), `${this.fromValue} ${this.fromUnit}`, `${res.resultValue?.toFixed(3)} ${this.toUnit}`);
        },
        error: () => this.toValue.set('Err')
      });
  }

  doCompare(): void {
    if (!this.fromUnit || !this.toUnit) return;
    this.measurementSvc.compare(this.fromValue, this.fromUnit, this.toValueInput, this.toUnit, this.currentType())
      .subscribe({
        next: (res) => {
          this.isEqual.set(res.resultString === 'true');
          this.historySvc.add(this.currentType(), `${this.fromValue} ${this.fromUnit}`, `${this.toValueInput} ${this.toUnit} (Compare)`);
        }
      });
  }

  doArithmetic(): void {
    if (!this.arith.u1 || !this.arith.u2) return;
    const { v1, u1, v2, u2, op } = this.arith;
    
    let obs$;
    if (op === 'add') obs$ = this.measurementSvc.add(v1, u1, v2, u2, this.currentType());
    else if (op === 'sub') obs$ = this.measurementSvc.subtract(v1, u1, v2, u2, this.currentType());
    else obs$ = this.measurementSvc.divide(v1, u1, v2, u2, this.currentType());

    obs$.subscribe({
      next: (res) => {
        this.arithResult.set(res.resultValue?.toFixed(3) || '0.000');
        this.historySvc.add(this.currentType(), `${v1}${u1} ${op} ${v2}${u2}`, `${res.resultValue?.toFixed(3)}`);
      },
      error: (err) => this.arithResult.set('Err')
    });
  }

  private _resetUnits(): void {
    const units = this.unitSvc.getUnits(this.currentType());
    this.fromUnit          = units[0]  ?? '';
    this.toUnit            = units[1]  ?? units[0] ?? '';
    this.arith.u1          = units[0]  ?? '';
    this.arith.u2          = units[1]  ?? units[0] ?? '';
    this.arith.resultUnit  = units[0]  ?? '';
    this.searchQuery.set('');
  }
}
