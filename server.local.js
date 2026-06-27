// Local dev server — proxies /api/insight to Groq using .env key.
// Usage: node server.local.js
// Run alongside: ng serve (proxy.conf.json forwards /api here)

const http = require('http');
const fs = require('fs');

const PORT = 3002;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GUARDIAN_URL = 'https://content.guardianapis.com/search';

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

const callGuardian = async (location, apiKey) => {
  const params = new URLSearchParams({
    q: `weather OR climate AND "${location}"`,
    section: 'environment',
    'order-by': 'newest',
    'page-size': '5',
    'api-key': apiKey,
  });
  const res = await fetch(`${GUARDIAN_URL}?${params}`);
  if (!res.ok) throw new Error(`Guardian ${res.status}`);
  const data = await res.json();
  return (data.response?.results ?? []).map(a => ({
    id: a.id,
    title: a.webTitle,
    url: a.webUrl,
    publishedAt: a.webPublicationDate,
    section: a.sectionName,
  }));
};

const handleNews = async (req, res) => {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey) return send(res, 500, { error: 'GUARDIAN_API_KEY not set in .env' });
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const location = url.searchParams.get('location');
  if (!location) return send(res, 400, { error: 'Invalid request' });
  const articles = await callGuardian(location, apiKey);
  send(res, 200, { articles });
};

loadEnv();

http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/insight') {
    return handleInsight(req, res).catch(err => { console.error('[insight]', err.message); send(res, 502, { error: 'AI provider error' }); });
  }
  if (req.method === 'GET' && req.url.startsWith('/api/news')) {
    return handleNews(req, res).catch(err => { console.error('[news]', err.message); send(res, 502, { error: 'News provider error' }); });
  }
  send(res, 404, { error: 'Not found' });
}).listen(PORT, () => console.log(`Local API server on http://localhost:${PORT}`));
