import { defineConfig } from 'vitest/config';

/**
 * End-to-end suite.
 *
 * It drives the *built* server (`dist/main.js`) over HTTP and socket.io, exactly
 * like a browser would, so it is deliberately kept out of `npm test` (which must
 * stay runnable without a database). `npm run test:e2e` builds first, because
 * Nest relies on `emitDecoratorMetadata` — something esbuild, vitest's
 * transformer, does not emit.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.e2e.spec.ts'],
    exclude: ['node_modules', 'dist'],
    environment: 'node',
    globals: true,
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
    pool: 'forks',
  },
});
