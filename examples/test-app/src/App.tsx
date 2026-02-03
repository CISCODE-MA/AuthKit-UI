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
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Debug: log auth state
  console.log('Auth state:', auth);

  // Check for loading or errors first
  if (auth.error) {
    return (
      <div className="error">
        <h3>❌ Error</h3>
        <p>{auth.error}</p>
      </div>
    );
  }

  // Form states
  const [loginEmail, setLoginEmail] = useState('admin@example.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFname, setRegFname] = useState('');
  const [regLname, setRegLname] = useState('');

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
      </div>

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
      ) : (
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
      )}

      <div className="validation-checklist">
        <h3>✅ Validation Checklist</h3>
        <ul>
          <li>Types match backend DTOs</li>
          <li>HTTP client works</li>
          <li>Auth service calls endpoints</li>
          <li>useAuth hook manages state</li>
          <li>Token storage & retrieval</li>
          <li>Auto-refresh enabled</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
