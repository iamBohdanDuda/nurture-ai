import { supabase } from '@/config/supabase';
import { type ChatMessage, type ChatSession } from '@/types/database';
import { trackingService } from '@/features/tracking/services/trackingService';

const EDGE_FUNCTION_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

export const chatService = {
  async getChats(userId: string): Promise<ChatSession[]> {
    console.log(`[DB: chatService] SELECT from chats (user: ${userId})`);
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[ChatService] getChats notice:', error.message);
      return [];
    }
    return data ?? [];
  },

  async createChat(userId: string, title: string): Promise<ChatSession> {
    console.log(`[DB: chatService] INSERT into chats (user: ${userId}, title: ${title})`);
    const { data, error } = await supabase
      .from('chats')
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch chat history from Supabase (paginated, newest first).
   */
  async getMessages(
    userId: string,
    chatId: string | null,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    let query = supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId);
      
    if (chatId) {
      query = query.eq('chat_id', chatId);
    } else {
      query = query.is('chat_id', null);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.warn('[ChatService] getMessages notice:', error.message);
      return [];
    }
    return data ?? [];
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

    // 1. Persist user message (non-blocking)
    console.log(`[DB: chatService] INSERT user message into chat_history (chatId: ${chatId})`);
    supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        chat_id: chatId,
        role: 'user' as const,
        content,
        image_url: imageUrl ?? null,
      })
      .then(({ error }) => {
        if (error) console.warn('[ChatService] Supabase user message insert notice:', error.message);
      });

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

    // 3. Try Edge Function first, then direct Gemini fallback
    const localGeminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

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

    // Try direct Gemini API
    if (localGeminiKey) {
      console.log('[ChatService] Trying direct Gemini API with model:', model);
      try {
        const directResult = await this.callGeminiDirect(userId, formattedMessages, healthContext, model, localGeminiKey);
        console.log('[ChatService] Gemini direct reply received, length:', directResult.text.length, 'toolHint:', directResult.toolCallHint);
        return await this.saveAndReturnAIResponse(userId, chatId, directResult.text, directResult.toolCallHint);
      } catch (directErr: any) {
        console.warn('[ChatService] Direct Gemini API call failed:', directErr?.message || directErr);
      }
    } else {
      console.warn('[ChatService] No Gemini API key available. Set EXPO_PUBLIC_GEMINI_API_KEY in .env');
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
    model: string,
    apiKey: string
  ): Promise<{ text: string; toolCallHint?: string }> {
    const targetDefault = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const geminiModel = !model || model === 'gemini-2.5-pro' ? targetDefault : model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
    const baseSystemPrompt = `You are NurtureAI, an expert, empathetic, and medically-accurate pregnancy assistant. You offer supportive advice based on standard prenatal guidelines. You do not replace a doctor. Always end medical advice with a disclaimer to consult a healthcare provider if symptoms are severe. Do not greet the user if the last message in the chat history was sent today. Keep your messages concise, not overly detailed and long.${healthContext ? '\n\nRecent Health Context:\n' + (typeof healthContext === 'string' ? healthContext : JSON.stringify(healthContext)) : ''}`;

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
      const targetDate = args.date || new Date().toISOString().split('T')[0];
      const hint = `Checked health logs for ${targetDate}`;
      console.log('[ChatService] Tool call detected:', callName, 'args:', args);

      let toolResultData: any = {};
      
      console.log(`\n======================================================`);
      console.log(`[TOOL CALL EXECUTION]`);
      console.log(`Tool Name: ${callName}`);
      console.log(`Arguments:`, JSON.stringify(args, null, 2));
      console.log(`======================================================\n`);

      if (callName === 'get_health_data_by_date') {
        try {
          toolResultData = await trackingService.getHealthDataForDate(userId, targetDate);
          console.log('[ChatService] Tool result fetched, keys:', Object.keys(toolResultData));
        } catch (toolErr: any) {
          console.warn('[ChatService] Tool execution failed:', toolErr?.message);
          toolResultData = { error: 'Could not fetch health data', date: targetDate };
        }
      } else if (callName === 'get_recent_health_logs') {
        try {
          const logType = args.log_type || 'kicks';
          const limit = args.limit || 3;
          const sortBy = args.sort_by || 'newest';
          toolResultData = await trackingService.getRecentHealthLogs(userId, logType, limit, sortBy);
          console.log(`[ChatService] get_recent_health_logs fetched ${toolResultData?.logs?.length || 0} logs for ${logType}`);
        } catch (toolErr: any) {
          console.warn('[ChatService] get_recent_health_logs failed:', toolErr?.message);
          toolResultData = { error: 'Could not fetch recent logs' };
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
            { role: 'user', parts: [{ text: `\n\nHere is the health data for ${targetDate}: ${JSON.stringify(toolResultData)}` }] }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
        };
        const retryRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(retryPayload)
        });
        const retryData = await retryRes.json();
        const retryText = retryData.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
        if (retryText) {
          console.log('[ChatService] Retry without tools succeeded');
          return { text: retryText, toolCallHint: hint };
        }
        throw new Error(`Gemini Tool Error and retry failed: ${secondData.error.message || JSON.stringify(secondData.error)}`);
      }

      // Extract text from any part (not just index 0)
      const secondText = secondData.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
      if (secondText) {
        console.log('[ChatService] Tool call flow completed successfully');
        return { text: secondText, toolCallHint: hint };
      }
      console.warn('[ChatService] Turn 2 had no text in parts:', JSON.stringify(secondData.candidates?.[0]?.content?.parts).substring(0, 300));
    }

    // Extract text from the first response (non-tool-call path)
    const text = candidate?.content?.parts?.find((p: any) => p.text)?.text;
    if (!text) {
      console.warn('[ChatService] No text in Gemini response parts:', JSON.stringify(candidate?.content?.parts).substring(0, 300));
      throw new Error('No text returned from Gemini API');
    }
    console.log('[ChatService] Direct text response received');
    return { text };
  },

  /**
   * Save AI response to DB and return ChatMessage object with toolCallHint.
   */
  async saveAndReturnAIResponse(userId: string, chatId: string, content: string, toolCallHint?: string): Promise<ChatMessage> {
    console.log(`[DB: chatService] INSERT AI message into chat_history (chatId: ${chatId}, toolHint: ${toolCallHint || 'none'})`);
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

    if (error) {
      return {
        id: `gemini-${Date.now()}`,
        user_id: userId,
        chat_id: chatId,
        role: 'assistant',
        content,
        image_url: null,
        tool_call_hint: toolCallHint ?? null,
        created_at: new Date().toISOString(),
      };
    }
    return data;
  },

  /**
   * Get the user's condensed memory markdown.
   */
  async getUserMemory(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('user_memory')
      .select('markdown_summary')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('[ChatService] Could not fetch user memory:', error.message);
      return 'No history yet.';
    }
    return data?.markdown_summary ?? 'No history yet.';
  },

  /**
   * Get total message count for the current user this week.
   */
  async getWeeklyMessageCount(userId: string): Promise<number> {
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

    // Persist the mock AI response
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

    if (error) {
      // Return a local mock if DB insert fails too
      return {
        id: `mock-${Date.now()}`,
        user_id: userId,
        chat_id: chatId,
        role: 'assistant',
        content: aiContent,
        image_url: null,
        created_at: new Date().toISOString(),
      };
    }
    return data;
  },
};
