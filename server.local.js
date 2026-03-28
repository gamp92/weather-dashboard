// Local dev server — proxies /api/insight to Groq using .env key.
// Usage: node server.local.js
// Run alongside: ng serve (proxy.conf.json forwards /api here)

const http = require('http');
const fs = require('fs');

const PORT = 3002;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const loadEnv = () => {
  const lines = fs.readFileSync('.env', 'utf8').split('\n');
  lines.forEach(line => {
    const eq = line.indexOf('=');
    if (eq === -1) return;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  });
};

const readBody = req => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', chunk => { raw += chunk; });
  req.on('end', () => { try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid JSON')); } });
  req.on('error', reject);
});

const callGroq = async (prompt, apiKey) => {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], max_tokens: 256 }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq ${res.status}: ${detail}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
};

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
};

const handleInsight = async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return send(res, 500, { error: 'GROQ_API_KEY not set in .env' });
  const body = await readBody(req);
  if (!body?.prompt) return send(res, 400, { error: 'Invalid request' });
  const text = await callGroq(body.prompt, apiKey);
  send(res, 200, { text });
};

loadEnv();

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/insight') {
    return handleInsight(req, res).catch(err => { console.error('[insight]', err.message); send(res, 502, { error: 'AI provider error' }); });
  }
  send(res, 404, { error: 'Not found' });
}).listen(PORT, () => console.log(`Local API server on http://localhost:${PORT}`));
