import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UnitType } from '../models/models';

export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: string;
}

export interface QuantityInputDTO {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO?: QuantityDTO;
}

export interface QuantityMeasurementDTO {
  thisValue: number;
  thisUnit: string;
  thisMeasurementType: string;
  thatValue?: number;
  thatUnit?: string;
  operation: string;
  resultValue?: number;
  resultString?: string;
  resultUnit?: string;
  error: boolean;
  errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class MeasurementService {
  private readonly apiUrl = `${environment.apiUrl}/quantities`;

  constructor(private http: HttpClient) {}

  private getMeasurementType(type: UnitType): string {
    return `${type}Unit`;
  }

  convert(value: number, fromUnit: string, toUnit: string, type: UnitType): Observable<QuantityMeasurementDTO> {
    const payload: QuantityInputDTO = {
      thisQuantityDTO: { value, unit: fromUnit, measurementType: this.getMeasurementType(type) },
      thatQuantityDTO: { value: 0, unit: toUnit, measurementType: this.getMeasurementType(type) }
    };
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/convert`, payload);
  }

  add(v1: number, u1: string, v2: number, u2: string, type: UnitType): Observable<QuantityMeasurementDTO> {
    const payload: QuantityInputDTO = {
      thisQuantityDTO: { value: v1, unit: u1, measurementType: this.getMeasurementType(type) },
      thatQuantityDTO: { value: v2, unit: u2, measurementType: this.getMeasurementType(type) }
    };
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/add`, payload);
  }

  subtract(v1: number, u1: string, v2: number, u2: string, type: UnitType): Observable<QuantityMeasurementDTO> {
    const payload: QuantityInputDTO = {
      thisQuantityDTO: { value: v1, unit: u1, measurementType: this.getMeasurementType(type) },
      thatQuantityDTO: { value: v2, unit: u2, measurementType: this.getMeasurementType(type) }
    };
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/subtract`, payload);
  }

  divide(v1: number, u1: string, v2: number, u2: string, type: UnitType): Observable<QuantityMeasurementDTO> {
    const payload: QuantityInputDTO = {
      thisQuantityDTO: { value: v1, unit: u1, measurementType: this.getMeasurementType(type) },
      thatQuantityDTO: { value: v2, unit: u2, measurementType: this.getMeasurementType(type) }
    };
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/divide`, payload);
  }

  compare(v1: number, u1: string, v2: number, u2: string, type: UnitType): Observable<QuantityMeasurementDTO> {
    const payload: QuantityInputDTO = {
      thisQuantityDTO: { value: v1, unit: u1, measurementType: this.getMeasurementType(type) },
      thatQuantityDTO: { value: v2, unit: u2, measurementType: this.getMeasurementType(type) }
    };
    return this.http.post<QuantityMeasurementDTO>(`${this.apiUrl}/compare`, payload);
  }

  getHistory(operation: string): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(`${this.apiUrl}/history/operation/${operation}`);
  }

  getAllHistory(): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(`${this.apiUrl}/history/all`);
  }

  clearHistory(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/history/clear`);
  }
}
