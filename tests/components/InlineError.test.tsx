import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@ciscode/ui-translate-core', () => ({
  useT: () => (key: string) => key,
}));

import { InlineError } from '../../src/components/InlineError';

describe('InlineError', () => {
  it('shows and auto-dismisses after timeout', async () => {
    const { rerender } = render(<InlineError message={null} dismissAfterMs={10} />);
    expect(screen.queryByRole('alert')).toBeNull();

    rerender(<InlineError message={'Something went wrong'} dismissAfterMs={10} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('dismisses on button click', () => {
    render(<InlineError message={'Error occurred'} dismissAfterMs={0} />);
    const btn = screen.getByLabelText('inlineError.dismiss');
    fireEvent.click(btn);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
