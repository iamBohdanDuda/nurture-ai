import { useState, useCallback, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useAuthStore } from '@/stores/authStore';
import { useSendMessage, useChatMessages, useUserMemory, useChats } from './useChatMessages';
import { chatService } from '../services/chatService';
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
    toolCallHint: dbMsg.tool_call_hint ?? undefined,
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
    selectedProvider,
    selectedModel,
    setStreaming,
    incrementMessageCount,
    canSendMessage,
    setUserMemory,
    setSelectedProvider,
    activeChatId,
    setActiveChatId,
  } = useChatStore();

  const [localMessages, setLocalMessages] = useState<ChatMessageUI[]>([]);
  const { data: dbMessages, isLoading: isLoadingHistory } = useChatMessages(activeChatId);
  const { data: chats } = useChats();
  const { data: memoryMd } = useUserMemory();
  const sendMessageMutation = useSendMessage();
  const isMidSendRef = useRef(false);

  // Sync DB messages to local state (but not while we're mid-send to avoid overwriting optimistic messages)
  useEffect(() => {
    if (dbMessages && dbMessages.length > 0 && !isMidSendRef.current) {
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
      if (!message) return;

      console.log('[useChat] handleSend called:', message.text?.substring(0, 50));

      // Check freemium limit
      if (!isPremium && !canSendMessage()) {
        console.log('[useChat] Message blocked by freemium limit');
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
      isMidSendRef.current = true;
      console.log('[useChat] Streaming set to true, calling sendMessage...');

      try {
        let currentChatId = activeChatId;
        if (!currentChatId) {
          if (!userId) throw new Error('User not logged in');
          const newChat = await chatService.createChat(userId, message.text.substring(0, 30) + '...');
          currentChatId = newChat.id;
          setActiveChatId(currentChatId);
        }

        const aiResponse = await sendMessageMutation.mutateAsync({
          chatId: currentChatId,
          content: message.text,
          imageUrl: message.image,
          provider: selectedProvider,
          model: selectedModel,
        });

        console.log('[useChat] AI response received:', aiResponse?.content?.substring(0, 80));

        // Add AI response to local state
        const aiMsg = toUIMessage(aiResponse);
        setLocalMessages((prev) => [aiMsg, ...prev]);
      } catch (error: any) {
        console.error('[useChat] handleSend error:', error?.message || error);
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
        console.log('[useChat] Streaming set to false');
        // Allow DB sync to overwrite after a short delay so our local AI message renders first
        setTimeout(() => {
          isMidSendRef.current = false;
        }, 2000);
      }

      return { blocked: false };
    },
    [userId, isPremium, canSendMessage, incrementMessageCount, setStreaming, sendMessageMutation, selectedProvider, selectedModel, activeChatId, setActiveChatId]
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
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    isSending: sendMessageMutation.isPending,
    handleSend,
    handleSuggestedQuestion,
    canSendMessage: isPremium || canSendMessage(),
    chats: chats ?? [],
    activeChatId,
    setActiveChatId,
  };
}
