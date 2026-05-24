import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { AI_CONFIG } from './core/interfaces/ai-insight.interface';
import { NEWS_CONFIG } from './core/interfaces/news.interface';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: AI_CONFIG, useValue: { endpoint: '/api/insight' } },
    { provide: NEWS_CONFIG, useValue: { endpoint: '/api/news' } },
  ],
};
