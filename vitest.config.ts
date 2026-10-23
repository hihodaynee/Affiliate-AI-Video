import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { 'flow-sdk': fileURLToPath(new URL('./tests/flow-sdk.ts', import.meta.url)) } },
  test: { environment: 'jsdom', clearMocks: true, restoreMocks: true },
});
