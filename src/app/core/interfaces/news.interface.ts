import { InjectionToken } from '@angular/core';

export interface NewsArticle {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly publishedAt: string;
  readonly section: string;
}

export interface NewsState {
  readonly articles: readonly NewsArticle[];
  readonly loading: boolean;
  readonly error: string | null;
}

export interface NewsConfig {
  readonly endpoint: string;
}

export const NEWS_CONFIG = new InjectionToken<NewsConfig>('NEWS_CONFIG');

export interface NewsResponse {
  readonly articles: readonly NewsArticle[];
}
