import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthConfigContext } from '../../../src/context/AuthConfigContext';
import { AuthStateCtx } from '../../../src/context/AuthStateContext';

vi.mock('@ciscode/ui-translate-core', () => ({
  useT: () => (key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key,
}));

// SVG imports used in the page
vi.mock('../../../src/assets/icons/google-icon-svgrepo-com.svg', () => ({ default: 'google.svg' }));
vi.mock('../../../src/assets/icons/microsoft-svgrepo-com.svg', () => ({
  default: 'microsoft.svg',
}));

import { ForgotPasswordPage } from '../../../src/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../../../src/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../../../src/pages/auth/VerifyEmailPage';
import { GoogleCallbackPage } from '../../../src/pages/auth/GoogleCallbackPage';
import { SignInPage } from '../../../src/pages/auth/SignInPage';
import { SignUpPage } from '../../../src/pages/auth/SignUpPage';

const baseConfig = {
  baseUrl: 'https://api.example.com',
  colors: { bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-500' },
};

const mockApi = {
  post: vi.fn().mockResolvedValue({ data: {} }),
  get: vi.fn().mockResolvedValue({ data: {} }),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
} as any;

const mockAuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  api: mockApi,
  login: vi.fn(),
  logout: vi.fn(),
  setUser: vi.fn(),
};

function wrap(
  ui: React.ReactElement,
  { initialPath = '/', config = baseConfig, authState = mockAuthState } = {},
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthConfigContext.Provider value={config as any}>
        <AuthStateCtx.Provider value={authState}>
          <Routes>
            <Route path="*" element={ui} />
          </Routes>
        </AuthStateCtx.Provider>
      </AuthConfigContext.Provider>
    </MemoryRouter>,
  );
}

// ─── ForgotPasswordPage ────────────────────────────────────────────────────

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    mockApi.post.mockReset();
  });

  it('renders the page title and email input', () => {
    wrap(<ForgotPasswordPage />);
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('form.emailPlaceholder')).toBeInTheDocument();
  });

  it('shows success message after submitting a valid email', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} });
    wrap(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('form.emailPlaceholder'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => expect(screen.getByText(/If the email exists/i)).toBeInTheDocument());
  });

  it('shows inline error when API call fails', async () => {
    mockApi.post.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Not found',
      response: { data: { message: 'Email not found' } },
    });
    wrap(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('form.emailPlaceholder'), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.click(screen.getByText('Send Reset Link'));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('renders brand name when no logoUrl is provided', () => {
    wrap(<ForgotPasswordPage />, { config: { ...baseConfig, brandName: 'TestBrand' } as any });
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
  });

  it('renders logo image when logoUrl is provided', () => {
    wrap(<ForgotPasswordPage />, {
      config: { ...baseConfig, logoUrl: 'https://logo.example.com/img.png' } as any,
    });
    const img = screen.getByAltText('Brand Logo');
    expect(img).toHaveAttribute('src', 'https://logo.example.com/img.png');
  });
});

// ─── ResetPasswordPage ─────────────────────────────────────────────────────

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    mockApi.post.mockReset();
  });

  it('renders the page title', () => {
    wrap(<ResetPasswordPage />, { initialPath: '/?token=abc123' });
    expect(screen.getByRole('heading', { name: /Reset your password/i })).toBeInTheDocument();
  });

  it('shows mismatch error when passwords differ', async () => {
    wrap(<ResetPasswordPage />, { initialPath: '/?token=abc123' });

    fireEvent.change(screen.getByPlaceholderText('form.passwordPlaceholder'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'differentpwd' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('renders brand name fallback when no logoUrl', () => {
    wrap(<ResetPasswordPage />, {
      initialPath: '/?token=abc',
      config: { ...baseConfig, brandName: 'BrandX' } as any,
    });
    expect(screen.getByText('BrandX')).toBeInTheDocument();
  });
});

// ─── VerifyEmailPage ───────────────────────────────────────────────────────

describe('VerifyEmailPage', () => {
  it('renders page content', () => {
    wrap(<VerifyEmailPage />, { initialPath: '/?email=user@example.com' });
    // Page renders without crashing
    expect(document.body).toBeDefined();
  });

  it('renders brand name when no logoUrl', () => {
    wrap(<VerifyEmailPage />, {
      initialPath: '/',
      config: { ...baseConfig, brandName: 'VerifyBrand' } as any,
    });
    // Brand name appears in at least one location
    expect(screen.getAllByText('VerifyBrand').length).toBeGreaterThan(0);
  });

  it('renders logo when logoUrl is provided', () => {
    wrap(<VerifyEmailPage />, {
      initialPath: '/?email=test@example.com',
      config: { ...baseConfig, logoUrl: 'https://verify.example.com/logo.png' } as any,
    });
    const imgs = screen.getAllByAltText('Brand Logo');
    expect(imgs.length).toBeGreaterThan(0);
  });
});

// ─── GoogleCallbackPage ────────────────────────────────────────────────────

describe('GoogleCallbackPage', () => {
  it('renders loading text', () => {
    // Prevent real window.location.replace
    Object.defineProperty(window, 'location', {
      value: { ...window.location, replace: vi.fn(), search: '?accessToken=tok&refreshToken=ref' },
      writable: true,
    });
    render(
      <MemoryRouter initialEntries={['/?accessToken=tok&refreshToken=ref']}>
        <Routes>
          <Route path="*" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Finishing Google sign-in/i)).toBeInTheDocument();
  });
});

// ─── SignInPage ────────────────────────────────────────────────────────────

describe('SignInPage', () => {
  beforeEach(() => {
    mockAuthState.login.mockReset();
  });

  it('renders sign in form', () => {
    wrap(<SignInPage {...(baseConfig as any)} />);
    expect(screen.getAllByText('SignInPage.signIn').length).toBeGreaterThan(0);
  });

  it('calls login on form submit', async () => {
    mockAuthState.login.mockResolvedValueOnce(undefined);
    wrap(<SignInPage {...(baseConfig as any)} />);

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('form.passwordPlaceholder'), {
      target: { value: 'password123' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() =>
      expect(mockAuthState.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      }),
    );
  });

  it('shows error when login fails', async () => {
    mockAuthState.login.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Unauthorized',
      response: { data: { message: 'Invalid credentials' } },
    });
    wrap(<SignInPage {...(baseConfig as any)} />);

    fireEvent.change(screen.getByPlaceholderText('name@company.com'), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('form.passwordPlaceholder'), {
      target: { value: 'wrongpwd' },
    });
    fireEvent.submit(document.querySelector('form')!);

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('renders oauth provider buttons when configured', () => {
    wrap(<SignInPage {...(baseConfig as any)} />, {
      config: { ...baseConfig, oauthProviders: ['google', 'microsoft'] } as any,
    });
    const imgs = screen.getAllByRole('img');
    // Both google and microsoft icon imgs should be present
    expect(imgs.length).toBeGreaterThan(1);
  });
});

// ─── SignUpPage ────────────────────────────────────────────────────────────

describe('SignUpPage', () => {
  beforeEach(() => {
    mockApi.post.mockReset();
  });

  it('renders the signup form', () => {
    wrap(<SignUpPage />);
    // The page renders without crashing - look for a typical field
    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders brand name when no logoUrl', () => {
    wrap(<SignUpPage />, {
      config: { ...baseConfig, brandName: 'SignUpBrand' } as any,
    });
    expect(screen.getAllByText('SignUpBrand').length).toBeGreaterThan(0);
  });

  it('renders custom sign up fields when provided', () => {
    wrap(<SignUpPage />, {
      config: {
        ...baseConfig,
        signUpCustomFields: [
          { name: 'company', label: 'Company', type: 'text', placeholder: 'Your company' },
        ],
      } as any,
    });
    expect(screen.getByPlaceholderText('Your company')).toBeInTheDocument();
  });
});
