import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
// @ts-ignore
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// @ts-ignore
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
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
    const { messages, message, user_id, provider = 'gemini', model = DEFAULT_GEMINI_MODEL, health_context, user_memory } = body;

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Pull user memory if not provided in payload
    let activeUserMemory = user_memory;
    if (!activeUserMemory && user_id && SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const memRes = await fetch(`${SUPABASE_URL}/rest/v1/user_memory?user_id=eq.${user_id}&select=markdown_summary`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const memData = await memRes.json();
        if (memData?.[0]?.markdown_summary) {
          activeUserMemory = memData[0].markdown_summary;
        }
      } catch (memErr) {
        console.warn('Could not fetch user memory from edge:', memErr);
      }
    }

    let baseSystemPrompt = `You are NurtureAI, an expert, empathetic, and medically-accurate pregnancy assistant. You offer supportive advice based on standard prenatal guidelines. You do not replace a doctor. Always end medical advice with a disclaimer to consult a healthcare provider if symptoms are severe. Do not greet the user if the last message in the chat history was sent today. Keep your messages concise, not overly detailed and long.`;
    
    const cleanMemory = activeUserMemory && activeUserMemory !== 'No history yet.' && activeUserMemory !== 'No notes recorded yet.'
      ? activeUserMemory.trim()
      : '';

    if (cleanMemory) {
      baseSystemPrompt += `\n\n[IMPORTANT USER NOTES & PERSISTENT MEMORY]:\n${cleanMemory}\nAlways respect and tailor your guidance around these known user facts (e.g. allergies, previous conditions, trimester/due date, preferences, symptoms, family context).`;
    } else {
      baseSystemPrompt += `\n\n[IMPORTANT USER NOTES & PERSISTENT MEMORY]:\nNo notes recorded yet.`;
    }

    baseSystemPrompt += `\n\n[MEMORY MANAGEMENT]:
You possess persistent memory across conversations. You MUST actively remember and update important notes about the user.
Whenever the user shares important personal information, asks you to remember something, or whenever you decide a detail is significant for maternal or fetal care—such as:
- Gestational age, due date, trimester, pregnancy milestones, singleton or multiples
- Medical history, chronic conditions, high-risk flags (e.g. preeclampsia, gestational diabetes, hypertension, thyroid)
- Allergies, medications, prenatal vitamins
- Dietary preferences or restrictions (e.g. vegan, gluten-free, foods that trigger nausea)
- Lifestyle, exercise routine, work environment, partner or family details, previous pregnancies/children
- Recurring symptoms, emotional well-being, birth plan wishes
- Any explicit request: "Remember that...", "Note that...", "I am...", "Don't forget..."

You SHOULD update these notes when you decide new information is important!
To update notes:
- If function/tool calling is supported, call the \`update_user_notes\` tool with the updated markdown summary of all notes.
- You can also format your update by including:
  <update_notes>
  ## User Profile
  - ...
  ## Medical & Safety
  - ...
  ## Preferences & Lifestyle
  - ...
  ## Ongoing Symptoms
  - ...
  </update_notes>
Always organize notes in clear markdown with bullet points. Merge new details into existing notes without erasing previously known important facts.`;

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

    const activeProvider = provider === 'groq'
      ? 'groq'
      : provider === 'openai' && OPENAI_API_KEY
      ? 'openai'
      : 'gemini';
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
        
        let toolResultData: any = { error: 'Not implemented' };

        if (callName === 'get_health_data_by_date') {
          const targetDate = args.date || new Date().toISOString().split('T')[0];
          toolCallHint = `Checked health logs for ${targetDate}`;
          
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
        } else if (callName === 'update_user_notes') {
          const updatedNotes = args.notes || '';
          toolCallHint = 'Updated memory notes';
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/user_memory`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
              },
              body: JSON.stringify({
                user_id,
                markdown_summary: updatedNotes,
                last_updated: new Date().toISOString()
              })
            });
            toolResultData = { status: 'success', message: 'User notes successfully updated in persistent memory.' };
          } catch (err: any) {
            toolResultData = { status: 'error', message: err?.message || 'Failed to update memory notes' };
          }
        } else if (callName === 'get_user_notes') {
          toolCallHint = 'Checked memory notes';
          try {
            const memRes = await fetch(`${SUPABASE_URL}/rest/v1/user_memory?user_id=eq.${user_id}&select=markdown_summary`, {
              headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
            });
            const memData = await memRes.json();
            toolResultData = { status: 'success', notes: memData?.[0]?.markdown_summary || 'No notes recorded yet.' };
          } catch (err: any) {
            toolResultData = { status: 'error', message: 'Failed to retrieve notes' };
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
    } else if (activeProvider === 'groq') {
      if (!GROQ_API_KEY) {
        throw new Error('Server not configured with GROQ_API_KEY.');
      }

      const groqMessages = [
        { role: 'system', content: baseSystemPrompt },
        ...rawMessages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : m.role,
          content: m.content || m.text || ''
        }))
      ];

      const groqModel = model || 'openai/gpt-oss-120b';
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          messages: groqMessages,
          max_tokens: 800,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(`Groq Error: ${data.error.message || JSON.stringify(data.error)}`);
      }

      reply = data.choices[0].message.content;
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

    // Tag fallback: detect and extract <update_notes> from reply
    const updateNotesMatch = reply.match(/<update_notes>([\s\S]*?)<\/update_notes>/i);
    if (updateNotesMatch) {
      const extractedNotes = updateNotesMatch[1].trim();
      reply = reply.replace(/<update_notes>[\s\S]*?<\/update_notes>/gi, '').trim();
      toolCallHint = 'Updated memory notes';
      if (user_id && SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/user_memory`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              user_id,
              markdown_summary: extractedNotes,
              last_updated: new Date().toISOString()
            })
          });
        } catch (memErr) {
          console.warn('Could not save extracted notes from edge:', memErr);
        }
      }
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
          model: activeProvider === 'gemini'
            ? (model || DEFAULT_GEMINI_MODEL)
            : activeProvider === 'groq'
            ? (model || 'openai/gpt-oss-120b')
            : (model || 'gpt-4o-mini'),
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
