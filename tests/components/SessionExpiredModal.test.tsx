import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@ciscode/ui-translate-core', () => ({
  useT: () => (key: string) => key,
}));

import { SessionExpiredModal } from '../../src/components/SessionExpiredModal';

beforeEach(() => {
  // Reset body styles
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
});

describe('SessionExpiredModal', () => {
  it('renders portal and disables body interactions', () => {
    const onConfirm = vi.fn();
    const { unmount } = render(<SessionExpiredModal onConfirm={onConfirm} />);

    expect(screen.getByText('sessionExpired.title')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.pointerEvents).toBe('none');

    unmount();
    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.pointerEvents).toBe('');
  });

  it('calls onConfirm when button clicked', () => {
    const onConfirm = vi.fn();
    render(<SessionExpiredModal onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('sessionExpired.button'));
    expect(onConfirm).toHaveBeenCalled();
  });
});
