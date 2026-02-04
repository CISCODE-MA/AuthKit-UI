/**
 * Role-Based Route Example
 * 
 * Usage:
 * 1. Copy this file to your project
 * 2. Rename to RoleBasedRoute.tsx
 * 3. Install dependencies:
 *    npm install @ciscode/ui-authentication-kit
 * 4. Wrap routes that require specific roles
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { createUseAuth } from '@ciscode/ui-authentication-kit';

// Initialize the auth hook with your backend URL
const useAuth = createUseAuth({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  autoRefresh: true,
});

interface RoleBasedRouteProps {
  children: ReactNode;
  /**
   * Required role(s) to access this route
   */
  requiredRole?: string | string[];
  /**
   * Required permission(s) to access this route
   */
  requiredPermission?: string | string[];
  /**
   * Path to redirect to when access is denied
   * @default '/unauthorized'
   */
  redirectTo?: string;
}

export function RoleBasedRoute({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = '/unauthorized',
}: RoleBasedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasPermission, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = roles.some((role) => hasRole(role));
    
    if (!hasRequiredRole) {
      return <Navigate to={redirectTo} state={{ reason: 'insufficient_role' }} replace />;
    }
  }

  // Check permission requirement
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const hasRequiredPermission = permissions.some((perm) => hasPermission(perm));
    
    if (!hasRequiredPermission) {
      return <Navigate to={redirectTo} state={{ reason: 'insufficient_permission' }} replace />;
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
}

/**
 * Unauthorized Page Component
 */
export function UnauthorizedPage() {
  const { user } = useAuth();
  const location = useLocation();
  const reason = (location.state as any)?.reason;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <svg
          className="mx-auto h-12 w-12 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          {reason === 'insufficient_role'
            ? 'You do not have the required role to access this page.'
            : reason === 'insufficient_permission'
            ? 'You do not have the required permission to access this page.'
            : 'You are not authorized to view this page.'}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Your roles: {(user as any)?.roles?.join(', ') || 'None'}
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go back home
          </a>
        </div>
      </div>
    </div>
  );
}

// Usage example in App.tsx:
// 
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { RoleBasedRoute, UnauthorizedPage } from './components/RoleBasedRoute';
// import { AdminPanel } from './pages/AdminPanel';
// import { UserSettings } from './pages/UserSettings';
// 
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Admin-only route */}
//         <Route
//           path="/admin"
//           element={
//             <RoleBasedRoute requiredRole="admin">
//               <AdminPanel />
//             </RoleBasedRoute>
//           }
//         />
//         
//         {/* Route requiring specific permission */}
//         <Route
//           path="/settings"
//           element={
//             <RoleBasedRoute requiredPermission="edit:settings">
//               <UserSettings />
//             </RoleBasedRoute>
//           }
//         />
//         
//         {/* Multiple roles (OR logic) */}
//         <Route
//           path="/dashboard"
//           element={
//             <RoleBasedRoute requiredRole={['admin', 'manager']}>
//               <Dashboard />
//             </RoleBasedRoute>
//           }
//         />
//         
//         <Route path="/unauthorized" element={<UnauthorizedPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
