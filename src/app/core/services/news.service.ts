import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { NEWS_CONFIG, NewsArticle, NewsResponse, NewsState } from '../interfaces/news.interface';
import { sanitizeError } from '../../shared/utils/error-sanitizer.util';

interface NewsTrigger {
  readonly endpoint: string;
  readonly location: string;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(NEWS_CONFIG, { optional: true });
  private readonly trigger = new Subject<NewsTrigger>();
  private readonly state = signal<NewsState>({ articles: [], loading: false, error: null });

  readonly articles = computed(() => this.state().articles);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    this.trigger.pipe(
      switchMap(req => this.fetchNews(req)),
      takeUntilDestroyed(),
    ).subscribe(articles => { this.onSuccess(articles); });
  }

  loadForLocation(location: string): void {
    const endpoint = this.config?.endpoint;
    if (!endpoint) return;
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.trigger.next({ endpoint, location });
  }

  private fetchNews(req: NewsTrigger): Observable<readonly NewsArticle[]> {
    return this.http
      .get<NewsResponse>(`${req.endpoint}?location=${encodeURIComponent(req.location)}`)
      .pipe(
        map(r => r.articles),
        catchError((e: Error) => { this.onError(e); return EMPTY; }),
      );
  }

  private onSuccess(articles: readonly NewsArticle[]): void {
    this.state.set({ articles, loading: false, error: null });
  }

  private onError(e: Error): void {
    this.state.update(s => ({ ...s, loading: false, error: sanitizeError(e.message) }));
  }
}
