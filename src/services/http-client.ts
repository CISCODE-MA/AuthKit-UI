/**
 * HTTP Client Utility
 * Handles API requests with auth token injection and error handling
 */

import type { ApiError } from '../models/auth.types';

/**
 * HTTP client configuration
 */
export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
}

/**
 * Request options
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * Simple HTTP client for auth API
 */
export class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private getToken: (() => string | null) | null = null;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Set token getter function (called before each request)
   */
  setTokenGetter(getter: () => string | null): void {
    this.getToken = getter;
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${path}`;
  }

  /**
   * Build request headers
   */
  private buildHeaders(options?: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    // Inject auth token if available
    if (this.getToken) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API errors
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: ApiError;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || 'Unknown error',
        statusCode: response.status,
      };
    }

    const error = new Error(errorData.message) as Error & { response?: { status: number; data: ApiError } };
    error.response = {
      status: response.status,
      data: errorData,
    };

    throw error;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'GET',
        headers: this.buildHeaders(options),
        credentials: options?.withCredentials ? 'include' : 'same-origin',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'POST',
        headers: this.buildHeaders(options),
        credentials: options?.withCredentials ? 'include' : 'same-origin',
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'PATCH',
        headers: this.buildHeaders(options),
        credentials: options?.withCredentials ? 'include' : 'same-origin',
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: 'DELETE',
        headers: this.buildHeaders(options),
        credentials: options?.withCredentials ? 'include' : 'same-origin',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
