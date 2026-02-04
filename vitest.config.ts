import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/pages/**',           // Legacy - will become examples
        'src/main/**',            // Legacy entry point
        'src/index.ts',           // Public API (export only, no logic)
        'src/components/**',      // Legacy components (not exported)
        'src/context/**',         // Legacy context (not exported)
        'src/providers/**',       // Legacy AuthProvider (will be replaced by useAuth)
        'src/models/**',          // Type definitions only (no logic to test)
        'src/utils/colorHelpers.ts',          // Legacy util (used only in pages)
        'src/utils/attachAuthInterceptor.ts', // Legacy util (Axios-based, not used in hooks)
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
