# Component Development Instructions - AuthKit-UI

> **Purpose**: React component development standards for authentication UI components.

---

## 🎯 Component Architecture

### Component Structure

```
ComponentName/
  ├── ComponentName.tsx       # Main component
  ├── ComponentName.test.tsx  # Tests
  ├── ComponentName.types.ts  # Props & types
  ├── ComponentName.styles.ts # Styled components (if using)
  └── index.ts                # Exports
```

### Component Template

```typescript
import React from 'react';
import { ComponentNameProps } from './ComponentName.types';

/**
 * Brief description of component purpose
 * @param {ComponentNameProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
```

---

## 📝 Props Standards

### Props Interface

```typescript
export interface ComponentNameProps {
  /** Primary content */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Callback on action */
  onAction?: (data: ActionData) => void;
  /** Accessibility label */
  'aria-label'?: string;
}
```

### Required Props Documentation

- ✅ JSDoc for all props
- ✅ Default values clearly stated
- ✅ Callback signatures with examples
- ✅ Accessibility props documented

---

## ♿ Accessibility (A11y)

### WCAG 2.1 AA Compliance

```typescript
// ✅ Good
<button
  aria-label="Login to account"
  aria-busy={isLoading}
  disabled={isLoading}
>
  {isLoading ? 'Loading...' : 'Login'}
</button>

// ❌ Bad
<button onClick={login}>Login</button>
```

### Keyboard Navigation

- ✅ All interactive elements keyboard accessible
- ✅ Logical tab order
- ✅ Enter/Space triggers actions
- ✅ Escape closes modals/dialogs

### Screen Reader Support

- ✅ `aria-label` for icon buttons
- ✅ `aria-describedby` for error messages
- ✅ `role` attributes where needed
- ✅ Live regions for dynamic content

---

## 🎨 Theming & Styling

### Theme Support

```typescript
import { useTheme } from '../context/ThemeContext';

export const ThemedButton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <button style={{
      backgroundColor: theme.colors.primary,
      color: theme.colors.text
    }}>
      Click
    </button>
  );
};
```

### CSS-in-JS / Styled Components

```typescript
import styled from 'styled-components';

export const StyledButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

---

## 🧪 Component Testing

### Test Coverage Requirements

```typescript
describe('LoginForm', () => {
  it('renders form fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });
  });

  it('disables submit while loading', () => {
    render(<LoginForm isLoading />);
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });
});
```

### Testing Best Practices

- ✅ Use `@testing-library/react` and `@testing-library/user-event`
- ✅ Query by role/label, not test IDs
- ✅ Test user interactions, not implementation
- ✅ Mock external dependencies (API calls)
- ✅ Test error states and loading states
- ✅ Verify accessibility attributes

---

## 🔄 State Management

### Local State (useState)

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ email: '', password: '' });
```

### Form State (React Hook Form recommended)

```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

<input {...register('email', { required: 'Email is required' })} />
{errors.email && <span>{errors.email.message}</span>}
```

### Global State (Context API)

```typescript
import { useAuth } from '../context/AuthContext';

const { user, login, logout } = useAuth();
```

---

## 📦 Component Exports

### Public API (index.ts)

```typescript
// ✅ Export component and types
export { LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm.types';

// ❌ Don't export internals
// export { validateEmail } from './utils'; // Keep internal
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Prop Drilling

```typescript
// Bad - passing props through multiple levels
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />
  </Child>
</Parent>

// Good - use context for deep prop passing
const DataContext = createContext();
<DataContext.Provider value={data}>
  <Parent>
    <Child>
      <GrandChild />
    </Child>
  </Parent>
</DataContext.Provider>
```

### ❌ Inline Object/Function Props

```typescript
// Bad - creates new reference on every render
<Button onClick={() => handleClick()} style={{ color: 'red' }} />

// Good - stable references
const handleButtonClick = useCallback(() => handleClick(), []);
const buttonStyle = useMemo(() => ({ color: 'red' }), []);
<Button onClick={handleButtonClick} style={buttonStyle} />
```

### ❌ Missing Memoization for Expensive Computations

```typescript
// Bad
const expensiveValue = computeExpensiveValue(props.data);

// Good
const expensiveValue = useMemo(() => computeExpensiveValue(props.data), [props.data]);
```

---

## 📋 Pre-Commit Checklist

- [ ] Component has proper TypeScript types
- [ ] Props are documented with JSDoc
- [ ] Accessibility attributes present (`aria-*`, `role`)
- [ ] Keyboard navigation works
- [ ] Tests cover main user flows
- [ ] Error states handled gracefully
- [ ] Loading states shown when async
- [ ] Component exported in `index.ts`
- [ ] No console.log/errors in production code
- [ ] Follows naming conventions (PascalCase)

---

## 📚 Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Testing Library Docs](https://testing-library.com/react)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
