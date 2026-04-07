// ============================================================
// Quantity Nexus – App Config  (UC20 Angular)
// lucide-angular@0.344.0 — use importProvidersFrom + LucideAngularModule.pick()
// ============================================================

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter }                           from '@angular/router';
import { provideHttpClient, withInterceptors }     from '@angular/common/http';
import { provideAnimations }                       from '@angular/platform-browser/animations';
import { LucideAngularModule }                     from 'lucide-angular';
import { routes }                                  from './app.routes';
import { jwtInterceptor }                          from './core/interceptors/jwt.interceptor';

import {
  // Auth icons
  Scale, Mail, Lock, User, Phone, UserPlus, ArrowRight, Facebook,
  // Navigation icons
  LayoutDashboard, History, LogOut, LogIn,
  // Unit type icons (safe names for 0.344.0)
  Ruler,         // Length
  Dumbbell,      // Weight  (was 'weight' — not in lucide, use 'dumbbell')
  Thermometer,   // Temperature  (was 'thermometer-sun')
  Droplet,       // Volume
  Layers,        // Area
  Compass,       // Angle
  Gauge,         // Speed
  Clock,         // Time
  // Converter icons
  ArrowRightLeft,
  Search,
  ChevronRight,  // was 'chevrons-right' — use 'chevron-right'
  // History icons
  Download,
  Inbox
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      LucideAngularModule.pick({
        Scale, Mail, Lock, User, Phone, UserPlus, ArrowRight, Facebook,
        LayoutDashboard, History, LogOut, LogIn,
        Ruler, Dumbbell, Thermometer, Droplet, Layers, Compass, Gauge, Clock,
        ArrowRightLeft, Search, ChevronRight, Download, Inbox
      })
    )
  ]
};
