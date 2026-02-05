/**
 * Router Configuration for OAuth Testing
 * Complete setup with all OAuth callback routes
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CompleteLoginPage } from './CompleteLoginPage.example';
import {
  GoogleCallbackPage,
  MicrosoftCallbackPage,
  FacebookCallbackPage,
} from './OAuthCallbackPages.example';

// Mock Dashboard (replace with your actual dashboard)
function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>✅ Successfully authenticated!</p>
      {user && (
        <pre>{JSON.stringify(user, null, 2)}</pre>
      )}
      <button onClick={() => {
        localStorage.clear();
        window.location.href = '/login';
      }}>
        Logout
      </button>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Main App with OAuth Routes
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<CompleteLoginPage />} />
        
        {/* OAuth callback routes */}
        <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/oauth/microsoft/callback" element={<MicrosoftCallbackPage />} />
        <Route path="/oauth/facebook/callback" element={<FacebookCallbackPage />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
