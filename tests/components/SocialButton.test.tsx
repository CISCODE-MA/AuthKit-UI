import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialButton } from '../../src/components/actions/SocialButton';

describe('SocialButton', () => {
  it('renders an image with the given icon src', () => {
    render(<SocialButton icon="https://example.com/icon.svg" label="Google" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/icon.svg');
    expect(img).toHaveAttribute('alt', 'Google');
  });

  it('renders the label text when provided', () => {
    render(<SocialButton icon="icon.svg" label="Sign in with Google" />);
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('hides the label when no label is provided', () => {
    render(<SocialButton icon="icon.svg" />);
    // img with empty alt is decorative (no role); find via querySelector
    const img = document.querySelector('img')!;
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('src', 'icon.svg');
  });
});
