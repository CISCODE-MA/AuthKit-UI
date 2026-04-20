import { describe, it, expect } from 'vitest';
import { extractHttpErrorMessage } from '../../src/utils/errorHelpers';

function makeAxiosError(overrides: Record<string, unknown> = {}) {
  return {
    isAxiosError: true,
    message: 'Request failed',
    response: {
      data: {},
    },
    ...overrides,
  };
}

describe('extractHttpErrorMessage', () => {
  it('returns the string directly when err is a string', () => {
    expect(extractHttpErrorMessage('plain error')).toBe('plain error');
  });

  it('returns details.message when present in axios response', () => {
    const err = makeAxiosError({ response: { data: { details: { message: 'Detail msg' } } } });
    expect(extractHttpErrorMessage(err)).toBe('Detail msg');
  });

  it('returns data.message when details.message is absent', () => {
    const err = makeAxiosError({ response: { data: { message: 'Top-level msg' } } });
    expect(extractHttpErrorMessage(err)).toBe('Top-level msg');
  });

  it('returns data.details.error as fallback in axios response', () => {
    const err = makeAxiosError({ response: { data: { details: { error: 'Detail error' } } } });
    expect(extractHttpErrorMessage(err)).toBe('Detail error');
  });

  it('returns err.message when axios response has no useful data', () => {
    const err = makeAxiosError({ response: { data: {} } });
    expect(extractHttpErrorMessage(err)).toBe('Request failed');
  });

  it('returns native Error.message for a non-axios Error', () => {
    expect(extractHttpErrorMessage(new Error('native error'))).toBe('native error');
  });

  it('returns generic fallback for unknown objects', () => {
    expect(extractHttpErrorMessage({ something: 'unknown' })).toBe('An unexpected error occurred');
  });

  it('returns generic fallback for null', () => {
    expect(extractHttpErrorMessage(null)).toBe('An unexpected error occurred');
  });

  it('trims whitespace from response fields', () => {
    const err = makeAxiosError({ response: { data: { message: '  trimmed  ' } } });
    expect(extractHttpErrorMessage(err)).toBe('trimmed');
  });
});
