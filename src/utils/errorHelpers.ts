import type { AxiosError } from 'axios';

type ErrorResponse = {
  ok?: boolean;
  code?: string;
  message?: string;
  requestId?: string;
  path?: string;
  details?: {
    message?: string;
    error?: string;
    statusCode?: number;
  };
};

function isAxiosError(err: unknown): err is AxiosError {
  return !!(err as any)?.isAxiosError;
}

/**
 * Extract a user-facing error message from common backend/HTTP shapes.
 * Preference order:
 * 1) response.data.details.message
 * 2) response.data.message
 * 3) response.data.details.error
 * 4) err.message
 * 5) generic fallback
 */
export function extractHttpErrorMessage(err: unknown): string {
  try {
    if (typeof err === 'string') return err;

    if (isAxiosError(err)) {
      const data = err.response?.data as ErrorResponse | undefined;
      const fromResponse =
        data?.details?.message?.toString()?.trim() ||
        data?.message?.toString()?.trim() ||
        data?.details?.error?.toString()?.trim();
      if (fromResponse) return fromResponse;
      if (err.message) return err.message;
    }

    if (err instanceof Error && err.message) return err.message;
  } catch {/* ignore parsing issues */}

  return 'An unexpected error occurred';
}
