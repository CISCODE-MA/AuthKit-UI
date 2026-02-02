import React, { useEffect, useMemo, useState } from 'react';
import { useAuthState } from '../context/AuthStateContext';

type ToastType = 'success' | 'error';

export const ProfilePage: React.FC = () => {
  const { user, api, setUser } = useAuthState();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    type: ToastType;
    title: string;
    message?: string;
  }>({
    open: false,
    type: 'success',
    title: '',
    message: '',
  });

  const phone = '+971 50 827 8229';

  // Auto-hide toast after 3s
  useEffect(() => {
    if (!toast.open) return;
    const id = window.setTimeout(() => setToast((t) => ({ ...t, open: false })), 3000);
    return () => window.clearTimeout(id);
  }, [toast.open]);

  // Load profile
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const { data } = await api.get('/api/auth/me');
        if (cancelled) return;

        setUser(data);
        setName(data?.name ?? '');
        setEmail(data?.email ?? '');
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [api, setUser]);

  const displayName = useMemo(() => {
    return (name || user?.name || user?.email || '').trim();
  }, [name, user?.name, user?.email]);

  const avatarInitial = useMemo(() => {
    return displayName.charAt(0).toUpperCase() || '?';
  }, [displayName]);

  async function handleSave() {
    if (!user) return;

    setSaving(true);

    try {
      await api.patch('/api/auth/me', { name });
      setUser({ ...user, name });
      setIsEditing(false);

      setToast({
        open: true,
        type: 'success',
        title: 'Changes saved',
        message: 'Your profile was updated successfully.',
      });
    } catch (err) {
      console.error('Failed to update profile:', err);

      setToast({
        open: true,
        type: 'error',
        title: 'Save failed',
        message: 'Failed to save changes. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <p className="text-sm text-gray-500">No user data available.</p>;
  }

  const isSuccess = toast.type === 'success';

  return (
    <div className="max-w-3xl mx-auto">
      {/* TOAST POPUP (success + error) */}
      {toast.open && (
        <div
          className="fixed top-6 right-6 z-[999999] flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg"
          role="status"
          aria-live="polite"
          style={{
            borderColor: isSuccess ? '#BBF7D0' : '#FECACA',
          }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: isSuccess ? '#ECFDF5' : '#FEF2F2',
            }}
          >
            {isSuccess ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-green-600"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-red-600"
              >
                <path
                  d="M12 9V13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 17H12.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <div className="flex flex-col">
            <span
              className="text-sm font-semibold"
              style={{ color: isSuccess ? '#15803D' : '#B91C1C' }}
            >
              {toast.title}
            </span>
            {toast.message && (
              <span className="text-xs text-gray-500">{toast.message}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setToast((t) => ({ ...t, open: false }))}
            className="ml-2 rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
            title="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {avatarInitial}
                </div>

                {/* Avatar pen (future) */}
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                  title="Change avatar"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 20H21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-semibold">My Profile</h1>
                <p className="text-sm text-gray-500">Personal details</p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                title="Edit profile"
                className="h-9 w-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 20H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 border-t border-gray-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Username
              </label>
              <input
                type="text"
                value={name}
                disabled={!isEditing || saving}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${isEditing
                    ? 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Email ID
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Mobile number
              </label>
              <input
                type="text"
                value={phone}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {isEditing && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setIsEditing(false);
                setName(user?.name ?? '');
              }}
              className="mt-6 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};