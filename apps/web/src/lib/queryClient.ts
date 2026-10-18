import { QueryClient } from '@tanstack/react-query';

/**
 * The single, app-wide react-query client.
 *
 * Kept in its own module so non-React code (e.g. the realtime layer) can reach
 * the very same instance without importing `main.tsx`.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
