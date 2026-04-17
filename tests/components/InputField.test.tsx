import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InputField } from '../../src/components/actions/InputField';

describe('InputField', () => {
  it('renders label, placeholder and calls onChange', async () => {
    const user = userEvent.setup();

    const spy = vi.fn();

    function Controlled() {
      const [val, setVal] = React.useState('');
      const handleChange = (v: string) => { spy(v); setVal(v); };
      return (
        <InputField
          label="Email"
          type="text"
          placeholder="Enter email"
          color=""
          value={val}
          onChange={handleChange}
        />
      );
    }

    render(<Controlled />);
    const input = screen.getByPlaceholderText('Enter email');
    await user.type(input, 'abc');
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.at(-1)?.[0]).toBe('abc');
  });
});
