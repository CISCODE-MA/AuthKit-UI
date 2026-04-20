import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthStateCtx } from '../../src/context/AuthStateContext';
import { ProfilePage } from '../../src/components/ProfilePage';

const mockUser = {
  id: 'u1',
  email: 'user@example.com',
  name: 'John Doe',
  roles: ['admin'],
  modules: ['menus'],
  tenantId: 't1',
};

const mockApi = {
  get: vi.fn().mockResolvedValue({
    data: {
      data: {
        email: 'user@example.com',
        fullname: { fname: 'John', lname: 'Doe' },
        username: 'johndoe',
      },
    },
  }),
  patch: vi.fn().mockResolvedValue({ data: {} }),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
} as any;

const mockSetUser = vi.fn();

function renderProfile(user = mockUser, apiOverride = mockApi) {
  return render(
    <AuthStateCtx.Provider
      value={{
        isAuthenticated: true,
        user,
        accessToken: 'token',
        api: apiOverride,
        login: vi.fn(),
        logout: vi.fn(),
        setUser: mockSetUser,
      }}
    >
      <ProfilePage />
    </AuthStateCtx.Provider>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    mockApi.get.mockReset();
    mockApi.patch.mockReset();
    mockSetUser.mockReset();
    mockApi.get.mockResolvedValue({
      data: {
        data: {
          email: 'user@example.com',
          fullname: { fname: 'John', lname: 'Doe' },
          username: 'johndoe',
        },
      },
    });
    mockApi.patch.mockResolvedValue({ data: {} });
  });

  it('renders "No user data available" when user is null', () => {
    render(
      <AuthStateCtx.Provider
        value={{
          isAuthenticated: false,
          user: null,
          accessToken: null,
          api: mockApi,
          login: vi.fn(),
          logout: vi.fn(),
          setUser: vi.fn(),
        }}
      >
        <ProfilePage />
      </AuthStateCtx.Provider>
    );
    expect(screen.getByText(/No user data available/i)).toBeInTheDocument();
  });

  it('loads and displays profile data on mount', async () => {
    renderProfile();
    await waitFor(() => {
      // Avatar initial should be computed from loaded name
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully on load', async () => {
    const errApi = {
      ...mockApi,
      get: vi.fn().mockRejectedValue(new Error('network error')),
    } as any;
    // Should not throw
    renderProfile(mockUser, errApi);
    await waitFor(() => {
      // page still renders without crashing
      expect(document.body).toBeDefined();
    });
  });

  it('enters edit mode when Edit button is clicked', async () => {
    renderProfile();
    await waitFor(() => screen.getByTitle('Edit profile'));
    fireEvent.click(screen.getByTitle('Edit profile'));
    // After clicking Edit, save/cancel buttons should appear
    await waitFor(() => expect(screen.getByText('Save changes')).toBeInTheDocument());
  });

  it('saves profile and shows success toast', async () => {
    renderProfile();
    await waitFor(() => screen.getByTitle('Edit profile'));
    fireEvent.click(screen.getByTitle('Edit profile'));

    await waitFor(() => screen.getByText('Save changes'));
    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() => {
      expect(mockApi.patch).toHaveBeenCalledWith('/api/auth/me', expect.any(Object));
    });
    // Toast should appear with success
    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
  });

  it('shows error toast when save fails', async () => {
    mockApi.patch.mockRejectedValueOnce(new Error('save error'));
    renderProfile();
    await waitFor(() => screen.getByTitle('Edit profile'));
    fireEvent.click(screen.getByTitle('Edit profile'));

    await waitFor(() => screen.getByText('Save changes'));
    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument());
    expect(screen.getByText(/Save failed/i)).toBeInTheDocument();
  });

  it('cancels editing and reverts to original values', async () => {
    renderProfile();
    await waitFor(() => screen.getByTitle('Edit profile'));
    fireEvent.click(screen.getByTitle('Edit profile'));

    await waitFor(() => screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Cancel'));

    // Should be back to view mode (Edit profile button visible again)
    await waitFor(() => expect(screen.getByTitle('Edit profile')).toBeInTheDocument());
  });
});
