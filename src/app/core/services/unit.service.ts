// ============================================================
// Quantity Nexus – UnitService  (UC20 Angular)
// UC19 → Angular: class properties → @Injectable service
// ============================================================

import { Injectable } from '@angular/core';
import { UnitType, UnitTypeMeta, ArithOp } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UnitService {

  // Unit type metadata — icon names must match what's registered in app.config.ts
  readonly unitTypes: UnitTypeMeta[] = [
    { key: 'Length',      label: 'Length', icon: 'ruler'       },
    { key: 'Weight',      label: 'Weight', icon: 'dumbbell'    },
    { key: 'Temperature', label: 'Temp',   icon: 'thermometer' },
    { key: 'Volume',      label: 'Volume', icon: 'droplet'     },
    { key: 'Area',        label: 'Area',   icon: 'layers'      },
    { key: 'Angle',       label: 'Angle',  icon: 'compass'     },
    { key: 'Speed',       label: 'Speed',  icon: 'gauge'       },
    { key: 'Time',        label: 'Time',   icon: 'clock'       }
  ];

  // Conversion factor maps — same as UC19 app.js
  readonly units: Record<UnitType, Record<string, number>> = {
    Length:      { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Inch: 0.0254, Yard: 0.9144, Feet: 0.3048 },
    Weight:      { Gram: 1, Kilogram: 1000, Pound: 453.592 },
    Temperature: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 }, // handled via _convertTemp()
    Volume:      { Litre: 1, Millilitre: 0.001, Gallon: 3.78541, Quart: 0.946353, Pint: 0.473176, Cup: 0.236588 },
    Area:        { SquareMeter: 1, SquareFoot: 0.092903, Acre: 4046.86, SquareInch: 0.00064516 },
    Angle:       { Degree: 1, Radian: 180 / Math.PI, Gradian: 0.9 },
    Speed:       { MetersPerSecond: 1, KilometersPerHour: 1 / 3.6, MilesPerHour: 0.44704, Knots: 0.514444 },
    Time:        { Second: 1, Minute: 60, Hour: 3600, Day: 86400 }
  };

  getUnits(type: UnitType, filter = ''): string[] {
    const all = Object.keys(this.units[type]);
    return filter
      ? all.filter(u => u.toLowerCase().includes(filter.toLowerCase()))
      : all;
  }

  convert(value: number, fromUnit: string, toUnit: string, type: UnitType): number {
    if (type === 'Temperature') return this._convertTemp(value, fromUnit, toUnit);
    const map = this.units[type];
    return (value * map[fromUnit]) / map[toUnit];
  }

  arithmetic(
    v1: number, u1: string,
    v2: number, u2: string,
    op: ArithOp, resultUnit: string,
    type: UnitType
  ): { value: number; dimensionless: boolean; error?: string } {
    if (type === 'Temperature') {
      return { value: NaN, dimensionless: false, error: 'Not supported for Temperature' };
    }
    const map = this.units[type];
    const b1  = v1 * map[u1];
    const b2  = v2 * map[u2];

    if (op === 'div') {
      if (b2 === 0) return { value: NaN, dimensionless: true, error: 'Division by zero' };
      return { value: b1 / b2, dimensionless: true };
    }
    const raw = op === 'add' ? b1 + b2 : b1 - b2;
    return { value: raw / map[resultUnit], dimensionless: false };
  }

  private _convertTemp(val: number, from: string, to: string): number {
    if (from === to) return val;
    const celsius =
      from === 'Celsius'    ? val :
      from === 'Fahrenheit' ? (val - 32) * 5 / 9 :
                               val - 273.15;
    return to === 'Celsius'    ? celsius :
           to === 'Fahrenheit' ? (celsius * 9 / 5) + 32 :
                                  celsius + 273.15;
  }
}
