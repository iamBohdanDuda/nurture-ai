import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Query key factory — consistent keys for AI agent use
export const queryKeys = {
  user: (id: string) => ['user', id] as const,
  chat: (userId: string) => ['chat', userId] as const,
  chatMessages: (userId: string, page?: number) => ['chat', 'messages', userId, page] as const,
  metrics: (userId: string, type?: string) => ['metrics', userId, type] as const,
  reminders: (userId: string) => ['reminders', userId] as const,
  memory: (userId: string) => ['memory', userId] as const,
} as const;
