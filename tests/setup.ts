// Vitest setup for React Testing Library
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ensure cleanup between tests to avoid DOM leakage across renders
afterEach(cleanup);
