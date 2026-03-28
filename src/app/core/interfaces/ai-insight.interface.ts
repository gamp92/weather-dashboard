import { InjectionToken } from '@angular/core';

// ── Domain model ──────────────────────────────────────────────────────────────

export interface WeatherInsight {
  readonly summary: string;
  readonly outfitSuggestions: readonly string[];
  readonly activitySuggestions: readonly string[];
}

export interface WeatherInsightState {
  readonly insight: WeatherInsight | null;
  readonly loading: boolean;
  readonly error: string | null;
}

// ── AI provider configuration ─────────────────────────────────────────────────
// Provide AI_CONFIG in app.config.ts with your backend endpoint.
// The API key lives server-side (Vercel env var) — never in the client bundle.

export interface AiConfig {
  readonly endpoint: string;
}

export const AI_CONFIG = new InjectionToken<AiConfig>('AI_CONFIG');

// ── Backend request / response types ─────────────────────────────────────────

export interface InsightRequest {
  readonly prompt: string;
}

export interface InsightResponse {
  readonly text: string;
}
