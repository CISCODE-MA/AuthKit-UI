# @ciscode/ui-authentication-kit

> **Production-ready authentication UI components for React applications**

[![npm version](https://img.shields.io/npm/v/@ciscode/ui-authentication-kit.svg)](https://www.npmjs.com/package/@ciscode/ui-authentication-kit)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

Complete authentication solution with built-in pages, RBAC support, and session management. Drop-in components that work with any backend API.

## ✨ Features

- 🔐 **Pre-built Auth Pages** - Login, Register, Password Reset, Profile
- 🛡️ **RBAC Support** - Role-based access control with permissions
- 🔄 **Session Management** - Automatic token refresh and expiration handling
- 🎨 **Customizable** - Headless components, bring your own styles
- ♿ **Accessible** - ARIA-compliant, keyboard navigation
- 🌍 **i18n Ready** - Multi-language support via `@ciscode/ui-translate-core`
- 📱 **Responsive** - Mobile-first design
- 🚀 **TypeScript** - Full type safety

## 📦 Installation

```bash
npm install @ciscode/ui-authentication-kit
# or
yarn add @ciscode/ui-authentication-kit
# or
pnpm add @ciscode/ui-authentication-kit
```

### Peer Dependencies

```bash
npm install react react-dom react-router-dom axios jwt-decode react-cookie lucide-react @ciscode/ui-translate-core
```

## 🚀 Quick Start

### 1. Wrap your app with `AuthProvider`

```tsx
import { AuthProvider } from '@ciscode/ui-authentication-kit';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider
        config={{
          apiUrl: 'https://api.example.com',
          loginPath: '/auth/login',
          registerPath: '/auth/register',
          profilePath: '/auth/profile',
          logoutPath: '/auth/logout',
          redirectAfterLogin: '/dashboard',
          redirectAfterLogout: '/',
        }}
      >
        {/* Your app routes */}
      </AuthProvider>
    </BrowserRouter>
  );
}
```

### 2. Use authentication state

```tsx
import { useAuthState } from '@ciscode/ui-authentication-kit';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthState();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Protect routes with permissions

```tsx
import { RequirePermissions } from '@ciscode/ui-authentication-kit';

function AdminPanel() {
  return (
    <RequirePermissions
      fallbackpermessions={['admin.view', 'admin.edit']}
      fallbackRoles={['super-admin']}
      redirectTo="/unauthorized"
    >
      <div>Admin Content</div>
    </RequirePermissions>
  );
}
```

## 📚 Documentation

- **[API Reference](docs/API.md)** - Complete API documentation
- **[Examples](docs/EXAMPLES.md)** - Integration examples
- **[Styling Guide](docs/STYLING.md)** - Customization guide
- **[Accessibility](docs/ACCESSIBILITY.md)** - A11y patterns
- **[Migration Guide](docs/MIGRATION.md)** - Upgrade guides
- **[Architecture](docs/ARCHITECTURE.md)** - Project structure
- **[Release Guide](docs/RELEASE.md)** - Release workflow

## 🧪 Testing

- Tests are centralized under the `tests/` folder.
- Vitest is configured with jsdom and a global setup in [tests/setup.ts](tests/setup.ts).
- Run tests: `npm test`
- Run coverage: `npm run test:cov`

Folder layout:

```
tests/
  components/
  context/
  hooks/
  utils/
  setup.ts
```

## 🎯 Key Components

| Component            | Description                                        |
| -------------------- | -------------------------------------------------- |
| `AuthProvider`       | Root provider for authentication state and routing |
| `ProfilePage`        | User profile management UI                         |
| `RequirePermissions` | Permission-based route guard                       |
| `RbacProvider`       | Role-based access control context                  |

## 🪝 Core Hooks

| Hook                   | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `useAuthState()`       | Access auth state (user, isAuthenticated, login, logout) |
| `useHasRole(role)`     | Check if user has a specific role                        |
| `useHasModule(module)` | Check if user has access to a module                     |
| `useCan(permission)`   | Check if user has a permission                           |
| `useGrant()`           | Access RBAC grant management                             |

## 🔐 RBAC Example

```tsx
import { RbacProvider, useHasRole, useCan } from '@ciscode/ui-authentication-kit';

function App() {
  return (
    <RbacProvider>
      <Dashboard />
    </RbacProvider>
  );
}

function Dashboard() {
  const isAdmin = useHasRole('admin');
  const canEditUsers = useCan('users.edit');

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {canEditUsers && <EditButton />}
    </div>
  );
}
```

## 🌐 Internationalization

The kit integrates with `@ciscode/ui-translate-core` for multi-language support:

```tsx
import { TranslateProvider } from '@ciscode/ui-translate-core';

<TranslateProvider locale="en" translations={translations}>
  <AuthProvider config={config}>
    <App />
  </AuthProvider>
</TranslateProvider>;
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Type check
npm run typecheck

# Lint
npm run lint

# Format code
npm run format:write
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes with tests
4. Submit a PR to `develop`

## 📄 License

ISC © [CISCODE](https://github.com/CISCODE-MA)

## 🔗 Links

- [GitHub Repository](https://github.com/CISCODE-MA/AuthKit-UI)
- [NPM Package](https://www.npmjs.com/package/@ciscode/ui-authentication-kit)
- [Report Issues](https://github.com/CISCODE-MA/AuthKit-UI/issues)

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🙏 Acknowledgments

Built with modern React patterns and best practices. Designed for enterprise applications.
