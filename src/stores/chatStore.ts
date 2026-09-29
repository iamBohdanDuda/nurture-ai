import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS, FREE_MESSAGE_LIMIT } from '@/core/constants';
import { type ChatMessageUI, type AIProvider } from '@/types/common';

interface ChatState {
  messages: ChatMessageUI[];
  isStreaming: boolean;
  weeklyMessageCount: number;
  weeklyMessageLimit: number;
  userMemoryMd: string;
  weekStartTimestamp: number;
  selectedProvider: AIProvider;
  selectedModel: string;
  activeChatId: string | null;

  // Actions
  addMessage: (message: ChatMessageUI) => void;
  setMessages: (messages: ChatMessageUI[]) => void;
  setActiveChatId: (id: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  incrementMessageCount: () => void;
  resetWeeklyCount: () => void;
  setUserMemory: (md: string) => void;
  setSelectedProvider: (provider: AIProvider, model?: string) => void;
  canSendMessage: () => boolean;
  clearMessages: () => void;
}

const getWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
};

const DEFAULT_GEMINI_MODEL = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite';

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      weeklyMessageCount: 0,
      weeklyMessageLimit: FREE_MESSAGE_LIMIT,
      userMemoryMd: 'No history yet.',
      weekStartTimestamp: getWeekStart(),
      selectedProvider: 'gemini',
      selectedModel: DEFAULT_GEMINI_MODEL,
      activeChatId: null,

      addMessage: (message) =>
        set((state) => ({
          messages: [message, ...state.messages],
        })),

      setMessages: (messages) => set({ messages }),

      setActiveChatId: (id) => set({ activeChatId: id }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      incrementMessageCount: () => {
        const currentWeekStart = getWeekStart();
        const state = get();
        // Reset if new week
        if (currentWeekStart > state.weekStartTimestamp) {
          set({
            weeklyMessageCount: 1,
            weekStartTimestamp: currentWeekStart,
          });
        } else {
          set((s) => ({ weeklyMessageCount: s.weeklyMessageCount + 1 }));
        }
      },

      resetWeeklyCount: () =>
        set({ weeklyMessageCount: 0, weekStartTimestamp: getWeekStart() }),

      setUserMemory: (userMemoryMd) => set({ userMemoryMd }),

      setSelectedProvider: (provider, model) => {
        const defaultModel = provider === 'gemini' ? (process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite') : 'gpt-4o-mini';
        set({ selectedProvider: provider, selectedModel: model || defaultModel });
      },

      canSendMessage: () => {
        const state = get();
        const currentWeekStart = getWeekStart();
        if (currentWeekStart > state.weekStartTimestamp) return true;
        return state.weeklyMessageCount < state.weeklyMessageLimit;
      },

      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: STORAGE_KEYS.CHAT,
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        weeklyMessageCount: state.weeklyMessageCount,
        weekStartTimestamp: state.weekStartTimestamp,
        userMemoryMd: state.userMemoryMd,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
        activeChatId: state.activeChatId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (state.selectedModel === 'gemini-2.5-pro' || !state.selectedModel)) {
          state.setSelectedProvider(state.selectedProvider || 'gemini', DEFAULT_GEMINI_MODEL);
        }
      },
    }
  )
);
