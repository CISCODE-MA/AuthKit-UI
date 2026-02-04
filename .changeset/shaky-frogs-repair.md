---
'@ciscode/ui-authentication-kit': major
---

# v2.0.0 - Hooks-Only API

**BREAKING CHANGES:**

- **Removed UI component exports** - This library now exports only hooks and types. Apps must build their own UI components using the provided hooks.
- **New primary API**: `createUseAuth()` - Factory function that creates a pre-configured `useAuth` hook
- **Legacy API deprecated**: `AuthProvider` and `useAuthState` are deprecated and will be removed in v3.0.0

**New Features:**

- ✅ Hooks-first API with `createUseAuth()` factory
- ✅ Auto-refresh token support (configurable)
- ✅ RBAC helpers: `hasRole()`, `hasPermission()`
- ✅ Complete JSDoc documentation with examples
- ✅ 66 tests with 87% coverage
- ✅ Full TypeScript support with strict mode

**Migration Guide:**

```typescript
// v1.x (OLD - using context)
import { AuthProvider, useAuthState } from '@ciscode/ui-authentication-kit';

function App() {
  return (
    <AuthProvider config={{ baseUrl: '...' }}>
      <MyApp />
    </AuthProvider>
  );
}

// v2.0 (NEW - using factory hook)
import { createUseAuth } from '@ciscode/ui-authentication-kit';

export const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true,
});

function MyComponent() {
  const { login, user, isAuthenticated } = useAuth();
  // Build your own UI
}
```

**Documentation:**

- [Backend Integration Guide](docs/BACKEND_INTEGRATION.md)
- [Examples](examples/) - Tailwind, MUI, Plain CSS examples
- [Architecture](docs/ARCHITECTURE.md)

**Why hooks-only?**
- ✅ Works with any design system (Tailwind, MUI, Ant Design, etc.)
- ✅ Platform agnostic (React web, React Native, Next.js, Remix)
- ✅ Smaller bundle size (no UI dependencies)
- ✅ Full control over UI/UX
- ✅ Easier to test and maintain
