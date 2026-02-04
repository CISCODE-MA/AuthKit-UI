/**
 * Material-UI Login Form Example
 * 
 * Usage:
 * 1. Copy this file to your project
 * 2. Rename to LoginForm.tsx
 * 3. Install dependencies:
 *    npm install @mui/material @emotion/react @emotion/styled
 *    npm install @ciscode/ui-authentication-kit
 * 4. Customize theme and styles as needed
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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { createUseAuth } from '@ciscode/ui-authentication-kit';
import { useNavigate } from 'react-router-dom';

// Initialize the auth hook with your backend URL
const useAuth = createUseAuth({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  autoRefresh: true,
});

export function MuiLoginForm() {
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
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Or{' '}
          <MuiLink href="/register" underline="hover">
            create a new account
          </MuiLink>
        </Typography>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Email Field */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={credentials.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCredentials({ ...credentials, email: e.target.value })}
            disabled={isLoading}
          />

          {/* Password Field */}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCredentials({ ...credentials, password: e.target.value })}
            disabled={isLoading}
          />

          {/* Remember Me & Forgot Password */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />
            <MuiLink href="/forgot-password" variant="body2" underline="hover">
              Forgot password?
            </MuiLink>
          </Box>

          {/* Submit Button */}
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
              'Sign In'
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
