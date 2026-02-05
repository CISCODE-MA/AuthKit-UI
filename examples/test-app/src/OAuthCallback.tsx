/**
 * OAuth Callback Page
 * 
 * Handles the redirect from OAuth providers (Google, Facebook, Microsoft)
 * Extracts tokens from URL and stores them
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './App.css';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(error.replace(/_/g, ' '));
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens in localStorage (use same keys as useAuth hook)
      localStorage.setItem('auth_access_token', accessToken);
      localStorage.setItem('auth_refresh_token', refreshToken);
      
      console.log(`✅ ${provider} OAuth successful!`);
      
      // Redirect immediately to home (no delay, no success page)
      navigate('/');
      window.location.reload(); // Force reload to update auth state
    } else {
      setStatus('error');
      setErrorMessage('Missing tokens in callback');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="oauth-callback">
      {status === 'processing' && (
        <div className="callback-processing">
          <div className="spinner"></div>
          <h2>Processing OAuth authentication...</h2>
          <p>Please wait while we complete your sign-in.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="callback-success">
          <div className="success-icon">✓</div>
          <h2>Authentication Successful!</h2>
          <p>Redirecting you to the application...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="callback-error">
          <div className="error-icon">✗</div>
          <h2>Authentication Failed</h2>
          <p>{errorMessage}</p>
          <p className="redirect-info">Redirecting to login page...</p>
        </div>
      )}
    </div>
  );
}
