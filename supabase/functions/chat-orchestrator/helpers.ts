// Pure helpers for chat-orchestrator (no Deno globals, so helpers.test.ts runs under Deno or Node).

const EXTRA_MODELS: Record<string, string[]> = {
  groq: ['openai/gpt-oss-120b'],
  openai: ['gpt-4o-mini'],
};

/** Clients pick from an allowlist only; anything else falls back to the default Gemini model. */
export function pickModel(
  provider: unknown,
  model: unknown,
  defaultGemini: string,
  configured: Record<string, boolean>
): { provider: string; model: string } {
  const allowed = typeof provider === 'string' && configured[provider] ? EXTRA_MODELS[provider] : undefined;
  if (!allowed) return { provider: 'gemini', model: defaultGemini };
  return { provider: provider as string, model: allowed.includes(model as string) ? (model as string) : allowed[0] };
}

export const MEMORY_SECTIONS = ['Profile', 'Medical & Safety', 'Preferences & Lifestyle', 'Ongoing Symptoms'];
const MEMORY_PLACEHOLDERS = ['', 'No history yet.', 'No notes recorded yet.'];

/**
 * Appends one bullet under `## section`, optionally dropping the first bullet that
 * contains `replaces`. Append-only by design: one bad model call can't wipe the notes.
 */
export function addFact(notes: string, section: string, fact: string, replaces?: string): string {
  const lines = MEMORY_PLACEHOLDERS.includes(notes.trim()) ? [] : notes.trim().split('\n');

  if (replaces?.trim()) {
    const i = lines.findIndex((l) => l.trim().startsWith('-') && l.includes(replaces.trim()));
    if (i >= 0) lines.splice(i, 1);
  }

  const header = `## ${section}`;
  let h = lines.findIndex((l) => l.trim().toLowerCase() === header.toLowerCase());
  if (h < 0) {
    if (lines.length) lines.push('');
    lines.push(header);
    h = lines.length - 1;
  }
  let end = h + 1;
  while (end < lines.length && !lines[end].startsWith('## ')) end++;
  while (end > h + 1 && lines[end - 1].trim() === '') end--;
  lines.splice(end, 0, `- ${fact.trim()}`);
  return lines.join('\n');
}

// ponytail: keyword heuristic, so negations ("no bleeding") also trigger it. Over-warning
// is the safe failure here; swap for an LLM classifier if false positives annoy users.
const RED_FLAGS = [
  /bleed/,
  /blurr(y|ed) vision|vision (change|problem)|seeing (spots|stars|flashes)/,
  /severe headache|worst headache/,
  /(baby|she|he)('s| is)? (not|isn'?t|stopped|hasn'?t been) (moving|kicking)|(less|fewer|reduced|no|decreased) (fetal )?(movement|kicks)/,
  /water (broke|has broken)|leaking (fluid|water)|gush of fluid/,
  /fever|high temperature/,
  /severe (abdominal|stomach|belly|pelvic) pain|severe pain/,
  /chest pain|can'?t breathe|short(ness)? of breath|trouble breathing/,
  /faint(ed|ing)?|passed out|seizure/,
  /sudden swelling|swollen (face|hands)/,
  /suicid|kill myself|hurt myself|self[- ]harm|end my life|harm (my|the) baby/,
];

export function isUrgent(text: string): boolean {
  const t = text.toLowerCase();
  return RED_FLAGS.some((re) => re.test(t));
}

export const URGENT_NOTICE =
  '⚠️ **What you describe can be a warning sign in pregnancy. Please contact your healthcare provider now, or call your local emergency number if it feels severe.**';
