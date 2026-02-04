/**
 * Plain CSS Login Form Example
 * 
 * Usage:
 * 1. Copy this file to your project
 * 2. Rename to LoginForm.tsx
 * 3. Install @ciscode/ui-authentication-kit:
 *    npm install @ciscode/ui-authentication-kit
 * 4. Create LoginForm.css with the styles below
 * 5. No other dependencies needed!
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { createUseAuth } from '@ciscode/ui-authentication-kit';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Create this CSS file

// Initialize the auth hook with your backend URL
const useAuth = createUseAuth({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  autoRefresh: true,
});

export function PlainLoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Sign in to your account</h1>
          <p>
            Or <a href="/register">create a new account</a>
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="error-alert">
              <span>{error}</span>
              <button
                type="button"
                className="error-close"
                onClick={clearError}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={credentials.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCredentials({ ...credentials, email: e.target.value })}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-link">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * LoginForm.css
 * 
 * Create this file in the same directory:
 * 
 * ```css
 * .login-container {
 *   min-height: 100vh;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   background-color: #f5f5f5;
 *   padding: 1rem;
 * }
 * 
 * .login-card {
 *   background: white;
 *   border-radius: 8px;
 *   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
 *   padding: 2rem;
 *   max-width: 400px;
 *   width: 100%;
 * }
 * 
 * .login-header {
 *   text-align: center;
 *   margin-bottom: 2rem;
 * }
 * 
 * .login-header h1 {
 *   font-size: 1.5rem;
 *   font-weight: 700;
 *   color: #111;
 *   margin: 0 0 0.5rem 0;
 * }
 * 
 * .login-header p {
 *   color: #666;
 *   margin: 0;
 * }
 * 
 * .login-header a {
 *   color: #4f46e5;
 *   text-decoration: none;
 * }
 * 
 * .login-header a:hover {
 *   text-decoration: underline;
 * }
 * 
 * .login-form {
 *   display: flex;
 *   flex-direction: column;
 *   gap: 1rem;
 * }
 * 
 * .form-group {
 *   display: flex;
 *   flex-direction: column;
 * }
 * 
 * .form-group label {
 *   font-size: 0.875rem;
 *   font-weight: 500;
 *   color: #374151;
 *   margin-bottom: 0.5rem;
 * }
 * 
 * .form-group input {
 *   padding: 0.5rem 0.75rem;
 *   border: 1px solid #d1d5db;
 *   border-radius: 4px;
 *   font-size: 1rem;
 * }
 * 
 * .form-group input:focus {
 *   outline: none;
 *   border-color: #4f46e5;
 *   box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
 * }
 * 
 * .form-group input:disabled {
 *   background-color: #f9fafb;
 *   cursor: not-allowed;
 * }
 * 
 * .error-alert {
 *   background-color: #fef2f2;
 *   border: 1px solid #fecaca;
 *   border-radius: 4px;
 *   padding: 0.75rem 1rem;
 *   display: flex;
 *   justify-content: space-between;
 *   align-items: center;
 *   color: #dc2626;
 * }
 * 
 * .error-close {
 *   background: none;
 *   border: none;
 *   font-size: 1.5rem;
 *   cursor: pointer;
 *   color: #dc2626;
 *   padding: 0;
 *   line-height: 1;
 * }
 * 
 * .form-options {
 *   display: flex;
 *   justify-content: space-between;
 *   align-items: center;
 * }
 * 
 * .checkbox-label {
 *   display: flex;
 *   align-items: center;
 *   gap: 0.5rem;
 *   font-size: 0.875rem;
 *   cursor: pointer;
 * }
 * 
 * .forgot-link {
 *   font-size: 0.875rem;
 *   color: #4f46e5;
 *   text-decoration: none;
 * }
 * 
 * .forgot-link:hover {
 *   text-decoration: underline;
 * }
 * 
 * .submit-button {
 *   background-color: #4f46e5;
 *   color: white;
 *   border: none;
 *   border-radius: 4px;
 *   padding: 0.75rem;
 *   font-size: 1rem;
 *   font-weight: 500;
 *   cursor: pointer;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   gap: 0.5rem;
 * }
 * 
 * .submit-button:hover {
 *   background-color: #4338ca;
 * }
 * 
 * .submit-button:disabled {
 *   background-color: #9ca3af;
 *   cursor: not-allowed;
 * }
 * 
 * .spinner {
 *   width: 16px;
 *   height: 16px;
 *   border: 2px solid rgba(255, 255, 255, 0.3);
 *   border-top-color: white;
 *   border-radius: 50%;
 *   animation: spin 0.6s linear infinite;
 * }
 * 
 * @keyframes spin {
 *   to { transform: rotate(360deg); }
 * }
 * ```
 */
