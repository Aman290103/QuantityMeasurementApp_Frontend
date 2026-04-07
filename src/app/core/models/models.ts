// ============================================================
// Quantity Nexus – Domain Models  (UC20 Angular)
// ============================================================

export interface User {
  fullName: string;
  email: string;
  token?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  FullName: string;   // .NET backend expects PascalCase
  Email: string;
  Password: string;
}

export interface AuthResponse {
  fullName: string;
  email: string;
  token: string;
  message?: string;
}

export interface HistoryItem {
  id: number;
  type: string;
  from: string;
  to: string;
  time: string;
  date: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  leaving?: boolean;
}

export type UnitType = 'Length' | 'Weight' | 'Temperature' | 'Volume' | 'Area' | 'Angle' | 'Speed' | 'Time';
export type ActionMode = 'Conversion' | 'Comparison' | 'Arithmetic';
export type ArithOp = 'add' | 'sub' | 'div';

export interface UnitTypeMeta {
  key: UnitType;
  label: string;
  icon: string;
}
