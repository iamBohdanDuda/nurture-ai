import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders, gemini, getCaller, json } from '../_shared/auth.ts';

const MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-3.1-flash-lite';
const MAX_IMAGE_BASE64 = 8_000_000; // ~6 MB JPEG

const SYSTEM_PROMPT = `You are an expert nutritionist for pregnant women. Estimate the calories and macronutrients of the meal in the image, name it, and write a concise, friendly description for pregnancy nutrition tracking.
Then judge pregnancy safety. Set is_pregnancy_safe to false if the meal likely contains any of:
- listeria risks: soft or unpasteurized cheese (brie, camembert, blue, feta unless pasteurized), unpasteurized milk or juice, deli/cold cuts, refrigerated smoked fish, pâté
- raw or undercooked fish, shellfish, meat, poultry or eggs (sushi/sashimi, rare steak, runny eggs, raw cookie dough)
- high-mercury fish (shark, swordfish, king mackerel, tilefish, bigeye tuna)
- alcohol, or clearly excessive caffeine
safety_analysis must name the specific concern, or briefly confirm why the meal is fine. If the image shows no food, set is_food to false.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    is_food: { type: 'BOOLEAN' },
    meal_name: { type: 'STRING' },
    calories: { type: 'INTEGER' },
    description: { type: 'STRING' },
    macros: {
      type: 'OBJECT',
      properties: { protein: { type: 'NUMBER' }, carbs: { type: 'NUMBER' }, fat: { type: 'NUMBER' } },
      required: ['protein', 'carbs', 'fat'],
    },
    is_pregnancy_safe: { type: 'BOOLEAN' },
    safety_analysis: { type: 'STRING' },
  },
  required: ['is_food', 'meal_name', 'calories', 'description', 'macros', 'is_pregnancy_safe', 'safety_analysis'],
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const caller = await getCaller(req);
    if (!caller) return json({ error: 'Unauthorized' }, 401);

    const { image_base64 } = await req.json();
    if (typeof image_base64 !== 'string' || !image_base64) return json({ error: 'Missing image_base64' }, 400);
    if (image_base64.length > MAX_IMAGE_BASE64) return json({ error: 'Image too large' }, 413);

    const data = await gemini(MODEL, {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Analyze this meal.' }, { inlineData: { mimeType: 'image/jpeg', data: image_base64 } }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const rawText = data.candidates?.[0]?.content?.parts?.find((p: { text?: string }) => p.text)?.text;
    if (!rawText) throw new Error('No text returned from Gemini');
    const result = JSON.parse(rawText);
    if (!result.is_food) return json({ error: "That doesn't look like a meal. Try another photo." }, 422);

    return json(result);
  } catch (err) {
    console.error('meal-scanner error:', err);
    return json({ error: 'Could not analyze the meal' }, 502);
  }
});
