import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuthStore } from '@/stores/authStore';
import { useSendMessage, useChatMessages, useUserMemory } from './useChatMessages';
import { type ChatMessageUI } from '@/types/common';
import { type ChatMessage } from '@/types/database';

const AI_USER = { _id: 'nurtureai', name: 'NurtureAI', avatar: '🤱' };
const CURRENT_USER_ID = 'current-user';

/**
 * Convert DB ChatMessage to GiftedChat-compatible ChatMessageUI.
 */
function toUIMessage(dbMsg: ChatMessage): ChatMessageUI {
  return {
    _id: dbMsg.id,
    text: dbMsg.content,
    createdAt: new Date(dbMsg.created_at),
    user: dbMsg.role === 'assistant' ? AI_USER : { _id: CURRENT_USER_ID },
    image: dbMsg.image_url ?? undefined,
  };
}

/**
 * Main chat orchestration hook.
 * Combines store state, message fetching, sending, and limit enforcement.
 */
export function useChat() {
  const userId = useAuthStore((s) => s.user?.id);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const {
    isStreaming,
    weeklyMessageCount,
    weeklyMessageLimit,
    setStreaming,
    incrementMessageCount,
    canSendMessage,
    setUserMemory,
  } = useChatStore();

  const [localMessages, setLocalMessages] = useState<ChatMessageUI[]>([]);
  const { data: dbMessages, isLoading: isLoadingHistory } = useChatMessages();
  const { data: memoryMd } = useUserMemory();
  const sendMessageMutation = useSendMessage();

  // Sync DB messages to local state
  useEffect(() => {
    if (dbMessages) {
      setLocalMessages(dbMessages.map(toUIMessage));
    }
  }, [dbMessages]);

  // Sync memory markdown
  useEffect(() => {
    if (memoryMd) {
      setUserMemory(memoryMd);
    }
  }, [memoryMd, setUserMemory]);

  const showSuggestions = localMessages.length === 0 && !isLoadingHistory;

  /**
   * Send a message. Handles optimistic UI, limit checks, and AI response.
   */
  const handleSend = useCallback(
    async (messages: ChatMessageUI[]) => {
      const message = messages[0];
      if (!message || !userId) return;

      // Check freemium limit
      if (!isPremium && !canSendMessage()) {
        return { blocked: true };
      }

      // Optimistic: add user message to local state immediately
      const userMsg: ChatMessageUI = {
        _id: `user-${Date.now()}`,
        text: message.text,
        createdAt: new Date(),
        user: { _id: CURRENT_USER_ID },
        image: message.image,
      };

      setLocalMessages((prev) => [userMsg, ...prev]);
      incrementMessageCount();
      setStreaming(true);

      try {
        const aiResponse = await sendMessageMutation.mutateAsync({
          content: message.text,
          imageUrl: message.image,
        });

        // Add AI response to local state
        const aiMsg = toUIMessage(aiResponse);
        setLocalMessages((prev) => [aiMsg, ...prev]);
      } catch (error) {
        // Add error message
        const errorMsg: ChatMessageUI = {
          _id: `error-${Date.now()}`,
          text: "I'm sorry, I couldn't process your message. Please try again.",
          createdAt: new Date(),
          user: AI_USER,
        };
        setLocalMessages((prev) => [errorMsg, ...prev]);
      } finally {
        setStreaming(false);
      }

      return { blocked: false };
    },
    [userId, isPremium, canSendMessage, incrementMessageCount, setStreaming, sendMessageMutation]
  );

  /**
   * Send a suggested question as if the user typed it.
   */
  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      const msg: ChatMessageUI = {
        _id: `suggest-${Date.now()}`,
        text: question,
        createdAt: new Date(),
        user: { _id: CURRENT_USER_ID },
      };
      handleSend([msg]);
    },
    [handleSend]
  );

  return {
    messages: localMessages,
    isStreaming,
    isLoadingHistory,
    weeklyMessageCount,
    weeklyMessageLimit,
    isPremium,
    showSuggestions,
    isSending: sendMessageMutation.isPending,
    handleSend,
    handleSuggestedQuestion,
    canSendMessage: isPremium || canSendMessage(),
  };
}
