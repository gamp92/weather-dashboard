import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GuardianArticle {
  readonly id: string;
  readonly webTitle: string;
  readonly webUrl: string;
  readonly webPublicationDate: string;
  readonly sectionName: string;
}

interface GuardianResponse {
  readonly response: {
    readonly results: readonly GuardianArticle[];
  };
}

interface NewsArticle {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly publishedAt: string;
  readonly section: string;
}

const GUARDIAN_URL = 'https://content.guardianapis.com/search';
const PAGE_SIZE = 5;
const MAX_LOCATION_LEN = 100;

const isValidLocation = (val: unknown): val is string =>
  typeof val === 'string' && val.length > 0 && val.length <= MAX_LOCATION_LEN;

const buildUrl = (location: string, apiKey: string): string => {
  const params = new URLSearchParams({
    q: `weather OR climate AND "${location}"`,
    section: 'environment',
    'order-by': 'newest',
    'page-size': String(PAGE_SIZE),
    'api-key': apiKey,
  });
  return `${GUARDIAN_URL}?${params}`;
};

const mapArticle = (a: GuardianArticle): NewsArticle => ({
  id: a.id,
  title: a.webTitle,
  url: a.webUrl,
  publishedAt: a.webPublicationDate,
  section: a.sectionName,
});

const fetchArticles = async (location: string, apiKey: string): Promise<readonly NewsArticle[]> => {
  const res = await fetch(buildUrl(location, apiKey));
  if (!res.ok) throw new Error(`Guardian: ${res.status}`);
  const data = await res.json() as GuardianResponse;
  return (data.response?.results ?? []).map(mapArticle);
};

const sendError = (res: VercelResponse, status: number, message: string): void => {
  res.status(status).json({ error: message });
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') return void sendError(res, 405, 'Method not allowed');
  const apiKey = process.env['GUARDIAN_API_KEY'];
  if (!apiKey) return void sendError(res, 500, 'News service not configured');
  const location = req.query['location'];
  if (!isValidLocation(location)) return void sendError(res, 400, 'Invalid request');
  try {
    const articles = await fetchArticles(location, apiKey);
    res.status(200).json({ articles });
  } catch {
    sendError(res, 502, 'News provider error');
  }
}
