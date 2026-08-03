// @ts-ignore
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image_base64 } = await req.json();

    if (!image_base64) {
      throw new Error('Missing image_base64');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('Server not configured with OPENAI_API_KEY. Using mock response.');
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert nutritionist for pregnant women. Estimate the calories of the meal in the image and provide a very short, specific description.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this meal. Provide response in strict JSON format: {"calories": integer, "description": "short string"}' },
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

    const aiRes = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify(aiRes),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Error in meal-scanner:', error);
    
    // Fallback Mock Response
    return new Response(
      JSON.stringify({
        calories: Math.floor(Math.random() * 300) + 200,
        description: `Error: ${error.message} - Fallback Mock Meal`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
