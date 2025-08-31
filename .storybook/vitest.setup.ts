// Vitest + Storybook setup
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  // put global setup here if needed
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  // put global teardown here if needed
});
