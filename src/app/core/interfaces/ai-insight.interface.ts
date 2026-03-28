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
// Provide AI_CONFIG in app.config.ts with your endpoint, key, and model.
// In production, endpoint should point to a backend proxy — never expose
// API keys in client-side bundles.

export interface AiConfig {
  readonly endpoint: string;
  readonly apiKey: string;
  // TODO: replace 'placeholder-model' with the chosen model identifier
  readonly model: string;
}

export const AI_CONFIG = new InjectionToken<AiConfig>('AI_CONFIG');

// ── Anthropic Messages API response types ─────────────────────────────────────

export interface AnthropicContentBlock {
  readonly type: string;
  readonly text?: string;
}

export interface AnthropicResponse {
  readonly content: readonly AnthropicContentBlock[];
}

// ── Internal request body ─────────────────────────────────────────────────────

export interface AiMessageEntry {
  readonly role: string;
  readonly content: string;
}

export interface AiRequestBody {
  readonly model: string;
  readonly max_tokens: number;
  readonly messages: readonly AiMessageEntry[];
}
