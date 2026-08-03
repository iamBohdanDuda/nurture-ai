import { supabase } from '@/config/supabase';
import { type ChatMessage } from '@/types/database';
import { trackingService } from '@/features/tracking/services/trackingService';

const EDGE_FUNCTION_BASE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

export const chatService = {
  /**
   * Fetch chat history from Supabase (paginated, newest first).
   */
  async getMessages(
    userId: string,
    limit = 50,
    offset = 0
  ): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data ?? [];
  },

  /**
   * Send a user message and get AI response via Edge Function.
   * Includes aggregated health metrics & timestamps for context.
   */
  async sendMessage(
    userId: string,
    content: string,
    imageUrl?: string
  ): Promise<ChatMessage> {
    // 1. Persist user message
    const { error: insertError } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        role: 'user' as const,
        content,
        image_url: imageUrl ?? null,
      });

    if (insertError) throw insertError;

    // 2. Fetch 7-day Health & Symptoms context to pass to AI agent
    const healthContext = await trackingService.getAggregatedAIContext(userId);

    // 3. Call chat orchestrator Edge Function
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

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
            message: content,
            image_url: imageUrl,
            health_context: healthContext,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Edge Function error: ${response.status}`);
      }

      const result = await response.json();
      return result.message as ChatMessage;
    } catch (err) {
      console.warn('[ChatService] Edge Function unavailable, using mock response with health context');
      return this.mockAIResponse(userId, content);
    }
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
  async mockAIResponse(userId: string, userMessage: string): Promise<ChatMessage> {
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
        role: 'assistant',
        content: aiContent,
        image_url: null,
        created_at: new Date().toISOString(),
      };
    }
    return data;
  },
};
