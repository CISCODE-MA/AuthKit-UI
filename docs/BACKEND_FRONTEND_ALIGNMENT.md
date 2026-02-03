# 🔄 Auth Kit Backend ↔️ Frontend Alignment

> **Cross-reference document showing how backend and frontend align**

---

## 📦 Module Overview

| Aspect | Backend (Auth Kit) | Frontend (Auth Kit UI) |
|--------|-------------------|------------------------|
| **Package** | `@ciscode/authentication-kit` | `@ciscode/auth-kit-ui` |
| **Branch** | `refactor/MODULE-001-align-architecture-csr` | `refactor/MODULE-UI-001-align-with-backend` |
| **Pattern** | CSR (Controller-Service-Repository) | Component-Hook-Service |
| **Framework** | NestJS | React + TypeScript |
| **Purpose** | Auth backend logic | Auth UI components |

---

## 🏗️ Architecture Mapping

### Backend Structure → Frontend Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  controllers/          →  services/ (API calls)                      │
│    auth.controller.ts  →    auth.service.ts                          │
│    users.controller.ts →    user.service.ts                          │
│                                                                       │
│  services/             →  hooks/ (business logic)                    │
│    auth.service.ts     →    useAuth.ts                               │
│                                                                       │
│  dto/                  →  models/ (TypeScript types)                 │
│    login.dto.ts        →    auth.types.ts                            │
│    register.dto.ts     →    auth.types.ts                            │
│                                                                       │
│  guards/               →  components/guards/ (route protection)      │
│    jwt-auth.guard.ts   →    RequireAuth.tsx                          │
│    roles.guard.ts      →    RequireRole.tsx                          │
│    admin.guard.ts      →    RequirePermissions.tsx                   │
│                                                                       │
│  decorators/           →  hooks/ (data extraction)                   │
│    current-user.dec.ts →    useAuth.ts (user property)               │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  components/auth/      →  UI for backend endpoints                   │
│    SignInForm.tsx      →  calls auth.service.login()                 │
│    SignUpForm.tsx      →  calls auth.service.register()              │
│    ProfileCard.tsx     →  displays user data                         │
│                                                                       │
│  services/             →  HTTP clients for backend                   │
│    auth.service.ts     →  calls /api/auth/* endpoints                │
│    user.service.ts     →  calls /api/users/* endpoints               │
│                                                                       │
│  hooks/                →  React hooks wrapping services              │
│    useAuth.ts          →  wraps auth.service                         │
│    usePermissions.ts   →  wraps permissions logic                    │
│                                                                       │
│  providers/            →  React Context for state                    │
│    AuthProvider.tsx    →  manages auth state globally                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints ↔️ Frontend Services

### Authentication Endpoints

| Backend Endpoint | Backend Controller | Frontend Service | Frontend Component/Hook |
|------------------|-------------------|------------------|------------------------|
| `POST /auth/login` | `AuthController.login()` | `AuthService.login()` | `SignInForm.tsx`, `useAuth.login()` |
| `POST /auth/register` | `AuthController.register()` | `AuthService.register()` | `SignUpForm.tsx`, `useAuth.register()` |
| `POST /auth/logout` | `AuthController.logout()` | `AuthService.logout()` | `useAuth.logout()` |
| `POST /auth/refresh` | `AuthController.refresh()` | `AuthService.refreshToken()` | `useAuth.refreshToken()` |
| `POST /auth/verify-email` | `AuthController.verifyEmail()` | `AuthService.verifyEmail()` | `EmailVerificationPage.tsx` |
| `POST /auth/forgot-password` | `AuthController.forgotPassword()` | `AuthService.resetPassword()` | `ResetPasswordForm.tsx` |

### User Endpoints

| Backend Endpoint | Backend Controller | Frontend Service | Frontend Component/Hook |
|------------------|-------------------|------------------|------------------------|
| `GET /users/me` | `UsersController.getProfile()` | `UserService.getProfile()` | `ProfileCard.tsx`, `useProfile.data` |
| `PATCH /users/me` | `UsersController.updateProfile()` | `UserService.updateProfile()` | `ProfileEditForm.tsx` |
| `POST /users/me/password` | `UsersController.changePassword()` | `UserService.changePassword()` | `ChangePasswordForm.tsx` |

### OAuth Endpoints

| Backend Endpoint | Backend Controller | Frontend Service | Frontend Component |
|------------------|-------------------|------------------|-------------------|
| `GET /auth/google` | `AuthController.googleAuth()` | - | `SocialButton` (redirect) |
| `GET /auth/google/callback` | `AuthController.googleCallback()` | - | `GoogleCallbackPage.tsx` |
| `GET /auth/microsoft` | `AuthController.microsoftAuth()` | - | `SocialButton` (redirect) |
| `GET /auth/facebook` | `AuthController.facebookAuth()` | - | `SocialButton` (redirect) |

---

## 📋 DTOs ↔️ TypeScript Types

### Authentication Types

| Backend DTO | Frontend Type | Usage |
|-------------|--------------|-------|
| `LoginDto` | `LoginCredentials` | Login form data |
| `RegisterDto` | `RegisterData` | Registration form data |
| `UserDto` | `User` | User profile data |
| `AuthTokensDto` | `AuthTokens` | JWT access/refresh tokens |

**Backend** (`dto/auth/login.dto.ts`):
```typescript
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**Frontend** (`models/auth.types.ts`):
```typescript
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}
```

### Role & Permission Types

| Backend DTO | Frontend Type | Usage |
|-------------|--------------|-------|
| `CreateRoleDto` | `CreateRoleData` | Creating roles |
| `UpdateRoleDto` | `UpdateRoleData` | Updating roles |
| `RoleDto` | `Role` | Role data |
| `PermissionDto` | `Permission` | Permission data |

---

## 🛡️ Guards ↔️ Route Protection

### Backend Guards → Frontend Guards

| Backend Guard | Purpose | Frontend Equivalent | Usage |
|--------------|---------|-------------------|-------|
| `AuthenticateGuard` | Verify JWT token | `RequireAuth` | Protect routes requiring login |
| `RolesGuard` | Check user roles | `RequireRole` | Protect admin/manager routes |
| `AdminGuard` | Check admin role | `RequirePermissions` | Protect admin-only routes |

**Backend** (`guards/jwt-auth.guard.ts`):
```typescript
@Injectable()
export class AuthenticateGuard extends AuthGuard('jwt') {
  // Validates JWT token from request
}
```

**Frontend** (`components/guards/RequireAuth.tsx`):
```typescript
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}
```

**Usage Comparison**:

```typescript
// Backend - Protect controller endpoint
@UseGuards(AuthenticateGuard, RolesGuard)
@Roles('admin')
@Get('admin/users')
getAdminUsers() { }

// Frontend - Protect route
<Routes>
  <Route path="/admin/users" element={
    <RequireAuth>
      <RequireRole roles={['admin']}>
        <AdminUsersPage />
      </RequireRole>
    </RequireAuth>
  } />
</Routes>
```

---

## 🎣 Decorators ↔️ Hooks

### Backend Decorators → Frontend Hooks

| Backend Decorator | Purpose | Frontend Hook | Usage |
|------------------|---------|--------------|-------|
| `@CurrentUser()` | Extract user from request | `useAuth().user` | Get current user |
| `@Roles()` | Define required roles | `usePermissions().hasRole()` | Check user role |
| `@Admin()` | Mark admin-only | `usePermissions().isAdmin` | Check if admin |

**Backend**:
```typescript
@Get('profile')
@UseGuards(AuthenticateGuard)
getProfile(@CurrentUser() user: User) {
  return user; // Extracted from JWT
}
```

**Frontend**:
```typescript
function ProfilePage() {
  const { user } = useAuth();
  return <div>{user?.name}</div>;
}
```

---

## 🔧 Services Alignment

### Backend Service → Frontend Service

**Backend** (`services/auth.service.ts`):
```typescript
@Injectable()
export class AuthService {
  async login(email: string, password: string): Promise<AuthTokens> {
    // Validate credentials, generate JWT
  }
  
  async register(dto: RegisterDto): Promise<User> {
    // Create user, send verification email
  }
}
```

**Frontend** (`services/auth.service.ts`):
```typescript
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    return httpClient.post('/api/auth/login', credentials);
  }
  
  async register(data: RegisterData): Promise<User> {
    return httpClient.post('/api/auth/register', data);
  }
}
```

**Frontend Hook** (`hooks/useAuth.ts`):
```typescript
export function useAuth() {
  const login = async (credentials: LoginCredentials) => {
    const tokens = await authService.login(credentials);
    // Store tokens, update state
  };
  
  return { user, login, logout, isAuthenticated };
}
```

---

## 📤 Public API Exports

### Backend Exports

```typescript
// index.ts
export { AuthModule } from './auth-kit.module';

// Services
export { AuthService } from './services/auth.service';

// DTOs
export { LoginDto, RegisterDto, UserDto } from './dto/auth';

// Guards
export { AuthenticateGuard } from './guards/jwt-auth.guard';
export { RolesGuard } from './guards/roles.guard';
export { AdminGuard } from './guards/admin.guard';

// Decorators
export { CurrentUser } from './decorators/current-user.decorator';
export { Roles } from './decorators/roles.decorator';
export { Admin } from './decorators/admin.decorator';

// Types
export type { AuthModuleOptions } from './types';
```

### Frontend Exports (Proposed)

```typescript
// index.ts
// Components
export { SignInForm } from './components/auth/SignInForm';
export { SignUpForm } from './components/auth/SignUpForm';
export { ProfileCard } from './components/auth/ProfileCard';

// Guards
export { RequireAuth } from './components/guards/RequireAuth';
export { RequireRole } from './components/guards/RequireRole';
export { RequirePermissions } from './components/guards/RequirePermissions';

// Hooks (PRIMARY API)
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';
export { useProfile } from './hooks/useProfile';

// Providers
export { AuthProvider } from './providers/AuthProvider';

// Types
export type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  Role,
  Permission,
} from './models/auth.types';
```

---

## 🔄 Data Flow

### Login Flow Example

```
┌─────────────────────────────────────────────────────────────────┐
│                           USER ACTION                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: SignInForm.tsx                                        │
│  - User enters email/password                                    │
│  - Form submits                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: useAuth.login()                                       │
│  - Calls authService.login(credentials)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: authService.login()                                   │
│  - POST /api/auth/login with credentials                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP Request
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: AuthController.login()                                 │
│  - Receives LoginDto                                             │
│  - Validates with class-validator                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: AuthService.login()                                    │
│  - Validate credentials                                          │
│  - Generate JWT tokens                                           │
│  - Return AuthTokensDto                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP Response
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: authService.login() response                          │
│  - Receives AuthTokens { accessToken, refreshToken }             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: useAuth.login()                                       │
│  - Store tokens in localStorage/cookies                          │
│  - Update auth state (user, isAuthenticated)                     │
│  - Decode JWT to get user info                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Navigate to dashboard                                 │
│  - User is now authenticated                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Alignment

### Backend Tests → Frontend Tests

| Backend Test | Frontend Test | Purpose |
|-------------|--------------|---------|
| `auth.service.spec.ts` | `useAuth.test.ts` | Business logic |
| `auth.controller.spec.ts` | `SignInForm.test.tsx` | Integration |
| `jwt-auth.guard.spec.ts` | `RequireAuth.test.tsx` | Route protection |
| E2E: Login flow | Integration: Login flow | Full flow |

**Coverage Target**: Both 80%+

---

## 🔐 Security Alignment

### Backend Security → Frontend Security

| Backend | Frontend | Purpose |
|---------|----------|---------|
| JWT validation | Token storage (httpOnly cookies preferred) | Secure auth |
| Input validation (class-validator) | Client-side validation | Prevent invalid data |
| Rate limiting | Request throttling | Prevent abuse |
| CORS configuration | API base URL configuration | Secure communication |
| Error sanitization | Generic error messages | Don't leak internals |

---

## 📦 Dependency Alignment

### Backend Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "passport-jwt": "^4.0.0",
    "bcrypt": "^5.1.0"
  }
}
```

### Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

**Note**: Frontend should NOT depend on backend package directly (separate deployments).

---

## 🎯 Integration Points

### How Apps Use Both Modules

**Backend Integration**:
```typescript
// app.module.ts
import { AuthModule } from '@ciscode/authentication-kit';

@Module({
  imports: [
    AuthModule.forRoot({
      jwtSecret: process.env.JWT_SECRET,
      database: { uri: process.env.MONGO_URI },
    }),
  ],
})
export class AppModule {}
```

**Frontend Integration**:
```typescript
// main.tsx
import { AuthProvider } from '@ciscode/auth-kit-ui';

function App() {
  return (
    <AuthProvider apiBaseUrl="http://localhost:3000/api">
      <SignInForm />
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    </AuthProvider>
  );
}
```

---

## ✅ Alignment Checklist

- [ ] Frontend types match backend DTOs
- [ ] Frontend services call backend endpoints
- [ ] Frontend guards protect routes like backend guards
- [ ] Frontend hooks expose same functionality as backend decorators
- [ ] Error handling consistent (status codes, messages)
- [ ] Both modules follow same quality standards (80%+ tests, docs)
- [ ] Public APIs clearly defined and documented
- [ ] Integration tested together

---

## 🚀 Next Steps

1. **Complete Frontend Restructuring**
   - Follow `MODULE-UI-001` task document
   - Align with backend architecture

2. **Sync Types**
   - Create TypeScript interfaces matching backend DTOs
   - Ensure strict type compatibility

3. **Implement API Services**
   - Create services calling backend endpoints
   - Handle errors consistently

4. **Test Integration**
   - Link both modules
   - Test full auth flow
   - Verify compatibility

5. **Documentation**
   - Document integration steps
   - Provide examples
   - Create migration guide

---

*Last Updated*: February 3, 2026  
*Related Documents*:
- [Backend Compliance](../../auth-kit/docs/COMPLIANCE_SUMMARY.md)
- [Frontend Compliance](./COMPLIANCE_SUMMARY.md)
- [Frontend Task](./tasks/active/MODULE-UI-001-align-with-backend.md)
