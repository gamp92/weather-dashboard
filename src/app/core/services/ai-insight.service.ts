// NOTE: In production the endpoint in AiConfig should point to a backend proxy.
// Calling an AI provider directly from the browser exposes the API key in
// network requests. The architecture supports swapping the endpoint without
// any other code changes.

import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { WeatherData } from '../interfaces/weather.interface';
import {
  AI_CONFIG,
  AiConfig,
  AiRequestBody,
  AnthropicResponse,
  WeatherInsight,
  WeatherInsightState,
} from '../interfaces/ai-insight.interface';
import { buildWeatherPrompt, parseInsightResponse } from '../../shared/utils/ai-prompt.util';
import { sanitizeError } from '../../shared/utils/error-sanitizer.util';

const MAX_TOKENS = 256;

interface AiTrigger {
  readonly location: string;
  readonly weather: WeatherData;
  readonly config: AiConfig;
}

@Injectable({ providedIn: 'root' })
export class AiInsightService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AI_CONFIG, { optional: true });
  private readonly trigger = new Subject<AiTrigger>();
  private readonly state = signal<WeatherInsightState>({ insight: null, loading: false, error: null });

  readonly insight = computed(() => this.state().insight);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    this.trigger.pipe(
      switchMap(req => this.fetchInsight(req)),
      takeUntilDestroyed(),
    ).subscribe(insight => { this.onSuccess(insight); });
  }

  generate(location: string, weather: WeatherData): void {
    const config = this.config;
    if (!config?.apiKey) return;
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.trigger.next({ location, weather, config });
  }

  private buildHeaders(cfg: AiConfig): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01',
    });
  }

  private buildBody(cfg: AiConfig, req: AiTrigger): AiRequestBody {
    return {
      model: cfg.model,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: buildWeatherPrompt(req.location, req.weather) }],
    };
  }

  private parseResponse(r: AnthropicResponse): WeatherInsight | null {
    return parseInsightResponse(r.content[0]?.text ?? '');
  }

  private fetchInsight(req: AiTrigger): Observable<WeatherInsight | null> {
    return this.http
      .post<AnthropicResponse>(req.config.endpoint, this.buildBody(req.config, req), { headers: this.buildHeaders(req.config) })
      .pipe(
        map(r => this.parseResponse(r)),
        catchError((e: Error) => { this.onError(e); return EMPTY; }),
      );
  }

  private onSuccess(insight: WeatherInsight | null): void {
    const error = insight ? null : 'Could not generate an insight for this location.';
    this.state.set({ insight, loading: false, error });
  }

  private onError(e: Error): void {
    this.state.update(s => ({ ...s, loading: false, error: sanitizeError(e.message) }));
  }
}
