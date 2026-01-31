# Accessibility Guide

Accessibility (a11y) patterns and best practices for `@ciscode/ui-authentication-kit`.

---

## Overview

The Auth Kit is built with accessibility as a core principle. All components follow WCAG 2.1 Level AA guidelines and support:

- ✅ **Keyboard navigation**
- ✅ **Screen readers** (NVDA, JAWS, VoiceOver)
- ✅ **ARIA labels and roles**
- ✅ **Focus management**
- ✅ **Color contrast**
- ✅ **Reduced motion**

---

## Table of Contents

- [Keyboard Navigation](#keyboard-navigation)
- [Screen Reader Support](#screen-reader-support)
- [Focus Management](#focus-management)
- [ARIA Patterns](#aria-patterns)
- [Color Contrast](#color-contrast)
- [Error Handling](#error-handling)
- [Forms Accessibility](#forms-accessibility)
- [Testing Accessibility](#testing-accessibility)

---

## Keyboard Navigation

### Required Key Bindings

All interactive components must support these keyboard shortcuts:

| Key           | Action                                 |
| ------------- | -------------------------------------- |
| `Tab`         | Navigate to next focusable element     |
| `Shift + Tab` | Navigate to previous focusable element |
| `Enter`       | Activate button or submit form         |
| `Space`       | Toggle checkbox/radio, activate button |
| `Escape`      | Close modal/dropdown                   |
| `Arrow Keys`  | Navigate within select/dropdown        |

### Example: Accessible Login Form

```tsx
import { useRef, FormEvent } from 'react';

export function AccessibleLoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="login-heading">
      <h1 id="login-heading">Login to Your Account</h1>

      <div>
        <label htmlFor="email">
          Email Address
          <span aria-label="required">*</span>
        </label>
        <input
          ref={emailRef}
          id="email"
          type="email"
          required
          aria-required="true"
          aria-describedby="email-hint"
          autoComplete="email"
        />
        <span id="email-hint" className="hint">
          We'll never share your email
        </span>
      </div>

      <div>
        <label htmlFor="password">
          Password
          <span aria-label="required">*</span>
        </label>
        <input
          ref={passwordRef}
          id="password"
          type="password"
          required
          aria-required="true"
          aria-describedby="password-hint"
          autoComplete="current-password"
        />
        <span id="password-hint" className="hint">
          Minimum 8 characters
        </span>
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Screen Reader Support

### ARIA Live Regions

Use `aria-live` to announce dynamic content changes:

```tsx
export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <form>
      {/* Error announcement */}
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {error && <p>{error}</p>}
      </div>

      {/* Loading announcement */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {loading && <p>Logging in, please wait...</p>}
      </div>

      {/* Form fields */}
    </form>
  );
}
```

### Screen Reader Only Text

Hide visual elements but keep them accessible:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```tsx
<button>
  <span className="sr-only">Close dialog</span>
  <span aria-hidden="true">×</span>
</button>
```

---

## Focus Management

### Focus Trapping in Modals

Keep focus within modal when open:

```tsx
import { useEffect, useRef } from 'react';

export function SessionExpiredModal({ isOpen, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus modal
    dialogRef.current?.focus();

    // Trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }

      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      tabIndex={-1}
    >
      <h2 id="dialog-title">Session Expired</h2>
      <p id="dialog-description">Your session has expired. Please log in again.</p>
      <button onClick={onClose} autoFocus>
        OK
      </button>
    </div>
  );
}
```

### Skip Links

Allow users to skip navigation:

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav aria-label="Main navigation">{/* Navigation */}</nav>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

---

## ARIA Patterns

### Form Validation

```tsx
export function EmailInput({ error }: { error?: string }) {
  const errorId = error ? 'email-error' : undefined;

  return (
    <div>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" aria-invalid={!!error} aria-describedby={errorId} />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

### Loading States

```tsx
export function LoadingButton({ loading, children, ...props }: Props) {
  return (
    <button {...props} disabled={loading} aria-busy={loading} aria-live="polite">
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

### Permission-Based Content

```tsx
import { RequirePermissions, useCan } from '@ciscode/ui-authentication-kit';

export function AdminPanel() {
  const canEdit = useCan('admin.edit');

  return (
    <RequirePermissions fallbackpermessions={['admin.view']}>
      <section aria-labelledby="admin-heading">
        <h1 id="admin-heading">Admin Panel</h1>

        {/* Announce permission state to screen readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {canEdit ? 'You have edit permissions' : 'Read-only access'}
        </div>

        <div>
          <button disabled={!canEdit} aria-disabled={!canEdit}>
            Edit Settings
          </button>
        </div>
      </section>
    </RequirePermissions>
  );
}
```

---

## Color Contrast

### Minimum Requirements (WCAG AA)

- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

### Recommended Colors

```css
:root {
  /* WCAG AA compliant */
  --auth-primary: #0056b3; /* 4.6:1 on white */
  --auth-success: #28a745; /* 4.5:1 on white */
  --auth-danger: #c82333; /* 5.1:1 on white */
  --auth-text: #212529; /* 16.5:1 on white */
  --auth-text-muted: #6c757d; /* 4.5:1 on white */
}
```

### Don't Rely on Color Alone

```tsx
// ❌ BAD: Only color indicates error
<input style={{ borderColor: 'red' }} />

// ✅ GOOD: Icon + text + color
<div>
  <input aria-invalid="true" aria-describedby="error-message" />
  <span id="error-message" role="alert">
    <ErrorIcon aria-hidden="true" />
    Invalid email format
  </span>
</div>
```

---

## Error Handling

### Accessible Error Messages

```tsx
export function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Focus error summary
      errorSummaryRef.current?.focus();
      return;
    }

    // Submit form
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          role="alert"
          aria-labelledby="error-summary-heading"
          tabIndex={-1}
        >
          <h2 id="error-summary-heading">There are {Object.keys(errors).length} errors:</h2>
          <ul>
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <a href={`#${field}`}>{message}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      {/* More fields */}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Forms Accessibility

### Input Labels

```tsx
// ✅ GOOD: Explicit label association
<label htmlFor="username">Username</label>
<input id="username" type="text" />

// ✅ GOOD: Nested label
<label>
  Username
  <input type="text" />
</label>

// ❌ BAD: No label
<input type="text" placeholder="Username" />
```

### Required Fields

```tsx
<label htmlFor="email">
  Email
  <abbr title="required" aria-label="required">*</abbr>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

### Fieldsets and Legends

```tsx
<fieldset>
  <legend>Account Type</legend>
  <label>
    <input type="radio" name="account" value="personal" />
    Personal
  </label>
  <label>
    <input type="radio" name="account" value="business" />
    Business
  </label>
</fieldset>
```

### Autocomplete Attributes

```tsx
// Help password managers and autofill
<input
  type="email"
  name="email"
  autoComplete="email"
/>

<input
  type="password"
  name="password"
  autoComplete="current-password"
/>

<input
  type="password"
  name="new-password"
  autoComplete="new-password"
/>
```

---

## Testing Accessibility

### Automated Testing

```bash
npm install -D @axe-core/react
```

```tsx
// src/main.tsx (development only)
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing Checklist

- [ ] **Keyboard Navigation**
  - [ ] Can you reach all interactive elements with Tab?
  - [ ] Can you activate buttons with Enter/Space?
  - [ ] Can you close modals with Escape?
  - [ ] Is focus visible at all times?

- [ ] **Screen Reader**
  - [ ] Are all images/icons labeled?
  - [ ] Are errors announced?
  - [ ] Are loading states announced?
  - [ ] Do forms have proper labels?

- [ ] **Color Contrast**
  - [ ] Does text meet 4.5:1 contrast ratio?
  - [ ] Do buttons meet 3:1 contrast ratio?
  - [ ] Is error state visible without color?

- [ ] **Forms**
  - [ ] Are all inputs labeled?
  - [ ] Are required fields marked?
  - [ ] Are errors clearly communicated?
  - [ ] Do inputs have autocomplete attributes?

- [ ] **Focus Management**
  - [ ] Does focus move to modal when opened?
  - [ ] Is focus restored when modal closes?
  - [ ] Is focus trapped in modal?

### Browser Testing

Test with these screen readers:

- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca (free)
- **Mobile**: TalkBack (Android) or VoiceOver (iOS)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluator
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [pa11y](https://pa11y.org/) - Automated testing

---

## Best Practices Summary

### DO

✅ Provide text alternatives for non-text content  
✅ Ensure all functionality is keyboard accessible  
✅ Provide sufficient time for users to interact  
✅ Use ARIA attributes correctly  
✅ Maintain focus order  
✅ Test with real assistive technologies  
✅ Announce dynamic content changes

### DON'T

❌ Use `div` or `span` as buttons  
❌ Remove focus outlines without replacement  
❌ Rely on color alone to convey information  
❌ Use `tabindex` greater than 0  
❌ Disable zoom/pinch on mobile  
❌ Auto-play audio/video  
❌ Use time-based UI changes without warning

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

_Last Updated: January 31, 2026_  
_Version: 1.0.8_
