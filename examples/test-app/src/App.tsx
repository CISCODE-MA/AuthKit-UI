import { useState } from 'react';
import { createUseAuth } from '../../../src/hooks/useAuth';
import type { LoginCredentials, RegisterData } from '../../../src/models/auth.types';
import './App.css';

// Create useAuth hook with backend URL
const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 60,
});

function App() {
  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🔐 Auth Kit UI</h1>
          <p>Integration Test - Step 1 Validation</p>
        </header>
        
        <AuthTest />
      </div>
    </div>
  );
}

function AuthTest() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'reset' | 'verify'>('login');

  // Form states - MUST be declared before any conditional returns
  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFname, setRegFname] = useState('');
  const [regLname, setRegLname] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [resendEmail, setResendEmail] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  // Debug: log auth state
  console.log('Auth state:', auth);

  // Show loading while initializing
  if (auth.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Check for errors
  if (auth.error) {
    return (
      <div className="error">
        <h3>❌ Error</h3>
        <p>{auth.error}</p>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login({ email: loginEmail, password: loginPassword });
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.register({
        email: regEmail,
        password: regPassword,
        fullname: { fname: regFname, lname: regLname },
      });
      alert('Registration successful! Please check your email to verify.');
      setActiveTab('login');
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const handleLogout = async () => {
    await auth.logout();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.forgotPassword(forgotEmail);
      setSuccessMessage('✅ Password reset email sent! Check your inbox.');
      setForgotEmail('');
    } catch (error: any) {
      console.error('Forgot password error:', error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.resetPassword(resetToken, resetNewPassword);
      setSuccessMessage('✅ Password reset successful! You can now login.');
      setResetToken('');
      setResetNewPassword('');
      setActiveTab('login');
    } catch (error: any) {
      console.error('Reset password error:', error);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.verifyEmail(verifyToken);
      setSuccessMessage('✅ Email verified successfully!');
      setVerifyToken('');
    } catch (error: any) {
      console.error('Verify email error:', error);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.resendVerification(resendEmail);
      setSuccessMessage('✅ Verification email sent! Check your inbox.');
      setResendEmail('');
    } catch (error: any) {
      console.error('Resend verification error:', error);
    }
  };

  if (auth.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (auth.isAuthenticated && auth.user) {
    return (
      <div className="authenticated">
        <div className="success-badge">✓ Authenticated</div>
        
        <div className="user-card">
          <div className="user-avatar">
            {auth.user.email ? auth.user.email[0].toUpperCase() : '?'}
          </div>
          <div className="user-info">
            <h3>{auth.user.name || 'User'}</h3>
            <p className="user-email">{auth.user.email || 'No email'}</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <label>User ID</label>
            <code>{auth.user.id}</code>
          </div>
          
          <div className="info-card">
            <label>Roles</label>
            <div className="tags">
              {auth.user.roles.map(role => (
                <span key={role} className="tag">{role}</span>
              ))}
            </div>
          </div>
          
          <div className="info-card">
            <label>Permissions</label>
            <div className="tags">
              {auth.user.permissions?.slice(0, 3).map(perm => (
                <span key={perm} className="tag tag-secondary">{perm}</span>
              ))}
              {auth.user.permissions && auth.user.permissions.length > 3 && (
                <span className="tag tag-secondary">+{auth.user.permissions.length - 3} more</span>
              )}
            </div>
          </div>
          
          <div className="info-card">
            <label>Tenant ID</label>
            <code>{auth.user.tenantId || 'N/A'}</code>
          </div>
        </div>

        <div className="token-section">
          <details>
            <summary>Access Token (click to expand)</summary>
            <pre className="token">{auth.accessToken}</pre>
          </details>
          
          <details>
            <summary>Refresh Token (click to expand)</summary>
            <pre className="token">{auth.refreshToken}</pre>
          </details>
        </div>

        {/* RBAC Testing Section */}
        <div className="rbac-section" style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #0ea5e9' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', color: '#0369a1' }}>🔐 RBAC Testing</h3>
          
          {/* Role Checks */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0c4a6e', fontWeight: '600' }}>
              Role Checks (hasRole)
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {auth.user.roles.map(role => (
                <div key={role} style={{ padding: '0.75rem', background: 'white', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cffafe' }}>
                  <span><code style={{ background: '#f0f4f8', padding: '0.2rem 0.4rem', borderRadius: '2px' }}>hasRole('{role}')</code></span>
                  <span style={{ fontSize: '1rem' }}>
                    {auth.hasRole(role) ? '✅ true' : '❌ false'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Permission Checks */}
          <div>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0c4a6e', fontWeight: '600' }}>
              Permission Checks (hasPermission)
            </h4>
            {auth.user.permissions && auth.user.permissions.length > 0 ? (
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {auth.user.permissions.map(perm => (
                  <div key={perm} style={{ padding: '0.75rem', background: 'white', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cffafe' }}>
                    <span><code style={{ background: '#f0f4f8', padding: '0.2rem 0.4rem', borderRadius: '2px' }}>hasPermission('{perm}')</code></span>
                    <span style={{ fontSize: '1rem' }}>
                      {auth.hasPermission(perm) ? '✅ true' : '❌ false'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '0.75rem', background: 'white', borderRadius: '4px', color: '#64748b' }}>
                No permissions assigned
              </div>
            )}
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="auth-forms">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
        <button
          className={`tab ${activeTab === 'forgot' ? 'active' : ''}`}
          onClick={() => setActiveTab('forgot')}
        >
          Forgot Password
        </button>
        <button
          className={`tab ${activeTab === 'reset' ? 'active' : ''}`}
          onClick={() => setActiveTab('reset')}
        >
          Reset Password
        </button>
        <button
          className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          Verify Email
        </button>
      </div>

      {successMessage && (
        <div className="success-banner">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="success-close">×</button>
        </div>
      )}

      {auth.error && (
        <div className="error-banner">
          <span>❌ {auth.error}</span>
          <button onClick={auth.clearError} className="error-close">×</button>
        </div>
      )}

      {activeTab === 'login' ? (
        <form onSubmit={handleLogin} className="form">
          <h2>Login to Test</h2>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={auth.isLoading}>
            {auth.isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="hint">
            💡 Default credentials: admin@example.com / admin123
          </div>

          <div className="oauth-divider">
            <span>OR</span>
          </div>

          <div className="oauth-buttons">
            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}
              className="btn btn-oauth btn-google"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:3000/api/auth/facebook'}
              className="btn btn-oauth btn-facebook"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:3000/api/auth/microsoft'}
              className="btn btn-oauth btn-microsoft"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
                <path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z"/>
                <path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z"/>
                <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>
        </form>
      ) : activeTab === 'register' ? (
        <form onSubmit={handleRegister} className="form">
          <h2>Register New User</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={regFname}
                onChange={(e) => setRegFname(e.target.value)}
                placeholder="John"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={regLname}
                onChange={(e) => setRegLname(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={auth.isLoading}>
            {auth.isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      ) : activeTab === 'forgot' ? (
        <>
          <form onSubmit={handleForgotPassword} className="form">
            <h2>Forgot Password</h2>
            <p className="form-description">
              Enter your email to receive a password reset link
            </p>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={auth.isLoading}>
              {auth.isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          
          {/* Separate form for resend verification */}
          <form onSubmit={handleResendVerification} className="form" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Resend Verification Email</h3>
            <div className="form-group">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={auth.isLoading}>
              Resend Verification
            </button>
          </form>
        </>
      ) : activeTab === 'reset' ? (
        <form onSubmit={handleResetPassword} className="form">
          <h2>Reset Password</h2>
          <p className="form-description">
            Enter the token from your email and your new password
          </p>
          
          <div className="form-group">
            <label>Reset Token</label>
            <input
              type="text"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="Token from email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={resetNewPassword}
              onChange={(e) => setResetNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={auth.isLoading}>
            {auth.isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyEmail} className="form">
          <h2>Verify Email</h2>
          <p className="form-description">
            Enter the verification token from your email
          </p>
          
          <div className="form-group">
            <label>Verification Token</label>
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Token from email"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={auth.isLoading}>
            {auth.isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      )}

      <div className="validation-checklist">
        <h3>📋 Manual Validation Checklist</h3>
        <details open>
          <summary><strong>🔐 JWT Authentication (Local)</strong></summary>
          <ul>
            <li>⏳ <strong>Register</strong>: Create new user → Check email for verification link</li>
            <li>⏳ <strong>Verify Email</strong>: Use token from email → Should succeed</li>
            <li>⏳ <strong>Login</strong>: Use email/password → Should return tokens</li>
            <li>⏳ <strong>Get Profile</strong>: Logged in state → Should show user info</li>
            <li>⏳ <strong>Logout</strong>: Click logout → Should clear tokens</li>
            <li>⏳ <strong>Forgot Password</strong>: Enter email → Check email for reset link</li>
            <li>⏳ <strong>Reset Password</strong>: Use token + new password → Should succeed</li>
            <li>⏳ <strong>Login New Password</strong>: Use new password → Should work</li>
          </ul>
        </details>

        <details open>
          <summary><strong>🌐 OAuth Providers</strong></summary>
          <ul>
            <li>⏳ <strong>Google Login</strong>: Click button → Redirect to Google → Authorize → Redirect back → Logged in</li>
            <li>⏳ <strong>Facebook Login</strong>: Click button → Redirect to Facebook → Authorize → Redirect back → Logged in</li>
            <li>⏳ <strong>Microsoft Login</strong>: Click button → Redirect to Microsoft → Authorize → Redirect back → Logged in</li>
          </ul>
        </details>

        <details>
          <summary><strong>🔄 Token Refresh</strong></summary>
          <ul>
            <li>⏳ <strong>Auto Refresh</strong>: Wait 14 minutes → Token should refresh automatically</li>
            <li>⏳ <strong>Manual Refresh</strong>: Use refresh token → Get new access token</li>
          </ul>
        </details>

        <details>
          <summary><strong>🚨 Error Handling</strong></summary>
          <ul>
            <li>⏳ <strong>Invalid Login</strong>: Wrong password → Should show error message</li>
            <li>⏳ <strong>Invalid Token</strong>: Expired/wrong token → Should show error</li>
            <li>⏳ <strong>Network Error</strong>: Backend offline → Should show connection error</li>
          </ul>
        </details>

        <details>
          <summary><strong>🛡️ RBAC (Role-Based Access Control)</strong></summary>
          <ul>
            <li>⏳ <strong>Admin Role</strong>: Login as admin → Should have all permissions</li>
            <li>⏳ <strong>User Role</strong>: Login as user → Should have limited permissions</li>
          </ul>
        </details>

        <div className="test-notes">
          <h4>📝 Test Notes:</h4>
          <ul>
            <li>✅ Backend running on <code>http://localhost:3000</code></li>
            <li>✅ Frontend running on <code>http://localhost:5173</code></li>
            <li>✅ OAuth credentials configured (Google, Facebook)</li>
            <li>⏳ Microsoft OAuth - Add credentials when ready</li>
            <li>💡 Check browser console for detailed errors</li>
            <li>💡 Check backend terminal for API logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
