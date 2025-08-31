import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (client) return client;
  client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // 네트워크 오프라인이면 즉시 중단
          if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        staleTime: 30_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
  return client;
}

export const queryClient = getQueryClient();
