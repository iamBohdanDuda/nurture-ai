import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/api';
import { chatService } from '../services/chatService';
import { useAuthStore } from '@/stores/authStore';
import { type ChatMessage } from '@/types/database';

/**
 * TanStack Query hook for fetching chat message history.
 */
export function useChatMessages(limit = 50) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: queryKeys.chatMessages(userId ?? '', 0),
    queryFn: () => chatService.getMessages(userId!, limit),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 min — chat is relatively fresh
  });
}

/**
 * TanStack Query hook for fetching user memory markdown.
 */
export function useUserMemory() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: queryKeys.memory(userId ?? ''),
    queryFn: () => chatService.getUserMemory(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation hook for sending a chat message.
 * Invalidates chat query cache on success for fresh data.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: ({
      content,
      imageUrl,
    }: {
      content: string;
      imageUrl?: string;
    }) => chatService.sendMessage(userId!, content, imageUrl),

    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.chatMessages(userId, 0),
        });
      }
    },
  });
}
