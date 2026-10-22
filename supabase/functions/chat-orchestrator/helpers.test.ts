// Run: `node supabase/functions/chat-orchestrator/helpers.test.ts` (or `deno run` it).
import assert from 'node:assert/strict';
import { addFact, isUrgent, pickModel } from './helpers.ts';

// Model allowlist
const configured = { groq: true, openai: false };
assert.deepEqual(pickModel('gemini', 'gemini-2.5-pro', 'flash', configured), { provider: 'gemini', model: 'flash' });
assert.deepEqual(pickModel('groq', 'llama-405b', 'flash', configured), { provider: 'groq', model: 'openai/gpt-oss-120b' });
assert.deepEqual(pickModel('openai', 'gpt-4o', 'flash', configured), { provider: 'gemini', model: 'flash' });
assert.deepEqual(pickModel('evil', 'x', 'flash', configured), { provider: 'gemini', model: 'flash' });

// Memory is append-only and section-aware
let notes = addFact('No history yet.', 'Profile', 'Due date 2027-03-01');
assert.equal(notes, '## Profile\n- Due date 2027-03-01');
notes = addFact(notes, 'Medical & Safety', 'Allergic to penicillin');
notes = addFact(notes, 'Profile', 'First pregnancy');
assert.equal(notes, '## Profile\n- Due date 2027-03-01\n- First pregnancy\n\n## Medical & Safety\n- Allergic to penicillin');
notes = addFact(notes, 'Profile', 'Due date 2027-03-08', 'Due date 2027-03-01');
assert.ok(!notes.includes('2027-03-01') && notes.includes('2027-03-08') && notes.includes('penicillin'));

// Red flags
assert.ok(isUrgent('I have some bleeding since this morning'));
assert.ok(isUrgent("The baby isn't moving as much, fewer kicks today"));
assert.ok(isUrgent('My water broke'));
assert.ok(!isUrgent('What fruit is good for the second trimester?'));

console.log('helpers ok');
