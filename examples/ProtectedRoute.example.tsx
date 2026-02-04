/**
 * Protected Route Example
 * 
 * Usage:
 * 1. Copy this file to your project
 * 2. Rename to ProtectedRoute.tsx
 * 3. Install dependencies:
 *    npm install @ciscode/ui-authentication-kit
 * 4. Wrap routes that require authentication
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { createUseAuth } from '@ciscode/ui-authentication-kit';

// Initialize the auth hook with your backend URL
const useAuth = createUseAuth({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  autoRefresh: true,
});

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Path to redirect to when not authenticated
   * @default '/login'
   */
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
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
  // Save current location to redirect back after login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}

/**
 * Usage in App:
 * 
 * ```tsx
 * import { BrowserRouter, Routes, Route } from 'react-router-dom';
 * import { ProtectedRoute } from './components/ProtectedRoute';
 * import { LoginPage } from './pages/LoginPage';
 * import { Dashboard } from './pages/Dashboard';
 * 
 * function App() {
 *   return (
 *     <BrowserRouter>
 *       <Routes>
 *         <Route path="/login" element={<LoginPage />} />
 *         <Route
 *           path="/dashboard"
 *           element={
 *             <ProtectedRoute>
 *               <Dashboard />
 *             </ProtectedRoute>
 *           }
 *         />
 *       </Routes>
 *     </BrowserRouter>
 *   );
 * }
 * ```
 */
