// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const DEFAULT_GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-3.1-flash-lite';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image_base64, provider = 'gemini', model = DEFAULT_GEMINI_MODEL } = await req.json();

    if (!image_base64) {
      throw new Error('Missing image_base64');
    }

    const activeProvider = (provider === 'gemini' && GEMINI_API_KEY) || !OPENAI_API_KEY ? 'gemini' : provider;
    let aiRes: { calories: number; description: string };

    if (activeProvider === 'gemini') {
      if (!GEMINI_API_KEY) {
        throw new Error('Server not configured with GEMINI_API_KEY.');
      }

      const geminiModel = model || DEFAULT_GEMINI_MODEL;
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`;

      const geminiPayload = {
        systemInstruction: {
          parts: [{ text: 'You are an expert nutritionist for pregnant women. Estimate the calories and macronutrients of the meal in the image, provide a name for the meal, and a concise, friendly description suitable for pregnancy nutrition tracking.' }]
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Analyze this meal. Respond ONLY with valid JSON: {"meal_name": "string", "calories": number, "description": "short text", "macros": {"protein": number, "carbs": number, "fat": number}}' },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: image_base64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
          responseMimeType: 'application/json'
        }
      };

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });

      const geminiData = await res.json();
      if (geminiData.error) {
        throw new Error(`Gemini Error: ${geminiData.error.message || JSON.stringify(geminiData.error)}`);
      }

      const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('No text returned from Gemini');

      aiRes = JSON.parse(rawText);
    } else {
      if (!OPENAI_API_KEY) {
        throw new Error('Server not configured with OPENAI_API_KEY.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert nutritionist for pregnant women. Estimate the calories and macronutrients of the meal in the image, provide a name for the meal, and a very short, specific description.',
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this meal. Provide response in strict JSON format: {"meal_name": "string", "calories": integer, "description": "short string", "macros": {"protein": integer, "carbs": integer, "fat": integer}}' },
                { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image_base64}` } },
              ],
            },
          ],
          max_tokens: 300,
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(`OpenAI Error: ${data.error.message}`);
      }

      aiRes = JSON.parse(data.choices[0].message.content);
    }

    return new Response(
      JSON.stringify(aiRes),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error in meal-scanner:', error);
    
    // Return error to client
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
