# Auth Kit UI - Examples

Copy-paste ready examples for different design systems.

---

## 📚 Available Examples

### Basic Examples
- [Tailwind CSS Login Form](TailwindLoginForm.example.tsx)
- [Material-UI Login Form](MuiLoginForm.example.tsx)
- [Plain CSS Login Form](PlainLoginForm.example.tsx)

### Advanced Patterns
- [Protected Route](ProtectedRoute.example.tsx)
- [Role-Based Route](RoleBasedRoute.example.tsx)
- [Registration Form](RegisterForm.example.tsx)
- [Password Reset Flow](PasswordReset.example.tsx)

---

## 🚀 How to Use

1. **Copy** the example file to your project
2. **Rename** from `.example.tsx` to `.tsx`
3. **Customize** styling and behavior
4. **Import** and use in your app

---

## 💡 Design System Integration

### Tailwind CSS

```bash
npm install tailwindcss
```

Use `TailwindLoginForm.example.tsx` as starting point.

### Material-UI

```bash
npm install @mui/material @emotion/react @emotion/styled
```

Use `MuiLoginForm.example.tsx` as starting point.

### Plain CSS

No dependencies needed. Use `PlainLoginForm.example.tsx` with your own CSS file.

---

## 🔗 Full Integration Example

See [../docs/BACKEND_INTEGRATION.md](../docs/BACKEND_INTEGRATION.md) for complete integration guide with routing and state management.

---

## 📝 Notes

- All examples assume you've created `useAuth` hook via `createUseAuth()`
- Examples are **production-ready** - feel free to use as-is or customize
- TypeScript types are included in all examples
- Examples follow React best practices (hooks, composition, error handling)

---

**Need help?** Open an issue on [GitHub](https://github.com/ciscode/auth-kit-ui/issues)
