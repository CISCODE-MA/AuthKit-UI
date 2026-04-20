import axios, {
    AxiosInstance,
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';
import { extractHttpErrorMessage } from './errorHelpers';

interface Options {
    baseUrl: string;                      // e.g. https://api.myapp.com
    refreshEndpoint?: string;             // default → "/auth/refresh"
    getAccessToken(): string | null;
    setAccessToken(token: string | null): void;
    logout(): void;                       // implemented in AuthProvider
}

let sessionExpiredFlag = false;         // guards multiple modals

export function resetSessionFlag() {
    sessionExpiredFlag = false;           // called after hard logout
}

export function attachAuthInterceptor(api: AxiosInstance, opts: Options) {
    api.defaults.withCredentials = true;
    const refreshUrl = `${opts.baseUrl}${opts.refreshEndpoint ?? '/auth/refresh-token'}`;

    /* ── request ─────────────────────────────────────────────── */
    api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
        const t = opts.getAccessToken();
        if (t) cfg.headers.Authorization = `Bearer ${t}`;
        return cfg;
    });

    /* ── response ────────────────────────────────────────────── */
    let refreshing = false;
    let queue: ((t: string | null) => void)[] = [];

    api.interceptors.response.use(
        res => res,
        async (err: AxiosError) => {
            const original = err.config as AxiosRequestConfig | undefined;
            if (err.response?.status !== 401 || !original || (original as AxiosRequestConfig & { _retry?: boolean })._retry) {
                return Promise.reject(err);
            }
            (original as AxiosRequestConfig & { _retry?: boolean })._retry = true;

            /* first request to notice the 401 */
            if (!refreshing) {
                refreshing = true;
                try {
                    const { data } = await axios.post(refreshUrl, {}, { withCredentials: true });
                    opts.setAccessToken(data.accessToken);
                    queue.forEach(cb => cb(data.accessToken));
                    queue = [];
                    return api.request(original);
                } catch (refreshErr) {
                    const hadToken = !!opts.getAccessToken();

                    if (hadToken && !sessionExpiredFlag) {
                        sessionExpiredFlag = true;
                        opts.logout();          // 🔔 open modal, keep token for now
                    }

                    // Surface detailed error message for UI to display on login page
                    try {
                        const msg = extractHttpErrorMessage(refreshErr);
                        if (msg) {
                            sessionStorage.setItem('authErrorMessage', msg);
                        }
                    } catch { /* ignore storage errors */ }

                    queue.forEach(cb => cb(null));
                    queue = [];
                    return Promise.reject(refreshErr);
                } finally {
                    refreshing = false;
                }
            }

            /* queue other 401s until refresh completes */
            return new Promise((resolve, reject) => {
                queue.push(token => {
                    if (!token) return reject(err);
                    (original.headers ??= {}).Authorization = `Bearer ${token}`;
                    resolve(api.request(original));
                });
            });
        }
    );

    return api;
}
