// ── Security: prompt injection prevention ────────────────────────────────────
// All values passed to the AI prompt are either:
//   • numeric (validated with safeNum before interpolation), or
//   • from a fixed lookup table (getWeatherLabel), or
//   • the location string (stripped to safe chars and capped at MAX_LOC_LEN).
// No raw user input or API string fields ever reach the prompt unguarded.

import { WeatherData } from '../../core/interfaces/weather.interface';
import { WeatherInsight } from '../../core/interfaces/ai-insight.interface';
import { getWeatherLabel } from './weather-code.util';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_LOC_LEN = 50;
const MAX_SUMMARY_LEN = 300;
const MAX_CHIP_LEN = 40;
const MAX_CHIPS = 5;
// Allow only printable location chars; strip anything that could alter the prompt
const UNSAFE_LOC = /[^-a-zA-Z0-9 ,'']/g;

// ── Location sanitizer ────────────────────────────────────────────────────────

export const sanitizeLocationForPrompt = (loc: string): string =>
  loc.replace(UNSAFE_LOC, '').slice(0, MAX_LOC_LEN).trim();

// ── Number guard (defence against a compromised upstream API) ─────────────────

const safeNum = (n: number): string =>
  String(Number.isFinite(n) && Math.abs(n) < 10_000 ? Math.round(n) : 0);

// ── Prompt sections ───────────────────────────────────────────────────────────

const buildCurrentSection = (w: WeatherData): string =>
  `${safeNum(w.current.temperature)}°C (feels ${safeNum(w.current.feelsLike)}°C), ` +
  `${getWeatherLabel(w.current.weatherCode)}, ` +
  `humidity ${safeNum(w.current.humidity)}%, wind ${safeNum(w.current.windSpeed)} km/h`;

const buildDayLine = (w: WeatherData, i: number): string =>
  `Day ${String(i + 1)}: ${safeNum(w.daily.temperatureMax[i])}/${safeNum(w.daily.temperatureMin[i])}°C` +
  `, ${getWeatherLabel(w.daily.weatherCode[i])}`;

const buildForecast = (w: WeatherData): string =>
  [0, 1, 2].map(i => buildDayLine(w, i)).join('; ');

// ── Public prompt builder ─────────────────────────────────────────────────────

const RESPONSE_SCHEMA =
  '{"summary":"2-3 sentences, max 80 words",' +
  '"outfit":["item1","item2","item3"],"activities":["act1","act2"]}';

export const buildWeatherPrompt = (location: string, weather: WeatherData): string => {
  const loc = sanitizeLocationForPrompt(location);
  return (
    `You are a weather assistant. Location: ${loc}.\n` +
    `Now: ${buildCurrentSection(weather)}\n` +
    `Next 3 days: ${buildForecast(weather)}\n\n` +
    `Reply with ONLY valid JSON — no other text before or after:\n` +
    RESPONSE_SCHEMA
  );
};

// ── Response parser ───────────────────────────────────────────────────────────
// Validates and sanitizes every field from the AI response before it enters
// the application state. Treats the AI output as untrusted input.

interface RawInsight {
  readonly summary?: unknown;
  readonly outfit?: unknown;
  readonly activities?: unknown;
}

const safeStr = (v: unknown, maxLen: number): string => {
  if (typeof v !== 'string') return '';
  return v.slice(0, maxLen).trim();
};

const safeStrArr = (v: unknown): readonly string[] => {
  if (!Array.isArray(v)) return [];
  return (v as unknown[])
    .slice(0, MAX_CHIPS)
    .map(item => safeStr(item, MAX_CHIP_LEN))
    .filter(s => s.length > 0);
};

const extractJson = (text: string): string => {
  const match = /\{[\s\S]*\}/.exec(text);
  return match?.[0] ?? '';
};

const buildInsight = (raw: RawInsight): WeatherInsight | null => {
  const summary = safeStr(raw.summary, MAX_SUMMARY_LEN);
  if (!summary) return null;
  return {
    summary,
    outfitSuggestions: safeStrArr(raw.outfit),
    activitySuggestions: safeStrArr(raw.activities),
  };
};

export const parseInsightResponse = (text: string): WeatherInsight | null => {
  const json = extractJson(text);
  if (!json) return null;
  try {
    return buildInsight(JSON.parse(json) as RawInsight);
  } catch {
    return null;
  }
};
