/**
 * OAuth Callback Pages
 * Handle OAuth redirects from Google, Microsoft, Facebook
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button, Container } from '@mui/material';

/**
 * Generic OAuth Callback Component
 */
function OAuthCallback({ provider }: { provider: string }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get tokens from URL params
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const errorMsg = searchParams.get('error');

        if (errorMsg) {
          setError(decodeURIComponent(errorMsg));
          setIsProcessing(false);
          return;
        }

        if (!accessToken || !refreshToken) {
          setError('Missing authentication tokens from callback');
          setIsProcessing(false);
          return;
        }

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        console.log(`✅ ${provider} OAuth successful`);

        // Get redirect location (saved before OAuth)
        const postLoginRedirect = sessionStorage.getItem('postLoginRedirect') || '/dashboard';
        sessionStorage.removeItem('postLoginRedirect');

        // Redirect to destination
        setTimeout(() => {
          navigate(postLoginRedirect, { replace: true });
        }, 1000);
      } catch (err) {
        console.error(`${provider} OAuth callback error:`, err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, provider]);

  if (error) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {provider} Authentication Failed
            </Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          Processing {provider} login...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we authenticate your account
        </Typography>
      </Box>
    </Container>
  );
}

/**
 * Google OAuth Callback
 */
export function GoogleCallbackPage() {
  return <OAuthCallback provider="Google" />;
}

/**
 * Microsoft OAuth Callback
 */
export function MicrosoftCallbackPage() {
  return <OAuthCallback provider="Microsoft" />;
}

/**
 * Facebook OAuth Callback
 */
export function FacebookCallbackPage() {
  return <OAuthCallback provider="Facebook" />;
}
