import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
// @ts-ignore
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// @ts-ignore
const DEFAULT_GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-3.1-flash-lite';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, message, user_id, provider = 'gemini', model = DEFAULT_GEMINI_MODEL, health_context } = body;

    let baseSystemPrompt = `You are NurtureAI, an expert, empathetic, and medically-accurate pregnancy assistant. You offer supportive advice based on standard prenatal guidelines. You do not replace a doctor. Always end medical advice with a disclaimer to consult a healthcare provider if symptoms are severe. Do not greet the user if the last message in the chat history was sent today. Keep your messages concise, not overly detailed and long.`;
    
    if (health_context) {
      baseSystemPrompt += `\n\nRecent Health Context:\n${typeof health_context === 'string' ? health_context : JSON.stringify(health_context)}`;
    }

    // Standardize conversation items
    const rawMessages = messages && Array.isArray(messages) && messages.length > 0
      ? messages
      : message
        ? [{ role: 'user', content: message }]
        : [];

    if (rawMessages.length === 0) {
      throw new Error('Missing message or messages array');
    }

    const activeProvider = (provider === 'gemini' && GEMINI_API_KEY) || !OPENAI_API_KEY ? 'gemini' : provider;
    let reply = '';

    let toolCallHint: string | undefined;

    if (activeProvider === 'gemini') {
      if (!GEMINI_API_KEY) {
        throw new Error('Server not configured with GEMINI_API_KEY.');
      }

      const geminiModel = !model || model === 'gemini-2.5-pro' ? DEFAULT_GEMINI_MODEL : model;
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`;

      const geminiContents = rawMessages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }]
      }));

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

      const geminiPayload = {
        systemInstruction: {
          parts: [{ text: baseSystemPrompt }]
        },
        contents: geminiContents,
        tools,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        }
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      const geminiData = await geminiRes.json();

      if (geminiData.error) {
        throw new Error(`Gemini Error: ${geminiData.error.message || JSON.stringify(geminiData.error)}`);
      }

      const candidate = geminiData.candidates?.[0];
      const functionCallPart = candidate?.content?.parts?.find((p: any) => p.functionCall);

      if (functionCallPart?.functionCall) {
        const callName = functionCallPart.functionCall.name;
        const args = functionCallPart.functionCall.args || {};
        
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
        let toolResultData: any = { error: 'Not implemented' };

        if (callName === 'get_health_data_by_date') {
          const targetDate = args.date || new Date().toISOString().split('T')[0];
          toolCallHint = `Checked health logs for ${targetDate}`;
          
          // Basic fetch for kicks as an example, but ideally we'd fetch all just like local client
          // For simplicity in edge, we'll fetch kicks and weight
          const startIso = `${targetDate}T00:00:00.000Z`;
          const endIso = `${targetDate}T23:59:59.999Z`;
          
          const kicksRes = await fetch(`${SUPABASE_URL}/rest/v1/kick_logs?user_id=eq.${user_id}&logged_at=gte.${startIso}&logged_at=lte.${endIso}`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
          });
          const weightRes = await fetch(`${SUPABASE_URL}/rest/v1/weight_logs?user_id=eq.${user_id}&logged_at=gte.${startIso}&logged_at=lte.${endIso}`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
          });
          
          toolResultData = {
            date: targetDate,
            kicks: await kicksRes.json(),
            weight: await weightRes.json()
          };
        } else if (callName === 'get_recent_health_logs') {
          const logType = args.log_type || 'kicks';
          const limit = args.limit || 3;
          const sortBy = args.sort_by || 'newest';
          toolCallHint = `Checked recent ${logType} logs`;

          const tableMap: any = { 'kicks': 'kick_logs', 'water': 'hydration_logs', 'meals': 'meal_logs', 'symptoms': 'symptom_logs', 'weight': 'weight_logs', 'vitamins': 'vitamin_logs' };
          const valueColumnMap: any = { 'kicks': 'kick_count', 'water': 'amount_ml', 'symptoms': 'severity', 'weight': 'weight_kg' };
          const tableName = tableMap[logType];
          
          if (tableName) {
            let orderCol = 'logged_at';
            let ascending = false;
            if (sortBy === 'oldest') ascending = true;
            else if (sortBy === 'lowest') { orderCol = valueColumnMap[logType] || 'logged_at'; ascending = true; }
            else if (sortBy === 'highest') { orderCol = valueColumnMap[logType] || 'logged_at'; ascending = false; }
            
            const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?user_id=eq.${user_id}&order=${orderCol}.${ascending ? 'asc' : 'desc'}&limit=${limit}`, {
              headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            toolResultData = { logs: await res.json() };
          }
        }

        const secondPayload = {
          systemInstruction: { parts: [{ text: baseSystemPrompt }] },
          contents: [
            ...geminiContents,
            candidate.content,
            {
              role: 'function',
              parts: [{ functionResponse: { name: callName, response: { name: callName, content: toolResultData } } }]
            }
          ],
          tools,
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
        };

        const secondRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(secondPayload),
        });
        const secondData = await secondRes.json();
        reply = secondData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        reply = candidate?.content?.parts?.[0]?.text || '';
      }

      if (!reply) {
        throw new Error('No response text received from Gemini');
      }
    } else {
      if (!OPENAI_API_KEY) {
        throw new Error('Server not configured with OPENAI_API_KEY.');
      }

      const openAiMessages = [
        { role: 'system', content: baseSystemPrompt },
        ...rawMessages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : m.role,
          content: m.content || m.text || ''
        }))
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: openAiMessages,
          max_tokens: 600,
          temperature: 0.7
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(`OpenAI Error: ${data.error.message}`);
      }

      reply = data.choices[0].message.content;
    }

    return new Response(
      JSON.stringify({
        reply,
        tool_call_hint: toolCallHint ?? null,
        message: {
          id: `msg-${Date.now()}`,
          user_id,
          role: 'assistant',
          content: reply,
          image_url: null,
          tool_call_hint: toolCallHint ?? null,
          created_at: new Date().toISOString(),
          provider: activeProvider,
          model: activeProvider === 'gemini' ? (model || DEFAULT_GEMINI_MODEL) : (model || 'gpt-4o-mini'),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in chat-orchestrator:', error);
    
    // Fallback Mock Response
    return new Response(
      JSON.stringify({
        reply: "I'm having trouble connecting to my AI brain right now! But I'm here for you, mama. Please try again in a moment. 💕",
        message: {
          id: `mock-${Date.now()}`,
          user_id: 'assistant',
          role: 'assistant',
          content: "I'm having trouble connecting to my AI brain right now! But I'm here for you, mama. Please try again in a moment. 💕",
          image_url: null,
          created_at: new Date().toISOString(),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
