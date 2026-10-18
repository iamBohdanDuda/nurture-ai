import { supabase } from '@/config/supabase';
import { type ChatMessage, type ChatSession } from '@/types/database';
import { trackingService } from '@/features/tracking/services/trackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EDGE_FUNCTION_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const LOCAL_CHATS_KEY = 'nurtureai-local-chats-list';
const LOCAL_MESSAGES_KEY_PREFIX = 'nurtureai-local-messages-';
const LOCAL_MEMORY_KEY_PREFIX = 'nurtureai-local-user-memory-';

/**
 * Builds the centralized AI system prompt containing clinical guidelines,
 * persistent user memory notes, memory management rules, and recent health context.
 */
export function buildChatSystemPrompt(healthContext: any, userMemoryNotes?: string): string {
  let prompt = `You are NurtureAI, an expert, empathetic, and medically-accurate pregnancy assistant. You offer supportive advice based on standard prenatal guidelines. You do not replace a doctor. Always end medical advice with a disclaimer to consult a healthcare provider if symptoms are severe. Do not greet the user if the last message in the chat history was sent today. Keep your messages concise, not overly detailed and long.`;

  const cleanMemory = userMemoryNotes && userMemoryNotes !== 'No history yet.' && userMemoryNotes !== 'No notes recorded yet.'
    ? userMemoryNotes.trim()
    : '';

  if (cleanMemory) {
    prompt += `\n\n[IMPORTANT USER NOTES & PERSISTENT MEMORY]:\n${cleanMemory}\nAlways respect and tailor your guidance around these known user facts (e.g. allergies, previous conditions, trimester/due date, preferences, symptoms, family context).`;
  } else {
    prompt += `\n\n[IMPORTANT USER NOTES & PERSISTENT MEMORY]:\nNo notes recorded yet.`;
  }

  prompt += `\n\n[MEMORY MANAGEMENT]:
You have persistent memory across conversations. You MUST actively remember and update important notes about the user.
Whenever the user shares or mentions key details—such as:
- Due date, gestational age, trimester, conception method (e.g. IVF), singleton/multiples
- Medical history, chronic conditions, complications (e.g. preeclampsia risk, gestational diabetes, hypertension, thyroid)
- Allergies, medications, prenatal supplements
- Dietary habits or restrictions (e.g. vegetarian, gluten-free, lactose intolerant, nausea triggers)
- Personal preferences, lifestyle, partner/family details, previous pregnancies/children
- Persistent or recurring symptoms
- Any explicit request: "Remember that...", "Note that...", "I am...", "Don't forget..."
Or whenever you decide a detail is significant for future maternal and emotional context:
Call the \`update_user_notes\` tool to record or update the complete summary of notes.
Organize notes into clear, bulleted markdown sections (e.g. Profile, Medical & Safety, Preferences & Lifestyle, Ongoing Symptoms).
Preserve previously known notes while adding or updating new information.
You may also append <update_notes>markdown notes here</update_notes> in your response to save updates.`;

  if (healthContext) {
    prompt += `\n\n[RECENT HEALTH CONTEXT]:\n${typeof healthContext === 'string' ? healthContext : JSON.stringify(healthContext)}`;
  }

  return prompt;
}

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

    // If local storage has no chat sessions, check if any orphaned message stores exist and reconstruct sessions
    if (map.size === 0) {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const msgKeys = allKeys.filter((k) => k.startsWith(LOCAL_MESSAGES_KEY_PREFIX));
        for (const mk of msgKeys) {
          const chatId = mk.replace(LOCAL_MESSAGES_KEY_PREFIX, '');
          const msgs = await this.getLocalMessages(chatId);
          if (msgs.length > 0) {
            const firstUserMsg = msgs.find((m) => m.role === 'user');
            const recoveredTitle = firstUserMsg?.content
              ? firstUserMsg.content.substring(0, 36).trim() + (firstUserMsg.content.length > 36 ? '...' : '')
              : 'Pregnancy Consultation';
            const recoveredChat: ChatSession = {
              id: chatId,
              user_id: userId,
              title: recoveredTitle,
              created_at: msgs[msgs.length - 1]?.created_at || new Date().toISOString(),
              updated_at: msgs[0]?.created_at || new Date().toISOString(),
            };
            map.set(chatId, recoveredChat);
            await this.saveLocalChat(userId, recoveredChat);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return merged;
  },

  /**
   * Create a new chat session. Saves locally immediately and attempts remote sync.
   */
  async createChat(userId: string, title: string): Promise<ChatSession> {
    console.log(`[DB: chatService] INSERT into chats (user: ${userId}, title: ${title})`);
    const newChat: ChatSession = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save locally first so it is never lost
    await this.saveLocalChat(userId, newChat);

    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (!error && data) {
        await this.saveLocalChat(userId, data);
        return data;
      }
    } catch (err: any) {
      console.warn('[ChatService] createChat remote failed, using local session:', err?.message || err);
    }

    return newChat;
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
   * Send a user message and get AI response via Edge Function.
   * Includes aggregated health metrics & timestamps for context.
   */
  async sendMessage(
    userId: string,
    chatId: string,
    content: string,
    imageUrl?: string,
    provider: string = 'gemini',
    model: string = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite'
  ): Promise<ChatMessage> {
    console.log('[ChatService] sendMessage called:', { userId, chatId, content: content.substring(0, 50), provider, model });

    // 1. Persist user message locally immediately
    const userMessageObj: ChatMessage = {
      id: `user-${Date.now()}`,
      user_id: userId,
      chat_id: chatId,
      role: 'user',
      content,
      image_url: imageUrl ?? null,
      tool_call_hint: null,
      created_at: new Date().toISOString(),
    };
    await this.saveLocalMessage(chatId, userMessageObj);

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

    // 2. Persist user message to Supabase (non-blocking)
    console.log(`[DB: chatService] INSERT user message into chat_history (chatId: ${chatId})`);
    try {
      supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          chat_id: chatId,
          role: 'user' as const,
          content,
          image_url: imageUrl ?? null,
        })
        .then(
          ({ error }: any) => {
            if (error) console.warn('[ChatService] Supabase user message insert notice:', error.message);
          },
          (err: any) => {
            console.warn('[ChatService] Supabase user message insert network notice:', err?.message || err);
          }
        );
    } catch (err) {
      console.warn('[ChatService] Supabase user message queue notice:', err);
    }

    // Fetch previous messages for context
    const history = await this.getMessages(userId, chatId, 10);
    history.reverse(); // chronological order

    const formattedMessages = history.map(m => ({
      role: m.role,
      content: `[${new Date(m.created_at).toLocaleTimeString()}] ${m.content}`
    }));
    formattedMessages.push({
      role: 'user',
      content: `[${new Date().toLocaleTimeString()}] ${content}`
    });

    // 2. Fetch health context (non-blocking on failure)
    let healthContext: any = null;
    try {
      healthContext = await trackingService.getAggregatedAIContext(userId);
      console.log('[ChatService] Health context fetched successfully');
    } catch (ctxErr: any) {
      console.warn('[ChatService] Health context fetch failed (continuing without):', ctxErr?.message);
      healthContext = { current_date: new Date().toISOString().split('T')[0] };
    }

    // 2b. Pull user memory notes (non-blocking on failure)
    let userMemory = 'No notes recorded yet.';
    try {
      userMemory = await this.getUserMemory(userId);
      console.log('[ChatService] User memory pulled successfully, length:', userMemory.length);
    } catch (memErr: any) {
      console.warn('[ChatService] User memory fetch failed (continuing without):', memErr?.message);
    }

    // 3. Try Edge Function first, then direct provider fallbacks
    const localGeminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const localGroqKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
    const localOpenAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    // Try Edge Function
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token || !EDGE_FUNCTION_BASE) {
        throw new Error('No auth token or Edge Function URL');
      }

      const response = await fetch(
        `${EDGE_FUNCTION_BASE}/functions/v1/chat-orchestrator`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userId,
            messages: formattedMessages,
            image_url: imageUrl,
            health_context: healthContext,
            user_memory: userMemory,
            provider,
            model,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Edge Function error: ${response.status}`);
      }

      const result = await response.json();
      console.log('[ChatService] Edge Function replied successfully');
      return await this.saveAndReturnAIResponse(userId, chatId, result.reply, result.tool_call_hint);
    } catch (err: any) {
      console.warn('[ChatService] Edge Function unavailable:', err?.message);
    }

    // Try direct Groq API (openai/gpt-oss-120b)
    if (provider === 'groq') {
      if (localGroqKey) {
        console.log('[ChatService] Trying direct Groq API with model:', model || 'openai/gpt-oss-120b');
        try {
          const directResult = await this.callGroqDirect(userId, formattedMessages, healthContext, userMemory, model || 'openai/gpt-oss-120b', localGroqKey);
          console.log('[ChatService] Groq direct reply received, length:', directResult.text.length);
          return await this.saveAndReturnAIResponse(userId, chatId, directResult.text, directResult.toolCallHint);
        } catch (directErr: any) {
          console.warn('[ChatService] Direct Groq API call failed:', directErr?.message || directErr);
        }
      } else {
        console.warn('[ChatService] No Groq API key available. Ensure GROQ_API_KEY or EXPO_PUBLIC_GROQ_API_KEY is configured.');
      }
    }

    // Try direct Gemini API
    if (provider === 'gemini' || !provider) {
      if (localGeminiKey) {
        console.log('[ChatService] Trying direct Gemini API with model:', model);
        try {
          const directResult = await this.callGeminiDirect(userId, formattedMessages, healthContext, userMemory, model, localGeminiKey);
          console.log('[ChatService] Gemini direct reply received, length:', directResult.text.length, 'toolHint:', directResult.toolCallHint);
          return await this.saveAndReturnAIResponse(userId, chatId, directResult.text, directResult.toolCallHint);
        } catch (directErr: any) {
          console.warn('[ChatService] Direct Gemini API call failed:', directErr?.message || directErr);
        }
      } else {
        console.warn('[ChatService] No Gemini API key available. Set EXPO_PUBLIC_GEMINI_API_KEY in .env');
      }
    }

    // Try direct OpenAI API (code kept intact as requested, provider deactivated in UI)
    if (provider === 'openai' && localOpenAIKey) {
      console.log('[ChatService] Trying direct OpenAI API (code preserved intact)');
      try {
        const directResult = await this.callOpenAIDirect(userId, formattedMessages, healthContext, userMemory, model || 'gpt-4o-mini', localOpenAIKey);
        return await this.saveAndReturnAIResponse(userId, chatId, directResult.text, directResult.toolCallHint);
      } catch (openAiErr: any) {
        console.warn('[ChatService] Direct OpenAI API call failed:', openAiErr?.message || openAiErr);
      }
    }

    // Provider-to-provider automatic fallback
    if (provider === 'groq' && localGeminiKey) {
      console.log('[ChatService] Groq failed, attempting Gemini fallback');
      try {
        const directResult = await this.callGeminiDirect(userId, formattedMessages, healthContext, userMemory, process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite', localGeminiKey);
        return await this.saveAndReturnAIResponse(userId, chatId, directResult.text, directResult.toolCallHint);
      } catch (e) {
        // continue to mock
      }
    } else if (provider === 'gemini' && localGroqKey) {
      console.log('[ChatService] Gemini failed, attempting Groq fallback');
      try {
        const directResult = await this.callGroqDirect(userId, formattedMessages, healthContext, userMemory, 'openai/gpt-oss-120b', localGroqKey);
        return await this.saveAndReturnAIResponse(userId, chatId, directResult.text, directResult.toolCallHint);
      } catch (e) {
        // continue to mock
      }
    }

    // Final fallback: mock response
    console.log('[ChatService] Falling back to mock AI response');
    return this.mockAIResponse(userId, chatId, content);
  },

  /**
   * Direct Gemini REST API call with Tool Calling support for local Expo development.
   */
  async callGeminiDirect(
    userId: string,
    messages: { role: string; content: string }[],
    healthContext: any,
    userMemory: string,
    model: string,
    apiKey: string
  ): Promise<{ text: string; toolCallHint?: string }> {
    const targetDefault = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const geminiModel = !model || model === 'gemini-2.5-pro' ? targetDefault : model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
    const baseSystemPrompt = buildChatSystemPrompt(healthContext, userMemory);

    const tools = [
      {
        functionDeclarations: [
          {
            name: 'get_health_data_by_date',
            description: 'Fetch water intake, meals, symptoms, vitamins, weight, and kick logs for a specific date (YYYY-MM-DD) for the current user.',
            parameters: {
              type: 'OBJECT',
              properties: {
                date: { type: 'STRING', description: 'Target date in YYYY-MM-DD format (e.g. 2026-08-03).' }
              },
              required: ['date']
            }
          },
          {
            name: 'get_recent_health_logs',
            description: 'Fetch the most recent logs for a specific health category (kicks, water, meals, symptoms, weight, vitamins). Use this when the user asks for their "last" session or most recent entry, instead of a specific date.',
            parameters: {
              type: 'OBJECT',
              properties: {
                log_type: { type: 'STRING', description: 'Category of logs to fetch (kicks, water, meals, symptoms, weight, vitamins).' },
                limit: { type: 'NUMBER', description: 'Number of recent logs to fetch (default 3).' },
                sort_by: { type: 'STRING', description: 'Sort order: newest, oldest, lowest, or highest (default newest).' }
              },
              required: ['log_type']
            }
          },
          {
            name: 'update_user_notes',
            description: 'Save, update, or append important persistent notes about the user (e.g. allergies, medical conditions, due date/trimester, dietary restrictions, medications, preferences, symptoms, baby names, previous children/pregnancies). Call this whenever the user shares new personal facts, asks you to remember something, or when you decide a detail is vital to remember for future care.',
            parameters: {
              type: 'OBJECT',
              properties: {
                notes: {
                  type: 'STRING',
                  description: 'The complete updated markdown notes summary about the user to retain for all future conversations.'
                }
              },
              required: ['notes']
            }
          },
          {
            name: 'get_user_notes',
            description: 'Retrieve the current saved persistent notes and memory about the user.',
            parameters: {
              type: 'OBJECT',
              properties: {}
            }
          }
        ]
      }
    ];

    const initialPayload = {
      systemInstruction: { parts: [{ text: baseSystemPrompt }] },
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      tools,
      generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
    };

    console.log('[ChatService] Gemini Turn 1 request:', geminiModel, url.split('?')[0]);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initialPayload)
    });

    const data = await res.json();
    console.log('[ChatService] Gemini Turn 1 response status:', res.status);
    if (data.error) {
      console.error('[ChatService] Gemini Turn 1 error:', JSON.stringify(data.error));
      throw new Error(`Gemini API Error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.error('[ChatService] No candidates in Gemini response:', JSON.stringify(data).substring(0, 500));
      throw new Error('No candidates returned from Gemini API');
    }

    const functionCallPart = candidate?.content?.parts?.find((p: any) => p.functionCall);
    console.log('[ChatService] Gemini Turn 1 parts:', candidate?.content?.parts?.map((p: any) => Object.keys(p)));

    if (functionCallPart?.functionCall) {
      const callName = functionCallPart.functionCall.name;
      const args = functionCallPart.functionCall.args || {};
      let hint = 'Completed request';
      console.log('[ChatService] Tool call detected:', callName, 'args:', args);

      let toolResultData: any = {};
      
      console.log(`\n======================================================`);
      console.log(`[TOOL CALL EXECUTION]`);
      console.log(`Tool Name: ${callName}`);
      console.log(`Arguments:`, JSON.stringify(args, null, 2));
      console.log(`======================================================\n`);

      if (callName === 'get_health_data_by_date') {
        const targetDate = args.date || new Date().toISOString().split('T')[0];
        hint = `Checked health logs for ${targetDate}`;
        try {
          toolResultData = await trackingService.getHealthDataForDate(userId, targetDate);
          console.log('[ChatService] Tool result fetched, keys:', Object.keys(toolResultData));
        } catch (toolErr: any) {
          console.warn('[ChatService] Tool execution failed:', toolErr?.message);
          toolResultData = { error: 'Could not fetch health data', date: targetDate };
        }
      } else if (callName === 'get_recent_health_logs') {
        const logType = args.log_type || 'kicks';
        const limit = args.limit || 3;
        const sortBy = args.sort_by || 'newest';
        hint = `Checked recent ${logType} logs`;
        try {
          toolResultData = await trackingService.getRecentHealthLogs(userId, logType, limit, sortBy);
          console.log(`[ChatService] get_recent_health_logs fetched ${toolResultData?.logs?.length || 0} logs for ${logType}`);
        } catch (toolErr: any) {
          console.warn('[ChatService] get_recent_health_logs failed:', toolErr?.message);
          toolResultData = { error: 'Could not fetch recent logs' };
        }
      } else if (callName === 'update_user_notes') {
        const updatedNotes = args.notes || '';
        hint = 'Updated memory notes';
        try {
          await this.updateUserMemory(userId, updatedNotes);
          toolResultData = {
            status: 'success',
            message: 'User notes successfully updated in persistent memory.',
            updated_notes: updatedNotes,
          };
          console.log('[ChatService] update_user_notes executed, updated length:', updatedNotes.length);
        } catch (memErr: any) {
          console.warn('[ChatService] update_user_notes failed:', memErr?.message);
          toolResultData = { status: 'error', message: memErr?.message || 'Failed to update memory notes' };
        }
      } else if (callName === 'get_user_notes') {
        hint = 'Checked memory notes';
        try {
          const notes = await this.getUserMemory(userId);
          toolResultData = { status: 'success', notes };
          console.log('[ChatService] get_user_notes executed');
        } catch (memErr: any) {
          toolResultData = { status: 'error', message: 'Failed to retrieve notes' };
        }
      }

      // Turn 2: Send function execution result back to Gemini
      const secondPayload = {
        systemInstruction: { parts: [{ text: baseSystemPrompt }] },
        contents: [
          ...messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          candidate.content,
          {
            role: 'function',
            parts: [
              {
                functionResponse: {
                  name: callName,
                  response: {
                    name: callName,
                    content: toolResultData,
                  }
                }
              }
            ]
          }
        ],
        tools,
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      };

      console.log('[ChatService] Gemini Turn 2 request sending...');
      const secondRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secondPayload)
      });

      const secondData = await secondRes.json();
      console.log('[ChatService] Gemini Turn 2 response status:', secondRes.status);
      
      if (secondData.error) {
        console.warn('[ChatService] Gemini Tool Turn 2 Error:', JSON.stringify(secondData.error));
        // Retry without tools as fallback
        console.log('[ChatService] Retrying without tools...');
        const retryPayload = {
          systemInstruction: { parts: [{ text: baseSystemPrompt }] },
          contents: [
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            { role: 'user', parts: [{ text: `\n\n[Tool Result for ${callName}]: ${JSON.stringify(toolResultData)}` }] }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
        };
        const retryRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(retryPayload)
        });
        const retryData = await retryRes.json();
        let retryText = retryData.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
        if (retryText) {
          console.log('[ChatService] Retry without tools succeeded');
          const updateNotesMatch = retryText.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
          if (updateNotesMatch) {
            const newNotes = updateNotesMatch[1].trim();
            retryText = retryText.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
            hint = 'Updated memory notes';
            await this.updateUserMemory(userId, newNotes);
          }
          return { text: retryText, toolCallHint: hint };
        }
        throw new Error(`Gemini Tool Error and retry failed: ${secondData.error.message || JSON.stringify(secondData.error)}`);
      }

      // Extract text from any part (not just index 0)
      let secondText = secondData.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
      if (secondText) {
        console.log('[ChatService] Tool call flow completed successfully');
        const updateNotesMatch = secondText.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
        if (updateNotesMatch) {
          const newNotes = updateNotesMatch[1].trim();
          secondText = secondText.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
          hint = 'Updated memory notes';
          await this.updateUserMemory(userId, newNotes);
        }
        return { text: secondText, toolCallHint: hint };
      }
      console.warn('[ChatService] Turn 2 had no text in parts:', JSON.stringify(secondData.candidates?.[0]?.content?.parts).substring(0, 300));
    }

    // Extract text from the first response (non-tool-call path)
    let text = candidate?.content?.parts?.find((p: any) => p.text)?.text;
    if (!text) {
      console.warn('[ChatService] No text in Gemini response parts:', JSON.stringify(candidate?.content?.parts).substring(0, 300));
      throw new Error('No text returned from Gemini API');
    }
    console.log('[ChatService] Direct text response received');

    // Check for tag fallback <update_notes>
    let finalHint: string | undefined = undefined;
    const updateNotesMatch = text.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
    if (updateNotesMatch) {
      const newNotes = updateNotesMatch[1].trim();
      text = text.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
      finalHint = 'Updated memory notes';
      await this.updateUserMemory(userId, newNotes);
    }

    return { text, toolCallHint: finalHint };
  },

  /**
   * Direct Groq REST API call with openai/gpt-oss-120b for ultra-fast inference.
   */
  async callGroqDirect(
    userId: string,
    messages: { role: string; content: string }[],
    healthContext: any,
    userMemory: string,
    model: string,
    apiKey: string
  ): Promise<{ text: string; toolCallHint?: string }> {
    const targetModel = model || 'openai/gpt-oss-120b';
    const baseSystemPrompt = buildChatSystemPrompt(healthContext, userMemory);

    const groqMessages = [
      { role: 'system', content: baseSystemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content || '',
      })),
    ];

    const groqTools = [
      {
        type: 'function',
        function: {
          name: 'update_user_notes',
          description: 'Save or update important persistent notes and memory about the user (e.g. allergies, due date, medical history, dietary preferences, pregnancy conditions, symptoms, partner, family).',
          parameters: {
            type: 'object',
            properties: {
              notes: {
                type: 'string',
                description: 'The updated markdown summary of all important notes about the user.'
              }
            },
            required: ['notes']
          }
        }
      }
    ];

    console.log(`[ChatService] Groq request: ${targetModel} https://api.groq.com/openai/v1/chat/completions`);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: groqMessages,
        tools: groqTools,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[ChatService] Groq error (${response.status}):`, errText);
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const choice = data?.choices?.[0];
    const message = choice?.message;

    // Check for tool calls (Turn 1 -> Turn 2)
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      if (toolCall.function?.name === 'update_user_notes') {
        try {
          const parsed = JSON.parse(toolCall.function.arguments || '{}');
          if (parsed.notes) {
            await this.updateUserMemory(userId, parsed.notes);
            console.log('[ChatService] Groq tool update_user_notes executed');
          }

          const secondResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              messages: [
                ...groqMessages,
                message,
                {
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({ status: 'success', message: 'User notes updated successfully.' })
                }
              ],
              temperature: 0.7,
              max_tokens: 800,
            }),
          });
          const secondData = await secondResponse.json();
          let secondText = secondData?.choices?.[0]?.message?.content;
          if (secondText) {
            const updateNotesMatch = secondText.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
            if (updateNotesMatch) {
              const newNotes = updateNotesMatch[1].trim();
              secondText = secondText.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
              await this.updateUserMemory(userId, newNotes);
            }
            return { text: secondText.trim(), toolCallHint: 'Updated memory notes' };
          }
        } catch (groqToolErr) {
          console.warn('[ChatService] Groq tool execution fallback:', groqToolErr);
        }
      }
    }

    let rawText = message?.content;
    if (!rawText) {
      throw new Error('No content returned from Groq API');
    }

    let toolCallHint: string | undefined;
    const updateNotesMatch = rawText.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
    if (updateNotesMatch) {
      const newNotes = updateNotesMatch[1].trim();
      rawText = rawText.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
      toolCallHint = 'Updated memory notes';
      await this.updateUserMemory(userId, newNotes);
    }

    return { text: rawText.trim(), toolCallHint };
  },

  /**
   * Direct OpenAI REST API call (code kept intact as requested, provider deactivated in UI).
   */
  async callOpenAIDirect(
    userId: string,
    messages: { role: string; content: string }[],
    healthContext: any,
    userMemory: string,
    model: string,
    apiKey: string
  ): Promise<{ text: string; toolCallHint?: string }> {
    const targetModel = model || 'gpt-4o-mini';
    const baseSystemPrompt = buildChatSystemPrompt(healthContext, userMemory);

    const openAiMessages = [
      { role: 'system', content: baseSystemPrompt },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content || '',
      })),
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: openAiMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    let text = data?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No content returned from OpenAI API');
    }

    let toolCallHint: string | undefined;
    const updateNotesMatch = text.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
    if (updateNotesMatch) {
      const newNotes = updateNotesMatch[1].trim();
      text = text.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
      toolCallHint = 'Updated memory notes';
      await this.updateUserMemory(userId, newNotes);
    }

    return { text: text.trim(), toolCallHint };
  },

  /**
   * Save AI response to DB and return ChatMessage object with toolCallHint.
   */
  async saveAndReturnAIResponse(userId: string, chatId: string, content: string, toolCallHint?: string): Promise<ChatMessage> {
    console.log(`[DB: chatService] saveAndReturnAIResponse (chatId: ${chatId}, toolHint: ${toolCallHint || 'none'})`);
    
    // Safety check for any embedded <update_notes> tag
    let cleanContent = content;
    let finalHint = toolCallHint;
    const tagMatch = cleanContent.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
    if (tagMatch) {
      const extractedNotes = tagMatch[1].trim();
      cleanContent = cleanContent.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
      finalHint = 'Updated memory notes';
      this.updateUserMemory(userId, extractedNotes).catch(e => console.warn('[ChatService] Background memory update failed:', e));
    }

    let finalMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      user_id: userId,
      chat_id: chatId,
      role: 'assistant',
      content: cleanContent,
      image_url: null,
      tool_call_hint: finalHint ?? null,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          chat_id: chatId,
          role: 'assistant' as const,
          content: cleanContent,
          image_url: null,
          tool_call_hint: finalHint ?? null,
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
   * Save or update the user's persistent memory notes.
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

  /**
   * Get total message count for the current user this week.
   */
  async getWeeklyMessageCount(userId: string): Promise<number> {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);

      const { count, error } = await supabase
        .from('chat_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'user')
        .gte('created_at', weekStart.toISOString());

      if (error) throw error;
      return count ?? 0;
    } catch (err: any) {
      console.warn('[ChatService] getWeeklyMessageCount network error:', err?.message || err);
      return 0;
    }
  },

  /**
   * Mock AI response for development when Edge Functions aren't deployed.
   */
  async mockAIResponse(userId: string, chatId: string, userMessage: string): Promise<ChatMessage> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const responses = [
      "That's a great question! During this stage of pregnancy, it's important to stay hydrated and get plenty of rest. Would you like specific nutrition tips for your current week?",
      "I understand your concern. This is quite common during pregnancy. I'd recommend discussing this with your healthcare provider at your next visit. In the meantime, here are some general tips that might help...",
      "Great job tracking your health! Based on your current week, your baby is growing rapidly. Make sure you're getting enough folic acid and iron. Would you like me to suggest some meal ideas?",
      "Morning sickness can be tough, but it usually improves after the first trimester. Try eating small, frequent meals and keeping crackers by your bedside. Ginger tea can also help!",
      "That's wonderful that you're staying active! Light exercise like walking and prenatal yoga are great during pregnancy. Just remember to listen to your body and stay hydrated. 💪",
    ];

    const aiContent = responses[Math.floor(Math.random() * responses.length)];

    let resultMsg: ChatMessage = {
      id: `mock-${Date.now()}`,
      user_id: userId,
      chat_id: chatId,
      role: 'assistant',
      content: aiContent,
      image_url: null,
      created_at: new Date().toISOString(),
    };

    // Persist the mock AI response
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          user_id: userId,
          chat_id: chatId,
          role: 'assistant' as const,
          content: aiContent,
          image_url: null,
        })
        .select()
        .single();

      if (!error && data) {
        resultMsg = data;
      }
    } catch (err) {
      // ignore remote error
    }

    await this.saveLocalMessage(chatId, resultMsg);
    return resultMsg;
  },
};
