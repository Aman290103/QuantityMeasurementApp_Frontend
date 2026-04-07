# Quantity Nexus — Angular Frontend (UC20)

> **Branch:** `feature/UC20-FrontendUsingAngular`
> Migrated 1-to-1 from `feature/UC19-HTMLCSSJSONServer` (vanilla HTML/CSS/JS)
> into a production-ready Angular 17 standalone-component application.

---

## 📐 UC19 → UC20 Angular Concept Mapping

| React Doc Concept          | UC19 (HTML/CSS/JS)                     | UC20 Angular Equivalent                          |
|----------------------------|----------------------------------------|--------------------------------------------------|
| **Virtual DOM / JSX**      | Direct `innerHTML` / DOM writes        | Angular template engine + Change Detection       |
| **Components**             | Separate `.html` pages                 | Standalone `@Component` classes                  |
| **State & Props**          | Class properties on `QuantityApp`      | `signal()` / `computed()` + `@Input()`           |
| **Services**               | `AuthService`, `HistoryService` classes | `@Injectable({ providedIn: 'root' })` services   |
| **Lifecycle**              | `DOMContentLoaded` + constructor       | `ngOnInit()`, `OnDestroy`                        |
| **Rendering**              | `list.innerHTML = items.map()`         | `@for` structural directive                      |
| **Axios / fetch()**        | `fetch()` manually                     | `HttpClient` (DI, interceptable, typed)          |
| **Events**                 | `addEventListener('click', fn)`        | `(click)="fn()"` template event bindings         |
| **Media Queries**          | CSS `@media` in `style.css`            | Same in `styles.scss` + component SCSS           |
| **Responsive UI**          | Manual CSS grid breakpoints            | Angular Flex + SCSS responsive mixins            |
| **Material UI**            | Custom CSS design system               | Same design tokens via CSS custom properties     |
| **Authentication**         | `checkAuth()` + localStorage           | `AuthService` Signal + `authGuard`               |
| **Session Management**     | `localStorage.setItem/getItem`         | Encapsulated in `AuthService` only               |
| **Component Design**       | Monolithic `index.html`                | `HeaderComponent`, `ToastComponent` reused       |
| **State & Controlled Inputs** | `input.value` reads                 | `[(ngModel)]` two-way binding / `FormControl`    |
| **Event Handling**         | DOM event listeners                    | Template `(event)` bindings                      |
| **Conditional Rendering**  | `classList.add('hidden')`              | `@if / @else` control flow                       |
| **Reusable UI logic/hooks**| `showToast()` duplicated in 2 files    | `ToastService` singleton                         |
| **Props Passing**          | N/A (no component tree)                | `@Input()` + injected services                   |
| **Component Composition**  | Copy-pasted header in each HTML page   | `<app-header>` reused in Dashboard + History     |
| **Dynamic Class Binding**  | `btn.classList.toggle('active')`       | `[class.active]="condition"` binding             |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   └── models.ts              ← All TypeScript interfaces
│   │   ├── services/
│   │   │   ├── auth.service.ts        ← UC19 auth.js → @Injectable
│   │   │   ├── history.service.ts     ← UC19 history.js → @Injectable
│   │   │   ├── unit.service.ts        ← UC19 app.js units → @Injectable
│   │   │   └── toast.service.ts       ← Extracted shared showToast()
│   │   ├── guards/
│   │   │   └── auth.guard.ts          ← checkAuth(requireAuth=true)
│   │   └── interceptors/
│   │       └── jwt.interceptor.ts     ← Attach Bearer token to all requests
│   ├── shared/
│   │   └── components/
│   │       ├── header/
│   │       │   └── header.component.ts  ← Reusable header (was copy-pasted)
│   │       └── toast/
│   │           └── toast.component.ts   ← Reusable toast overlay
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── login.component.ts   ← login.html → ReactiveForm component
│   │   │   └── register/
│   │   │       └── register.component.ts← register.html → ReactiveForm component
│   │   ├── dashboard/
│   │   │   └── dashboard.component.ts   ← index.html + app.js → Component
│   │   └── history/
│   │       └── history.component.ts     ← history.html + history.js → Component
│   ├── app.component.ts               ← Root shell with <router-outlet>
│   ├── app.config.ts                  ← Providers: Router, HttpClient, Lucide
│   └── app.routes.ts                  ← SPA routes replacing multi-page HTML
├── styles/
│   └── styles.scss                    ← Exact 1:1 port of UC19 style.css → SCSS
└── index.html                         ← Single HTML shell
```

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Ensure .NET backend is running on http://127.0.0.1:5076
# (UC18 backend — same URL as UC19)

# 3. Start dev server
ng serve --open

# App runs at http://localhost:4200
# Routes:
#   /login      → LoginComponent
#   /register   → RegisterComponent
#   /dashboard  → DashboardComponent (auth guarded)
#   /history    → HistoryComponent   (auth guarded)
```

---

## 🛠️ Tech Stack

| Concern         | Technology                        |
|-----------------|-----------------------------------|
| Framework       | Angular 17 (Standalone components)|
| Language        | TypeScript 5.4                    |
| Styling         | SCSS (component + global)         |
| Forms           | Angular ReactiveFormsModule       |
| HTTP Client     | Angular HttpClient + Interceptors |
| Routing         | Angular Router + lazy loading     |
| State           | Angular Signals                   |
| Icons           | lucide-angular (same as UC19 CDN) |
| Backend         | .NET (UC18) `http://127.0.0.1:5076/api/v1/auth` |

---

## 🧪 Running Tests

```bash
ng test
```

---

## 🏗️ Build for Production

```bash
ng build
# Output: dist/quantity-nexus-ng/
```
