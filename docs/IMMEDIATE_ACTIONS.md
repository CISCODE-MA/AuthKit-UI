# 🎯 Auth Kit UI - Piano di Azione Immediato

> **Stato attuale e prossimi step per l'allineamento Frontend-Backend**

---

## ✅ Completato

### 1. Setup Iniziale
- ✅ Creato branch `refactor/MODULE-UI-001-align-with-backend`
- ✅ Analizzato backend Auth Kit (branch `refactor/MODULE-001-align-architecture-csr`)
- ✅ Creato task document completo (`MODULE-UI-001`)
- ✅ Creato compliance summary (60% → target 90%)
- ✅ Creato documento di allineamento Backend↔Frontend
- ✅ Commit iniziale completato

---

## 🎯 Status Attuale

### Backend Auth Kit
- **Branch**: `refactor/MODULE-001-align-architecture-csr`
- **Architettura**: CSR (Controller-Service-Repository) ✅
- **Compliance**: 70% (bloccato da test coverage 0%)
- **Struttura**: Ben organizzata con guards, decorators, DTOs
- **Esportazioni**: Services, Guards, DTOs (public API chiara)

### Frontend Auth Kit UI
- **Branch**: `refactor/MODULE-UI-001-align-with-backend` (NUOVO)
- **Compliance**: 60% (necessita ristrutturazione)
- **Problemi**:
  - 🟡 Struttura disorganizzata (componenti misti in pages/components)
  - 🟡 Public API non definito chiaramente
  - 🟡 Tipi non allineati con backend
  - 🟡 Test coverage limitato

---

## 🚀 Fasi Operative (1.5-2 settimane)

### **Fase 1: Ristrutturazione (2-3 giorni)** 🔴 PRIORITÀ

**Obiettivo**: Riorganizzare la struttura del codice

**Struttura target**:
```
src/
├── components/
│   ├── auth/              # SignInForm, SignUpForm, ProfileCard
│   ├── guards/            # RequireAuth, RequireRole, RequirePermissions
│   ├── feedback/          # InlineError, SessionExpiredModal
│   └── form/              # InputField, FormButton
├── hooks/                 # useAuth, usePermissions, useProfile
├── services/              # auth.service, user.service (API clients)
├── models/                # auth.types, user.types (TypeScript interfaces)
├── providers/             # AuthProvider, PermissionsProvider
├── utils/                 # validation, storage, http utilities
└── pages/demo/            # Demo pages (non esportati)
```

**Azioni**:
1. Creare nuove directory
2. Spostare componenti esistenti
3. Rinominare per convenzioni
4. Aggiornare imports

---

### **Fase 2: Allineamento Backend (1-2 giorni)** 🟡

**Obiettivo**: Sincronizzare tipi e API con backend

**Backend esporta**:
- DTOs: `LoginDto`, `RegisterDto`, `UserDto`, `AuthTokensDto`
- Guards: `AuthenticateGuard`, `RolesGuard`, `AdminGuard`
- Decorators: `@CurrentUser()`, `@Roles()`, `@Admin()`

**Frontend deve creare**:
```typescript
// models/auth.types.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
```

**Servizi API**:
```typescript
// services/auth.service.ts
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthTokens>;
  async register(data: RegisterData): Promise<User>;
  async logout(): Promise<void>;
  // ... altri metodi
}
```

**Azioni**:
1. Creare `models/auth.types.ts` con interfacce
2. Creare `services/auth.service.ts` con metodi API
3. Implementare HTTP client con error handling
4. Aggiornare componenti per usare i nuovi tipi

---

### **Fase 3: Testing (2-3 giorni)** 🟡

**Obiettivo**: Raggiungere 80%+ test coverage

**Priorità test**:
1. `useAuth.test.ts` (hook principale)
2. `SignInForm.test.tsx` (componente critico)
3. `SignUpForm.test.tsx` (componente critico)
4. `RequireAuth.test.tsx` (guard protezione route)

**Setup**:
- Configurare Vitest per React
- Setup React Testing Library
- Configurare coverage thresholds
- Creare test utilities

**Azioni**:
1. Aggiornare `vitest.config.ts` con coverage
2. Scrivere test per hooks
3. Scrivere test per componenti
4. Scrivere integration tests per auth flows

---

### **Fase 4: Documentazione (1-2 giorni)** 🟡

**Obiettivo**: Documentare tutto il pubblico API

**JSDoc richiesto**:
```typescript
/**
 * Authentication hook providing login, logout, and user state
 * @returns Auth state and methods
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout } = useAuth();
 *   return <div>{user?.name}</div>;
 * }
 * ```
 */
export function useAuth(): AuthState {
  // ...
}
```

**README sections**:
- Installation
- Quick start
- API reference (components, hooks, types)
- Backend integration guide
- Examples

**Azioni**:
1. Aggiungere JSDoc a tutti gli export
2. Riscrivere README completo
3. Creare examples/
4. Documentare integration con backend

---

### **Fase 5: Quality Assurance (1 giorno)** 🟢

**Obiettivo**: Verificare qualità codice

**Checks**:
- TypeScript strict mode passing
- ESLint no warnings (`--max-warnings=0`)
- Test coverage >= 80%
- Build succeeds
- No `any` types
- No hardcoded values

**Azioni**:
1. Abilitare strict mode in `tsconfig.json`
2. Correggere errori TypeScript
3. Eseguire ESLint e correggere warnings
4. Verificare coverage report
5. Test integration con backend

---

## 📋 Definizione Public API

### Cosa Esportare ✅

```typescript
// src/index.ts

// === COMPONENTI UI ===
// Form components
export { SignInForm } from './components/auth/SignInForm';
export { SignUpForm } from './components/auth/SignUpForm';
export { ResetPasswordForm } from './components/auth/ResetPasswordForm';
export { ProfileCard } from './components/auth/ProfileCard';

// Guards (route protection)
export { RequireAuth } from './components/guards/RequireAuth';
export { RequireRole } from './components/guards/RequireRole';
export { RequirePermissions } from './components/guards/RequirePermissions';

// === HOOKS (API PRINCIPALE) ===
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';
export { useProfile } from './hooks/useProfile';

// === PROVIDERS (Context) ===
export { AuthProvider } from './providers/AuthProvider';
export { PermissionsProvider } from './providers/PermissionsProvider';

// === TYPES ===
export type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  AuthState,
  Role,
  Permission,
} from './models/auth.types';
```

### Cosa NON Esportare ❌

```typescript
// ❌ Non esportare servizi (interni, usati da hooks)
// export { AuthService } from './services/auth.service';

// ❌ Non esportare utilities interne
// export { httpClient } from './utils/http.utils';

// ❌ Non esportare demo pages
// export { SignInDemo } from './pages/demo/SignInDemo';
```

**Rationale**:
- Consumers usano **hooks**, non servizi direttamente
- Servizi = implementazione interna, può cambiare
- Hooks = API stabile, contratto pubblico

---

## 🎯 Mapping Backend ↔ Frontend

### Endpoints → Services → Hooks → Components

```
Backend                    Frontend Service           Frontend Hook              Frontend Component
────────                   ────────────────           ─────────────              ──────────────────
POST /auth/login           AuthService.login()        useAuth().login()          SignInForm
POST /auth/register        AuthService.register()     useAuth().register()       SignUpForm
POST /auth/logout          AuthService.logout()       useAuth().logout()         (any component)
GET /users/me              UserService.getProfile()   useProfile().data          ProfileCard
PATCH /users/me            UserService.update()       useProfile().update()      ProfileEditForm
```

### Guards

```
Backend Guard              Frontend Guard             Usage
─────────────              ──────────────             ─────
AuthenticateGuard          RequireAuth                Protect authenticated routes
RolesGuard                 RequireRole                Protect role-based routes
AdminGuard                 RequirePermissions         Protect permission-based routes
```

---

## 🔧 Comandi Rapidi

### Setup Locale

```bash
# Auth Kit UI
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit-ui"

# Verifica branch
git branch --show-current
# Output: refactor/MODULE-UI-001-align-with-backend

# Installa dipendenze (se necessario)
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

### Test Integration con Backend

```bash
# In auth-kit-ui
npm link

# In progetto test
npm link @ciscode/auth-kit-ui
npm link @ciscode/authentication-kit

# Testa integrazione
npm run dev
```

---

## 📊 Metriche di Successo

| Metrica | Attuale | Target | Status |
|---------|---------|--------|--------|
| **Compliance** | 60% | 90%+ | 🟡 In Progress |
| **Test Coverage** | ~40% | 80%+ | 🟡 To Do |
| **Architecture** | 60% | 95% | 🟡 In Progress |
| **Documentation** | 50% | 90% | 🟡 To Do |
| **Public API** | 45% | 95% | 🟡 To Do |
| **Backend Alignment** | 50% | 95% | 🟡 To Do |

---

## ⚠️ Decisioni Chiave Necessarie

### 1. Demo Pages
**Domanda**: Includere demo pages nel package?
- **Opzione A**: Includerle in `pages/demo/`, non esportarle
- **Opzione B**: Separarle in package `@ciscode/auth-kit-examples`
- **Raccomandazione**: Opzione A (più semplice)

### 2. Styling Strategy
**Domanda**: Come gestiamo gli stili?
- **Opzione A**: Headless components (consumer applica stili)
- **Opzione B**: Tailwind classes incluse (consumer può override)
- **Raccomandazione**: Opzione B (più usabile out-of-the-box)

### 3. State Management
**Domanda**: Come gestiamo auth state globale?
- **Opzione A**: AuthProvider obbligatorio
- **Opzione B**: AuthProvider opzionale (consumer sceglie)
- **Raccomandazione**: Opzione A (convenzione su configurazione)

### 4. HTTP Client
**Domanda**: Includere HTTP client nel package?
- **Opzione A**: Package fornisce client HTTP
- **Opzione B**: Consumer fornisce proprio client
- **Raccomandazione**: Opzione A (più semplice integrazione)

---

## 📚 Documenti di Riferimento

1. **Task Document**: `docs/tasks/active/MODULE-UI-001-align-with-backend.md`
   - Plan completo fase per fase
   - Checklist dettagliata
   - Success criteria

2. **Compliance Summary**: `docs/COMPLIANCE_SUMMARY.md`
   - Status attuale (60%)
   - Issues da risolvere
   - Target 90%+

3. **Backend-Frontend Alignment**: `docs/BACKEND_FRONTEND_ALIGNMENT.md`
   - Mapping completo BE↔FE
   - API endpoints
   - Guards, types, services

4. **Backend Instructions**: `../../auth-kit/.github/copilot-instructions.md`
   - Pattern CSR
   - Convenzioni backend
   - Export strategy

---

## 🚀 Prossimo Step Operativo

### Inizia con Fase 1: Ristrutturazione

**Prima azione**: Creare la nuova struttura directory

```bash
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit-ui"

# Crea directories
mkdir -p src/components/auth
mkdir -p src/components/guards
mkdir -p src/components/feedback
mkdir -p src/components/form
mkdir -p src/services
mkdir -p src/models
mkdir -p src/providers
mkdir -p src/utils
mkdir -p src/pages/demo
```

**Poi**: Sposta componenti esistenti nelle nuove directory seguendo il piano.

---

## 💡 Note Finali

- **Non affrettare**: Meglio fare bene che in fretta
- **Testing obbligatorio**: Non opzionale, 80%+ coverage
- **Documentazione parte del feature**: Non afterthought
- **Backend come riferimento**: Seguire stessi standard qualità
- **Chiedi se incerto**: Meglio chiedere che indovinare

**Tempo stimato totale**: 1.5-2 settimane (dipende da complessità)

---

## ✅ Quando è Completo?

Il task è completo quando:
- ✅ Struttura riorganizzata e pulita
- ✅ Public API definito ed esportato correttamente
- ✅ Tipi allineati con backend
- ✅ Test coverage >= 80%
- ✅ Documentazione completa (JSDoc + README)
- ✅ TypeScript strict mode passing
- ✅ ESLint no warnings
- ✅ Integration test con backend OK
- ✅ Compliance >= 90%
- ✅ Pronto per merge a `develop`

---

*Creato*: 3 Febbraio 2026  
*Branch*: `refactor/MODULE-UI-001-align-with-backend`  
*Related Backend Branch*: `refactor/MODULE-001-align-architecture-csr`  
*Status*: 🟡 **PRONTO PER INIZIARE FASE 1**
