# Testing Auth Kit UI with Backend

## Step 1: Setup Backend

```bash
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit"

# Make sure you're on the correct branch
git branch --show-current
# Should be: refactor/MODULE-001-align-architecture-csr

# Install dependencies (if not already)
npm install

# Link for local testing
npm link

# Start backend
npm run dev
# Backend should be running on http://localhost:3000
```

## Step 2: Link Frontend with Backend

```bash
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit-ui"

# Link backend module
npm link @ciscode/authentication-kit

# Build frontend module
npm run build

# Link frontend module (for testing in apps)
npm link
```

## Step 3: Simple Test Script

Create a simple Node.js test script to validate API calls:

```typescript
// test-auth-api.ts
import { createUseAuth } from '../src/hooks/useAuth';

const testAuth = async () => {
  const useAuth = createUseAuth({
    baseUrl: 'http://localhost:3000',
    autoRefresh: true,
  });

  // In a real React component, you'd call useAuth()
  // For now, just test the API service directly
  
  const { AuthService } = await import('../src/services/auth.service');
  const authService = new AuthService('http://localhost:3000');

  console.log('Testing login...');
  
  try {
    const tokens = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });
    
    console.log('✅ Login successful!');
    console.log('Access Token:', tokens.accessToken.substring(0, 20) + '...');
    console.log('Refresh Token:', tokens.refreshToken.substring(0, 20) + '...');
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
  }
};

testAuth();
```

## Step 4: Test with React App

Create a minimal React test app:

```bash
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit-ui\examples"
mkdir test-app
cd test-app
npm create vite@latest . -- --template react-ts
npm install
npm link @ciscode/auth-kit-ui
```

Then create a test component:

```tsx
// examples/test-app/src/App.tsx
import { AuthProvider, useAuth } from '@ciscode/auth-kit-ui';

function LoginTest() {
  const { login, user, isAuthenticated, error, isLoading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({
        email: 'admin@example.com',
        password: 'admin123',
      });
      console.log('✅ Logged in!');
    } catch (err: any) {
      console.error('❌ Login failed:', err.message);
    }
  };

  return (
    <div>
      <h1>Auth Kit UI Test</h1>
      
      {isLoading && <p>Loading...</p>}
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {isAuthenticated ? (
        <div>
          <p>✅ Authenticated as: {user?.email}</p>
          <p>Roles: {user?.roles.join(', ')}</p>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider baseUrl="http://localhost:3000" autoRefresh={true}>
      <LoginTest />
    </AuthProvider>
  );
}

export default App;
```

## Step 5: Run Tests

### Backend
```bash
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit"
npm run dev
```

### Frontend Test App
```bash
cd "c:\Users\RedaChanna\Desktop\Ciscode Web Site\modules\auth-kit-ui\examples\test-app"
npm run dev
```

### Expected Flow:
1. Open http://localhost:5173 (Vite default port)
2. Click "Login" button
3. Should see "✅ Authenticated as: admin@example.com"
4. Check browser console for token logs
5. Check Network tab for API call to http://localhost:3000/api/auth/login

## Step 6: Validation Checklist

- [ ] Backend running on http://localhost:3000
- [ ] POST /api/auth/login returns accessToken and refreshToken
- [ ] Frontend can call backend API
- [ ] No CORS errors
- [ ] Tokens stored in localStorage
- [ ] User state updated after login
- [ ] JWT decoded correctly
- [ ] Auto-refresh works (wait ~5 minutes)

## Troubleshooting

### CORS Errors
Backend needs to allow frontend origin:
```typescript
// backend: main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### 401 Unauthorized
- Check if backend is running
- Check if credentials are correct
- Check if user exists in database (run seeder if needed)

### Module Resolution Errors
```bash
# Unlink and relink
npm unlink @ciscode/auth-kit-ui
npm link @ciscode/auth-kit-ui
```

---

## Next Steps After Validation

Once login flow works:
1. ✅ **Foundation validated** (BE ↔ FE communication works)
2. Move to **Step 2: Complete Refactoring**
   - Reorganize all components
   - Add guards (RequireAuth)
   - Complete public API
3. Move to **Step 3: Quality + Coverage**
   - Write tests
   - Documentation
   - Polish

---

**Created**: February 3, 2026  
**Purpose**: Validate Step 1 (Foundation + Validation)
