import type { VercelRequest, VercelResponse } from '@vercel/node';

// ── Groq response types (OpenAI-compatible) ───────────────────────────────────

interface GroqMessage { readonly content: string; }
interface GroqChoice { readonly message: GroqMessage; }
interface GroqResponse { readonly choices: readonly GroqChoice[]; }

// ── Request validation ────────────────────────────────────────────────────────

interface InsightRequest { readonly prompt: string; }

const MAX_PROMPT_LEN = 2000;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const isValidBody = (body: unknown): body is InsightRequest => {
  if (typeof body !== 'object' || body === null) return false;
  const { prompt } = body as Record<string, unknown>;
  return typeof prompt === 'string' && prompt.length > 0 && prompt.length <= MAX_PROMPT_LEN;
};

// ── Groq call ─────────────────────────────────────────────────────────────────

const fetchGroq = async (prompt: string, apiKey: string): Promise<string> => {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], max_tokens: 256 }),
  });
  if (!res.ok) throw new Error(`Groq: ${res.status}`);
  const data = await res.json() as GroqResponse;
  return data.choices?.[0]?.message?.content ?? '';
};

// ── Handler ───────────────────────────────────────────────────────────────────

const sendError = (res: VercelResponse, status: number, message: string): void => {
  res.status(status).json({ error: message });
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') return void sendError(res, 405, 'Method not allowed');
  const apiKey = process.env['GROQ_API_KEY'];
  if (!apiKey) return void sendError(res, 500, 'AI service not configured');
  if (!isValidBody(req.body)) return void sendError(res, 400, 'Invalid request');
  try {
    const text = await fetchGroq(req.body.prompt, apiKey);
    res.status(200).json({ text });
  } catch {
    sendError(res, 502, 'AI provider error');
  }
}
