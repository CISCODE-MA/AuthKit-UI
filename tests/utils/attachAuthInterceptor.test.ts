import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { describe, it, expect, vi } from 'vitest';
import { attachAuthInterceptor, resetSessionFlag } from '../../src/utils/attachAuthInterceptor';

function make401(config: InternalAxiosRequestConfig) {
  return new AxiosError(
    'Unauthorized',
    'ERR_BAD_REQUEST',
    config,
    null,
    { status: 401, data: null, headers: {}, config, statusText: 'Unauthorized' }
  );
}

describe('attachAuthInterceptor', () => {
  it('injects Authorization and retries after refresh success', async () => {
    const api = axios.create();
    let token: string | null = 'oldtok';

    // Adapter: first call 401, second call succeeds
    let firstCall = true;
    (api.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => {
      if (firstCall) { firstCall = false; throw make401(config); }
      return { status: 200, data: { ok: true }, headers: {}, config, statusText: 'OK' } as any;
    };

    const opts = {
      baseUrl: 'https://api.example.com',
      getAccessToken: () => token,
      setAccessToken: (t: string | null) => { token = t; },
      logout: vi.fn(),
    };

    // Mock global axios refresh
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'newtok' } } as any);

    attachAuthInterceptor(api, opts);

    const res = await api.get('/test');
    expect(res.status).toBe(200);
    expect(token).toBe('newtok');
    expect(postSpy).toHaveBeenCalled();
    expect(opts.logout).not.toHaveBeenCalled();
  });

  it('calls logout once when refresh fails; queues reject', async () => {
    const api = axios.create();
    let token: string | null = 'oldtok';
    resetSessionFlag();

    // Always 401
    (api.defaults as any).adapter = async (config: InternalAxiosRequestConfig) => { throw make401(config); };

    const opts = {
      baseUrl: 'https://api.example.com',
      getAccessToken: () => token,
      setAccessToken: (t: string | null) => { token = t; },
      logout: vi.fn(),
    };

    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh fail'));

    attachAuthInterceptor(api, opts);

    const p1 = api.get('/one');
    const p2 = api.get('/two');

    const results = await Promise.allSettled([p1, p2]);
    expect(results[0].status).toBe('rejected');
    expect(results[1].status).toBe('rejected');
    expect(opts.logout).toHaveBeenCalledTimes(1);
  });
});
