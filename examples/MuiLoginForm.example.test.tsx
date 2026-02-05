import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { MuiLoginForm } from './MuiLoginForm.example';

// Mock useAuth hook
vi.mock('@ciscode/ui-authentication-kit', () => ({
  createUseAuth: () => () => ({
    login: vi.fn(async () => {}),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('MuiLoginForm', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders login form fields', () => {
    render(<MuiLoginForm />, { wrapper: MemoryRouter });
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls login and navigates on submit', async () => {
    render(<MuiLoginForm />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error alert if error is present', () => {
    // Re-mock useAuth to return error
    vi.doMock('@ciscode/ui-authentication-kit', () => ({
      createUseAuth: () => () => ({
        login: vi.fn(),
        isLoading: false,
        error: 'Invalid credentials',
        clearError: vi.fn(),
      }),
    }));
    // Re-import component after remock
    const { MuiLoginForm: MuiLoginFormWithError } = require('./MuiLoginForm.example');
    render(<MuiLoginFormWithError />, { wrapper: MemoryRouter });
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
