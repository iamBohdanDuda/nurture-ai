import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './middleware/asyncStorage';
import { STORAGE_KEYS, FREE_MESSAGE_LIMIT } from '@/core/constants';
import { type ChatMessageUI } from '@/types/common';

interface ChatState {
  messages: ChatMessageUI[];
  isStreaming: boolean;
  weeklyMessageCount: number;
  weeklyMessageLimit: number;
  userMemoryMd: string;
  weekStartTimestamp: number;

  // Actions
  addMessage: (message: ChatMessageUI) => void;
  setMessages: (messages: ChatMessageUI[]) => void;
  setStreaming: (streaming: boolean) => void;
  incrementMessageCount: () => void;
  resetWeeklyCount: () => void;
  setUserMemory: (md: string) => void;
  canSendMessage: () => boolean;
  clearMessages: () => void;
}

const getWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      weeklyMessageCount: 0,
      weeklyMessageLimit: FREE_MESSAGE_LIMIT,
      userMemoryMd: 'No history yet.',
      weekStartTimestamp: getWeekStart(),

      addMessage: (message) =>
        set((state) => ({
          messages: [message, ...state.messages],
        })),

      setMessages: (messages) => set({ messages }),

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
      }),
    }
  )
);
