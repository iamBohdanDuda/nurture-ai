import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // Prevent retrying repeatedly on network/DNS errors (host unreachable)
        if (
          error?.message?.includes('Network request failed') ||
          error?.message?.includes('Failed to fetch') ||
          failureCount >= 2
        ) {
          return false;
        }
        return true;
      },
      refetchOnWindowFocus: false,
    },
  },
});

// Query key factory — consistent keys for AI agent use
export const queryKeys = {
  user: (id: string) => ['user', id] as const,
  chats: (userId: string) => ['chats', userId] as const,
  chatMessages: (userId: string, chatId: string | null, page?: number) => ['chat', 'messages', userId, chatId, page] as const,
  memory: (userId: string) => ['memory', userId] as const,
} as const;
