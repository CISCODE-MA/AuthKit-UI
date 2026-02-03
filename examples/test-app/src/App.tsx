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

  // Check for loading or errors AFTER all hooks
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
        <h3>✅ Validation Checklist</h3>
        <ul>
          <li>✅ Login - Working</li>
          <li>✅ Logout - Working</li>
          <li>⏳ Register - Test now</li>
          <li>⏳ Forgot Password - Test now</li>
          <li>⏳ Reset Password - Test now</li>
          <li>⏳ Verify Email - Test now</li>
          <li>⏳ Resend Verification - Test now</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
