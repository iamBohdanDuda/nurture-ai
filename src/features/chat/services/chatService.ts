import { supabase, invokeFunction } from '@/config/supabase';
import { type ChatMessage, type ChatSession } from '@/types/database';
import { trackingService } from '@/features/tracking/services/trackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_CHATS_KEY = 'nurtureai-local-chats-list';
const LOCAL_MESSAGES_KEY_PREFIX = 'nurtureai-local-messages-';
const LOCAL_MEMORY_KEY_PREFIX = 'nurtureai-local-user-memory-';
const AI_HISTORY_LIMIT = 20; // matches MAX_HISTORY in the chat-orchestrator edge function

export const chatService = {
  /**
   * Helper: Retrieve locally stored chat sessions.
   */
  async getLocalChats(userId: string): Promise<ChatSession[]> {
    try {
      const raw = await AsyncStorage.getItem(`${LOCAL_CHATS_KEY}_${userId}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[ChatService] getLocalChats error:', e);
      return [];
    }
  },

  /**
   * Helper: Save or update a local chat session.
   */
  async saveLocalChat(userId: string, chat: ChatSession): Promise<void> {
    try {
      const existing = await this.getLocalChats(userId);
      const index = existing.findIndex((c) => c.id === chat.id);
      let updated: ChatSession[];
      if (index >= 0) {
        updated = [...existing];
        updated[index] = { ...updated[index], ...chat, updated_at: new Date().toISOString() };
      } else {
        updated = [chat, ...existing];
      }
      await AsyncStorage.setItem(`${LOCAL_CHATS_KEY}_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('[ChatService] saveLocalChat error:', e);
    }
  },

  /**
   * Helper: Delete local chat session and its stored messages.
   */
  async deleteLocalChat(userId: string, chatId: string): Promise<void> {
    try {
      const existing = await this.getLocalChats(userId);
      const filtered = existing.filter((c) => c.id !== chatId);
      await AsyncStorage.setItem(`${LOCAL_CHATS_KEY}_${userId}`, JSON.stringify(filtered));
      await AsyncStorage.removeItem(`${LOCAL_MESSAGES_KEY_PREFIX}${chatId}`);
    } catch (e) {
      console.warn('[ChatService] deleteLocalChat error:', e);
    }
  },

  /**
   * Helper: Retrieve locally stored messages for a chat session.
   */
  async getLocalMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const raw = await AsyncStorage.getItem(`${LOCAL_MESSAGES_KEY_PREFIX}${chatId}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[ChatService] getLocalMessages error:', e);
      return [];
    }
  },

  /**
   * Helper: Save a message locally under the given chatId.
   */
  async saveLocalMessage(chatId: string, message: ChatMessage): Promise<void> {
    try {
      const existing = await this.getLocalMessages(chatId);
      const foundIdx = existing.findIndex((m) => m.id === message.id);
      let updated: ChatMessage[];
      if (foundIdx >= 0) {
        updated = [...existing];
        updated[foundIdx] = message;
      } else {
        updated = [message, ...existing];
      }
      await AsyncStorage.setItem(`${LOCAL_MESSAGES_KEY_PREFIX}${chatId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('[ChatService] saveLocalMessage error:', e);
    }
  },

  /**
   * Fetch chat sessions (combining local storage and Supabase remote).
   */
  async getChats(userId: string): Promise<ChatSession[]> {
    console.log(`[DB: chatService] getChats (user: ${userId})`);
    const localChats = await this.getLocalChats(userId);

    let remoteChats: ChatSession[] = [];
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        remoteChats = data;
      }
    } catch (err: any) {
      console.warn('[ChatService] getChats remote notice:', err?.message || err);
    }

    // Merge remote and local by id, newest first
    const map = new Map<string, ChatSession>();
    for (const c of localChats) {
      map.set(c.id, c);
    }
    for (const c of remoteChats) {
      map.set(c.id, c);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Create a new chat session. Throws when the server insert fails: a local-only chat id
   * can never sync (chat_history.chat_id must reference a real chats row).
   */
  async createChat(userId: string, title: string): Promise<ChatSession> {
    console.log(`[DB: chatService] INSERT into chats (user: ${userId}, title: ${title})`);
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({ user_id: userId, title })
      .select()
      .single();
    if (error) throw error;

    await this.saveLocalChat(userId, chat);
    return chat;
  },

  /**
   * Delete a chat session and all its messages.
   */
  async deleteChat(userId: string, chatId: string): Promise<void> {
    console.log(`[DB: chatService] DELETE chat: ${chatId}`);
    await this.deleteLocalChat(userId, chatId);

    try {
      await supabase.from('chats').delete().eq('id', chatId);
    } catch (err: any) {
      console.warn('[ChatService] Remote delete notice:', err?.message || err);
    }
  },

  /**
   * Fetch chat history (combining local storage and Supabase).
   */
  async getMessages(
    userId: string,
    chatId: string | null,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    if (!chatId) {
      return [];
    }

    const localMsgs = await this.getLocalMessages(chatId);
    let remoteMsgs: ChatMessage[] = [];

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data) {
        remoteMsgs = data;
      }
    } catch (err: any) {
      console.warn('[ChatService] getMessages network error:', err?.message || err);
    }

    // Merge by id
    const map = new Map<string, ChatMessage>();
    for (const m of localMsgs) {
      map.set(m.id, m);
    }
    for (const m of remoteMsgs) {
      map.set(m.id, m);
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return merged.slice(offset, offset + limit);
  },

  /**
   * Send a user message and get the AI response from the chat-orchestrator Edge Function.
   * All model calls happen server-side; failures throw so the UI shows an error instead of a fake reply.
   */
  async sendMessage(
    userId: string,
    chatId: string,
    content: string,
    imageUrl?: string,
    provider: string = 'gemini',
    model?: string
  ): Promise<ChatMessage> {
    console.log('[ChatService] sendMessage called:', { chatId, provider, model });

    // 1. Persist the user message. Prefer the server row so local and remote copies share one id.
    let userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      user_id: userId,
      chat_id: chatId,
      role: 'user',
      content,
      image_url: imageUrl ?? null,
      tool_call_hint: null,
      created_at: new Date().toISOString(),
    };
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({ user_id: userId, chat_id: chatId, role: 'user' as const, content, image_url: imageUrl ?? null })
        .select()
        .single();
      if (!error && data) userMessage = data;
      else if (error) console.warn('[ChatService] Supabase user message insert notice:', error.message);
    } catch (err: any) {
      console.warn('[ChatService] Supabase user message insert network notice:', err?.message || err);
    }
    await this.saveLocalMessage(chatId, userMessage);

    // Ensure chat session is saved / updated locally
    const existingChats = await this.getLocalChats(userId);
    const existing = existingChats.find((c) => c.id === chatId);
    const chatTitle = existing?.title && existing.title !== 'New Chat'
      ? existing.title
      : content.substring(0, 36).trim() + (content.length > 36 ? '...' : '');

    await this.saveLocalChat(userId, {
      id: chatId,
      user_id: userId,
      title: chatTitle,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 2. History already contains the message saved above, so it isn't appended again
    const history = (await this.getMessages(userId, chatId, AI_HISTORY_LIMIT))
      .reverse()
      .map((m) => ({ role: m.role, content: m.content }));
    const healthContext = await trackingService.getAggregatedAIContext(userId);

    const result = await invokeFunction<{ reply: string; tool_call_hint: string | null }>('chat-orchestrator', {
      messages: history,
      health_context: healthContext,
      utc_offset_minutes: -new Date().getTimezoneOffset(),
      provider,
      model,
    });
    return this.saveAndReturnAIResponse(userId, chatId, result.reply, result.tool_call_hint ?? undefined);
  },

  /**
   * Save AI response to DB and return ChatMessage object with toolCallHint.
   */
  async saveAndReturnAIResponse(userId: string, chatId: string, content: string, toolCallHint?: string): Promise<ChatMessage> {
    console.log(`[DB: chatService] saveAndReturnAIResponse (chatId: ${chatId}, toolHint: ${toolCallHint || 'none'})`);

    let finalMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      user_id: userId,
      chat_id: chatId,
      role: 'assistant',
      content,
      image_url: null,
      tool_call_hint: toolCallHint ?? null,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          chat_id: chatId,
          role: 'assistant' as const,
          content,
          image_url: null,
          tool_call_hint: toolCallHint ?? null,
        })
        .select()
        .single();

      if (!error && data) {
        finalMsg = data;
      }
    } catch (err: any) {
      console.warn('[ChatService] save AI response remote insert error:', err?.message || err);
    }

    // Save locally
    await this.saveLocalMessage(chatId, finalMsg);
    return finalMsg;
  },

  /**
   * Get the user's condensed memory markdown notes.
   * Checks local storage and Supabase remote, keeping them in sync.
   */
  async getUserMemory(userId: string): Promise<string> {
    let localMemory: string | null = null;
    try {
      localMemory = await AsyncStorage.getItem(`${LOCAL_MEMORY_KEY_PREFIX}${userId}`);
    } catch (e) {
      // ignore
    }

    try {
      const { data, error } = await supabase
        .from('user_memory')
        .select('markdown_summary')
        .eq('user_id', userId)
        .single();

      if (!error && data?.markdown_summary) {
        // Sync to local cache
        await AsyncStorage.setItem(`${LOCAL_MEMORY_KEY_PREFIX}${userId}`, data.markdown_summary);
        return data.markdown_summary;
      }
    } catch (err: any) {
      console.warn('[ChatService] getUserMemory network error:', err?.message || err);
    }

    return localMemory || 'No notes recorded yet.';
  },

  /**
   * Save or update the user's persistent memory notes (manual edits from the Memory screen).
   * Persists immediately to local AsyncStorage and updates Supabase user_memory table.
   */
  async updateUserMemory(userId: string, markdownSummary: string): Promise<string> {
    console.log(`[DB: chatService] updateUserMemory (user: ${userId})`);
    const cleanSummary = (markdownSummary || '').trim();

    // 1. Save locally immediately
    try {
      await AsyncStorage.setItem(`${LOCAL_MEMORY_KEY_PREFIX}${userId}`, cleanSummary);
    } catch (e) {
      console.warn('[ChatService] Error saving local memory:', e);
    }

    // 2. Persist to Supabase
    try {
      const { error } = await supabase
        .from('user_memory')
        .upsert(
          {
            user_id: userId,
            markdown_summary: cleanSummary,
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.warn('[ChatService] Supabase updateUserMemory notice:', error.message);
      }
    } catch (err: any) {
      console.warn('[ChatService] Supabase updateUserMemory network notice:', err?.message || err);
    }

    return cleanSummary;
  },
};
