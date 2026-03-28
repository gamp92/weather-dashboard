import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { WeatherData } from '../interfaces/weather.interface';
import {
  AI_CONFIG,
  InsightRequest,
  InsightResponse,
  WeatherInsight,
  WeatherInsightState,
} from '../interfaces/ai-insight.interface';
import { buildWeatherPrompt, parseInsightResponse } from '../../shared/utils/ai-prompt.util';
import { sanitizeError } from '../../shared/utils/error-sanitizer.util';

interface AiTrigger {
  readonly endpoint: string;
  readonly location: string;
  readonly weather: WeatherData;
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
    const endpoint = this.config?.endpoint;
    if (!endpoint) return;
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.trigger.next({ endpoint, location, weather });
  }

  private buildBody(req: AiTrigger): InsightRequest {
    return { prompt: buildWeatherPrompt(req.location, req.weather) };
  }

  private fetchInsight(req: AiTrigger): Observable<WeatherInsight | null> {
    return this.http
      .post<InsightResponse>(req.endpoint, this.buildBody(req))
      .pipe(
        map(r => parseInsightResponse(r.text)),
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
