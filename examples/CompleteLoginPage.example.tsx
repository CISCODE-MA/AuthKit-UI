/**
 * Complete OAuth Login Page
 * Includes: Local login + Google + Microsoft + Facebook OAuth
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Divider,
  Stack,
} from '@mui/material';
import { createUseAuth } from '@ciscode/ui-authentication-kit';
import { useNavigate, useLocation } from 'react-router-dom';

// Initialize auth hook
const useAuth = createUseAuth({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 60,
});

export function CompleteLoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  // Local login
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(credentials);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  // OAuth handlers
  const handleOAuthLogin = (provider: 'google' | 'microsoft' | 'facebook') => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    
    // Save redirect location
    sessionStorage.setItem('postLoginRedirect', from);
    
    // Construct callback URL
    const callbackPath = `/oauth/${provider}/callback`;
    const callbackUrl = `${window.location.origin}${callbackPath}`;
    
    // Redirect to backend OAuth endpoint
    const oauthUrl = `${baseUrl}/api/auth/${provider}?redirect=${encodeURIComponent(callbackUrl)}`;
    window.location.href = oauthUrl;
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <Typography component="h1" variant="h4" fontWeight="bold">
          Sign in to Test App
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Test Auth Kit OAuth Integration
        </Typography>

        {/* OAuth Providers */}
        <Stack spacing={2} sx={{ width: '100%', mt: 4 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleOAuthLogin('google')}
            sx={{
              py: 1.5,
              borderColor: '#4285F4',
              color: '#4285F4',
              '&:hover': {
                borderColor: '#357ae8',
                backgroundColor: 'rgba(66, 133, 244, 0.04)',
              },
            }}
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleOAuthLogin('microsoft')}
            sx={{
              py: 1.5,
              borderColor: '#00A4EF',
              color: '#00A4EF',
              '&:hover': {
                borderColor: '#0078D4',
                backgroundColor: 'rgba(0, 164, 239, 0.04)',
              },
            }}
          >
            Continue with Microsoft
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleOAuthLogin('facebook')}
            sx={{
              py: 1.5,
              borderColor: '#1877F2',
              color: '#1877F2',
              '&:hover': {
                borderColor: '#166FE5',
                backgroundColor: 'rgba(24, 119, 242, 0.04)',
              },
            }}
          >
            Continue with Facebook
          </Button>
        </Stack>

        {/* Divider */}
        <Divider sx={{ width: '100%', my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            or use email
          </Typography>
        </Divider>

        {/* Local Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={credentials.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              setCredentials({ ...credentials, email: e.target.value })
            }
            disabled={isLoading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => 
              setCredentials({ ...credentials, password: e.target.value })
            }
            disabled={isLoading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Signing in...
              </>
            ) : (
              'Sign In with Email'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <MuiLink href="/register" variant="body2" underline="hover">
              Don't have an account? Sign up
            </MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
