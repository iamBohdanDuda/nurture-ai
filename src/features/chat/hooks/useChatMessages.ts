import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/api';
import { chatService } from '../services/chatService';
import { useAuthStore } from '@/stores/authStore';
import { type ChatMessage } from '@/types/database';

/**
 * TanStack Query hook for fetching the list of chat sessions.
 */
export function useChats() {
  const userId = useAuthStore((s) => s.user?.id) || 'current-user';

  return useQuery({
    queryKey: queryKeys.chats(userId),
    queryFn: () => chatService.getChats(userId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * TanStack Query hook for fetching chat message history.
 */
export function useChatMessages(chatId: string | null, limit = 50) {
  const userId = useAuthStore((s) => s.user?.id) || 'current-user';

  return useQuery({
    queryKey: queryKeys.chatMessages(userId, chatId, 0),
    queryFn: () => chatService.getMessages(userId, chatId, limit),
    enabled: !!chatId,
    staleTime: 2 * 60 * 1000, // 2 min — chat is relatively fresh
  });
}

/**
 * TanStack Query hook for fetching user memory markdown.
 */
export function useUserMemory() {
  const userId = useAuthStore((s) => s.user?.id) || 'current-user';

  return useQuery({
    queryKey: queryKeys.memory(userId),
    queryFn: () => chatService.getUserMemory(userId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation hook for sending a chat message.
 * Invalidates chat query cache on success for fresh data.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id) || 'current-user';

  return useMutation({
    mutationFn: ({
      chatId,
      content,
      imageUrl,
      provider,
      model,
    }: {
      chatId: string;
      content: string;
      imageUrl?: string;
      provider?: string;
      model?: string;
    }) => chatService.sendMessage(userId, chatId, content, imageUrl, provider, model),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.chatMessages(userId, variables.chatId, 0),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.chats(userId),
      });
    },
  });
}
