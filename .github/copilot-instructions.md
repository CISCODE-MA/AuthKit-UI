# Copilot Instructions - Auth Kit UI Module

> **Purpose**: Development guidelines for the Auth Kit UI module - reusable React authentication components.

---

## 🎯 Module Overview

**Package**: `@ciscode/ui-authentication-kit`  
**Type**: React Component Library  
**Purpose**: Pre-built authentication UI components for React apps

### Responsibilities:
- Login/Register forms
- Protected route wrappers
- Auth context providers
- Password reset UI
- User profile components

---

## 🏗️ Module Structure

```
src/
  ├── components/           # React components
  │   ├── LoginForm/
  │   │   ├── LoginForm.tsx
  │   │   ├── LoginForm.test.tsx
  │   │   └── index.ts
  │   └── RegisterForm/
  ├── hooks/               # Custom hooks
  │   ├── use-auth.ts
  │   └── use-protected-route.ts
  ├── context/            # Auth context provider
  │   └── AuthProvider.tsx
  ├── types/              # TypeScript types
  │   └── auth.types.ts
  └── index.ts            # Exports
```

---

## 📝 Naming Conventions

**Components**: `PascalCase.tsx`
- `LoginForm.tsx`
- `RegisterForm.tsx`
- `ProtectedRoute.tsx`

**Hooks**: `camelCase.ts` with `use` prefix
- `use-auth.ts`
- `use-login.ts`

**Types**: `kebab-case.ts`
- `auth.types.ts`

---

## 🧪 Testing - Component Library Standards

### Coverage Target: 80%+

**Unit Tests:**
- ✅ All custom hooks
- ✅ Utilities and helpers
- ✅ Context logic

**Component Tests:**
- ✅ All components with user interactions
- ✅ Form validation logic
- ✅ Error state handling

**Skip:**
- ❌ Purely presentational components (no logic)

**Test location:**
```
LoginForm/
  ├── LoginForm.tsx
  └── LoginForm.test.tsx  ← Same directory
```

---

## 📚 Documentation - Complete

### JSDoc for Hooks:

```typescript
/**
 * Hook for managing authentication state
 * @returns Auth state and methods
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * const handleLogin = async () => {
 *   await login(email, password);
 * };
 * ```
 */
export function useAuth(): UseAuthReturn
```

### Component Documentation:

```typescript
export interface LoginFormProps {
  /** Callback when login succeeds */
  onSuccess?: (user: User) => void;
  /** Callback when login fails */
  onError?: (error: Error) => void;
  /** Show remember me checkbox */
  showRememberMe?: boolean;
}

/**
 * Login form component with validation
 * 
 * @example
 * ```tsx
 * <LoginForm 
 *   onSuccess={(user) => navigate('/dashboard')}
 *   showRememberMe={true}
 * />
 * ```
 */
export function LoginForm(props: LoginFormProps): JSX.Element
```

---

## 🚀 Module Development Principles

### 1. Headless & Customizable

**Unstyled by default:**
```typescript
// Components accept className prop
<LoginForm className="my-custom-styles" />

// Or use default minimal styles
import '@ciscode/ui-authentication-kit/styles.css';
```

### 2. Framework Agnostic (Data Layer)

**No hardcoded API calls:**
```typescript
// ❌ BAD: Hardcoded API
const login = async (email, password) => {
  await fetch('/api/login', ...);
};

// ✅ GOOD: Injected API client
<AuthProvider apiClient={myApiClient}>
  <App />
</AuthProvider>
```

### 3. Accessibility First

**ALWAYS:**
- ✅ ARIA labels on form fields
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ Error announcements

### 4. Export Strategy

**Export ONLY public API:**
```typescript
// src/index.ts - Public exports
export { LoginForm } from './components/LoginForm';
export { RegisterForm } from './components/RegisterForm';
export { ProtectedRoute } from './components/ProtectedRoute';
export { AuthProvider } from './context/AuthProvider';

// Hooks
export { useAuth } from './hooks/use-auth';
export { useProtectedRoute } from './hooks/use-protected-route';

// Types (for TypeScript users)
export type { 
  LoginFormProps, 
  RegisterFormProps,
  AuthProviderProps,
  User,
  AuthState 
} from './types';

// ❌ NEVER export internal utilities
// export { validateEmail } from './utils/validation'; // FORBIDDEN
```

**Rationale:**
- Components = public UI API
- Hooks = public logic API
- Types = TypeScript contracts
- Internal utils = implementation details

---

## 🔄 Workflow & Task Management

### Task-Driven Development (UI Module)

**1. Branch Creation:**
```bash
feature/UI-MODULE-123-add-password-strength
bugfix/UI-MODULE-456-fix-form-validation
refactor/UI-MODULE-789-extract-input-component
```

**2. Task Documentation:**
Create task file:
```
docs/tasks/active/UI-MODULE-123-add-password-strength.md
```

**Task structure:**
```markdown
# UI-MODULE-123: Add Password Strength Indicator

## Description
Visual feedback for password strength during registration

## Implementation Details
- Component: PasswordStrength.tsx
- Uses zxcvbn library for strength calculation
- Accessible with ARIA live regions

## Files Modified
- src/components/RegisterForm/RegisterForm.tsx
- src/components/PasswordStrength/PasswordStrength.tsx (new)

## Breaking Changes
- None (backward compatible)

## Accessibility
- ARIA live region announces strength changes
- Color-blind friendly indicators
```

**3. On Release:**
Move to:
```
docs/tasks/archive/by-release/v2.0.0/UI-MODULE-123-add-password-strength.md
```

### Git Flow - UI Module

**Branch Structure:**
- `master` - Production releases only
- `develop` - Active development
- `feature/UI-MODULE-*` - New components/features
- `bugfix/UI-MODULE-*` - Bug fixes

**Workflow:**
```bash
# 1. Stacca da develop
git checkout develop
git pull origin develop
git checkout -b feature/UI-MODULE-123-password-strength

# 2. Sviluppo
# ... implementa componenti, testa, documenta ...

# 3. Bump version e push
npm version minor
git push origin feature/UI-MODULE-123-password-strength --tags

# 4. PR verso develop
gh pr create --base develop

# 5. Dopo merge in develop, per release:
git checkout master
git merge develop
git push origin master --tags
npm publish
```

**⚠️ IMPORTANTE:**
- ✅ Feature branch da `develop`
- ✅ PR verso `develop`
- ✅ `master` solo per release
- ❌ MAI PR dirette a `master`

### Development Workflow

**Simple changes:**
- Implement → Test → Update docs → Update CHANGELOG

**Complex changes:**
- Discuss approach → Implement → Test accessibility → Update docs → CHANGELOG → Version bump

**When blocked:**
- **DO**: Ask immediately
- **DON'T**: Break component APIs without approval

---

## 🎨 Component Patterns

### Composition Over Configuration:

```typescript
// ✅ GOOD: Composable
<LoginForm>
  <LoginForm.EmailField />
  <LoginForm.PasswordField />
  <LoginForm.RememberMe />
  <LoginForm.SubmitButton />
</LoginForm>

// Also support all-in-one for quick use
<LoginForm />
```

### Controlled & Uncontrolled:

```typescript
// Uncontrolled (default)
<LoginForm onSubmit={handleSubmit} />

// Controlled
<LoginForm 
  email={email}
  password={password}
  onEmailChange={setEmail}
  onPasswordChange={setPassword}
/>
```

---

## 🌍 Internationalization

**i18n Support:**
```typescript
// Provide translation function
<AuthProvider t={t}>
  <LoginForm />
</AuthProvider>

// Or use default English
<LoginForm />
```

**Translation keys:**
```typescript
'auth.login.email' → "Email"
'auth.login.password' → "Password"
'auth.login.submit' → "Login"
'auth.errors.invalid_credentials' → "Invalid email or password"
```

---

## 📦 Versioning & Breaking Changes

### Semantic Versioning

**MAJOR** - Breaking:
- Changed component props (removed/renamed)
- Changed hook return values
- Changed context API

**MINOR** - New features:
- New components
- New optional props
- New hooks

**PATCH** - Fixes:
- Bug fixes
- Style improvements
- Documentation

### Version Bump Command
**ALWAYS run before pushing:**
```bash
npm version patch  # Bug fixes (0.0.x)
npm version minor  # New features (0.x.0)
npm version major  # Breaking changes (x.0.0)

# This automatically:
# - Updates package.json version
# - Creates git commit "vX.X.X"
# - Creates git tag

# Then push:
git push && git push --tags
```

---

## 🚫 Restrictions

**NEVER without approval:**
- Breaking changes to component APIs
- Removing exported components
- Changing TypeScript types
- Major dependency upgrades

**CAN do autonomously:**
- New components (non-breaking)
- Bug fixes
- Style improvements
- Documentation

---

## ✅ Release Checklist

- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] No ESLint/TypeScript errors
- [ ] All components documented
- [ ] Storybook examples updated (if exists)
- [ ] README with examples
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Accessibility verified
- [ ] Mobile responsive tested

### Pre-Publish Hook (Recommended)

Aggiungi al `package.json` per bloccare pubblicazioni con errori:

```json
"scripts": {
  "prepublishOnly": "npm run verify && npm run test:cov"
}
```

Questo esegue automaticamente tutti i controlli prima di `npm publish` e blocca se qualcosa fallisce.

---

## 🎨 Code Style

**React Best Practices:**
- Functional components only
- Custom hooks for logic
- `React.memo()` for expensive components
- `useMemo/useCallback` where appropriate
- Composition over props drilling

**TypeScript:**
- Strict mode enabled
- Props interfaces exported
- Generic types for flexibility

---

## 🐛 Error Handling

**User-facing errors:**
```typescript
// Show error in UI
const [error, setError] = useState<string>();

<LoginForm 
  onError={(err) => setError(err.message)}
/>
{error && <ErrorMessage>{error}</ErrorMessage>}
```

**Developer errors:**
```typescript
// Throw for misuse
if (!apiClient) {
  throw new Error('AuthProvider requires apiClient prop');
}
```

---

## 💬 Communication Style

- Brief and direct
- Component-focused
- Highlight breaking changes
- Accessibility considerations

---

## 📋 Summary

**UI Module Principles:**
1. Customizable & unstyled by default
2. Accessible by design
3. Framework-agnostic data layer
4. Comprehensive testing
5. Complete TypeScript types
6. i18n support
7. Mobile responsive

**When in doubt:** Ask. UI components impact user experience across apps.

---

*Last Updated: January 30, 2026*  
*Version: 1.0.0*
