import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    const { messages, user_id } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Missing or invalid messages array');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('Server not configured with OPENAI_API_KEY.');
    }

    const systemPrompt = `You are NurtureAI, an expert, empathetic, and medically-accurate pregnant assistant. You offer supportive advice based on standard prenatal guidelines. You do not replace a doctor. Always end medical advice with a disclaimer to consult a healthcare provider if symptoms are severe. Keep your responses structured, warm, and easily readable.`;

    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAiMessages,
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OpenAI Error: ${data.error.message}`);
    }

    const reply = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-orchestrator:', error);
    
    // Fallback Mock Response
    return new Response(
      JSON.stringify({
        reply: "I'm having trouble connecting to my brain right now! But I'm here for you, mama. Please try again in a moment. 💕"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
