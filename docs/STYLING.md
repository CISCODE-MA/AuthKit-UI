# Styling Guide

How to customize and style components in `@ciscode/ui-authentication-kit`.

---

## Table of Contents

- [Philosophy](#philosophy)
- [Customization Methods](#customization-methods)
- [Component-Specific Styling](#component-specific-styling)
- [Theme System](#theme-system)
- [Tailwind Integration](#tailwind-integration)
- [CSS Variables](#css-variables)
- [Dark Mode](#dark-mode)
- [Responsive Design](#responsive-design)

---

## Philosophy

**Headless by Default**

The Auth Kit UI components are designed to be **unstyled by default** with minimal base styles. This means:

- ✅ You control the appearance
- ✅ No CSS conflicts with your app
- ✅ Works with any CSS framework
- ✅ Small bundle size

**Bring Your Own Styles**

You can style components using:

1. **CSS Modules**
2. **Tailwind CSS**
3. **Styled Components / Emotion**
4. **Plain CSS**
5. **Inline styles**

---

## Customization Methods

### 1. CSS Modules

```tsx
// CustomLogin.module.css
.loginContainer {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.button {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

```tsx
// CustomLogin.tsx
import { useAuthState } from '@ciscode/ui-authentication-kit';
import styles from './CustomLogin.module.css';

export default function CustomLogin() {
  const { login } = useAuthState();

  return (
    <div className={styles.loginContainer}>
      <h1>Login</h1>
      <input className={styles.input} type="email" placeholder="Email" />
      <input className={styles.input} type="password" placeholder="Password" />
      <button className={styles.button}>Login</button>
    </div>
  );
}
```

---

### 2. Tailwind CSS

```tsx
// CustomLogin.tsx
import { useAuthState } from '@ciscode/ui-authentication-kit';

export default function CustomLogin() {
  const { login } = useAuthState();

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="email"
        placeholder="Email"
      />
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="password"
        placeholder="Password"
      />
      <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
        Login
      </button>
    </div>
  );
}
```

---

### 3. Styled Components

```tsx
// CustomLogin.tsx
import styled from 'styled-components';
import { useAuthState } from '@ciscode/ui-authentication-kit';

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

export default function CustomLogin() {
  const { login } = useAuthState();

  return (
    <Container>
      <h1>Login</h1>
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Button>Login</Button>
    </Container>
  );
}
```

---

## Component-Specific Styling

### ProfilePage

The `ProfilePage` component accepts a `className` prop:

```tsx
import { ProfilePage } from '@ciscode/ui-authentication-kit';

// With CSS Module
import styles from './Profile.module.css';
<ProfilePage className={styles.profile} />

// With Tailwind
<ProfilePage className="max-w-4xl mx-auto p-6" />

// With styled-components
const StyledProfile = styled(ProfilePage)`
  max-width: 800px;
  margin: 0 auto;
`;
<StyledProfile />
```

### RequirePermissions

Style the wrapper or content:

```tsx
import { RequirePermissions } from '@ciscode/ui-authentication-kit';

<RequirePermissions fallbackpermessions={['admin.access']} redirectTo="/unauthorized">
  <div className="admin-panel bg-gray-50 p-8 rounded-lg">
    <h1 className="text-3xl font-bold">Admin Panel</h1>
    {/* Content */}
  </div>
</RequirePermissions>;
```

---

## Theme System

Create a centralized theme for your auth components:

### CSS Variables Approach

```css
/* styles/theme.css */
:root {
  /* Colors */
  --auth-primary: #007bff;
  --auth-primary-hover: #0056b3;
  --auth-secondary: #6c757d;
  --auth-success: #28a745;
  --auth-danger: #dc3545;
  --auth-warning: #ffc107;

  /* Typography */
  --auth-font-family: 'Inter', system-ui, sans-serif;
  --auth-font-size-base: 16px;
  --auth-font-size-lg: 18px;
  --auth-font-size-sm: 14px;

  /* Spacing */
  --auth-spacing-xs: 0.25rem;
  --auth-spacing-sm: 0.5rem;
  --auth-spacing-md: 1rem;
  --auth-spacing-lg: 1.5rem;
  --auth-spacing-xl: 2rem;

  /* Borders */
  --auth-border-radius: 4px;
  --auth-border-radius-lg: 8px;
  --auth-border-color: #ddd;

  /* Shadows */
  --auth-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --auth-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.1);
  --auth-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

```tsx
// src/main.tsx
import './styles/theme.css';
```

```css
/* styles/auth-components.css */
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--auth-spacing-xl);
  background: white;
  border-radius: var(--auth-border-radius-lg);
  box-shadow: var(--auth-shadow-md);
}

.auth-input {
  width: 100%;
  padding: var(--auth-spacing-md);
  font-size: var(--auth-font-size-base);
  border: 1px solid var(--auth-border-color);
  border-radius: var(--auth-border-radius);
  margin-bottom: var(--auth-spacing-md);
}

.auth-button {
  width: 100%;
  padding: var(--auth-spacing-md);
  background: var(--auth-primary);
  color: white;
  border: none;
  border-radius: var(--auth-border-radius);
  cursor: pointer;
  font-size: var(--auth-font-size-base);
  transition: background 0.2s;
}

.auth-button:hover {
  background: var(--auth-primary-hover);
}
```

### Theme Context (Advanced)

```tsx
// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    danger: string;
    success: string;
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
}

const defaultTheme: Theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    danger: '#dc3545',
    success: '#28a745',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<Theme>(defaultTheme);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
```

```tsx
// Usage
import { useTheme } from '../contexts/ThemeContext';

function StyledButton() {
  const theme = useTheme();

  return (
    <button
      style={{
        background: theme.colors.primary,
        padding: theme.spacing.md,
      }}
    >
      Login
    </button>
  );
}
```

---

## Tailwind Integration

### Setup Tailwind with Auth Kit

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'auth-primary': '#007bff',
        'auth-secondary': '#6c757d',
      },
    },
  },
  plugins: [],
};
```

### Reusable Tailwind Components

```tsx
// src/components/AuthInput.tsx
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function AuthInput({ error, className = '', ...props }: AuthInputProps) {
  return (
    <div className="mb-4">
      <input
        className={`
          w-full px-4 py-2 
          border rounded-md 
          focus:outline-none focus:ring-2 
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

```tsx
// src/components/AuthButton.tsx
interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export function AuthButton({
  variant = 'primary',
  loading,
  children,
  className = '',
  ...props
}: AuthButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      className={`
        w-full py-2 px-4 rounded-md 
        transition duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

---

## CSS Variables

The Auth Kit components expose CSS variables for easy customization:

```css
/* Override default variables */
:root {
  --auth-kit-primary: #ff6b6b;
  --auth-kit-secondary: #4ecdc4;
  --auth-kit-font-family: 'Poppins', sans-serif;
  --auth-kit-border-radius: 12px;
}
```

### Available Variables

| Variable                   | Default     | Description        |
| -------------------------- | ----------- | ------------------ |
| `--auth-kit-primary`       | `#007bff`   | Primary color      |
| `--auth-kit-secondary`     | `#6c757d`   | Secondary color    |
| `--auth-kit-danger`        | `#dc3545`   | Error/danger color |
| `--auth-kit-success`       | `#28a745`   | Success color      |
| `--auth-kit-font-family`   | `system-ui` | Font family        |
| `--auth-kit-border-radius` | `4px`       | Border radius      |
| `--auth-kit-spacing`       | `1rem`      | Base spacing unit  |

---

## Dark Mode

### CSS Variables Approach

```css
/* styles/theme.css */
:root {
  --auth-bg: white;
  --auth-text: #1a1a1a;
  --auth-border: #ddd;
}

[data-theme='dark'] {
  --auth-bg: #1a1a1a;
  --auth-text: #ffffff;
  --auth-border: #333;
}

.auth-container {
  background: var(--auth-bg);
  color: var(--auth-text);
  border: 1px solid var(--auth-border);
}
```

```tsx
// src/components/ThemeToggle.tsx
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Tailwind Dark Mode

```js
// tailwind.config.js
export default {
  darkMode: 'class', // or 'media'
  // ...
};
```

```tsx
// Usage
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  <AuthInput className="bg-gray-100 dark:bg-gray-800" />
</div>
```

---

## Responsive Design

### Mobile-First Approach

```css
/* Mobile default */
.auth-container {
  padding: 1rem;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .auth-container {
    padding: 2rem;
    max-width: 500px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .auth-container {
    padding: 3rem;
    max-width: 600px;
  }
}
```

### Tailwind Responsive

```tsx
<div
  className="
  px-4 md:px-8 lg:px-12
  py-6 md:py-10 lg:py-16
  max-w-full md:max-w-md lg:max-w-lg
  mx-auto
"
>
  <AuthInput className="text-sm md:text-base lg:text-lg" />
</div>
```

---

## Best Practices

### 1. Consistent Design System

```tsx
// src/styles/tokens.ts
export const tokens = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
};
```

### 2. Component Composition

```tsx
// Build complex UIs from simple components
<AuthCard>
  <AuthHeader title="Login" />
  <AuthForm onSubmit={handleLogin}>
    <AuthInput name="email" type="email" />
    <AuthInput name="password" type="password" />
    <AuthButton type="submit">Login</AuthButton>
  </AuthForm>
  <AuthFooter>
    <Link to="/forgot-password">Forgot password?</Link>
  </AuthFooter>
</AuthCard>
```

### 3. Accessibility

Always maintain proper contrast and focus states:

```css
.auth-button:focus {
  outline: 2px solid var(--auth-primary);
  outline-offset: 2px;
}

.auth-input:focus {
  border-color: var(--auth-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}
```

---

_Last Updated: January 31, 2026_  
_Version: 1.0.8_
