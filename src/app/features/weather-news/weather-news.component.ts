import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NewsArticle } from '../../core/interfaces/news.interface';

@Component({
  selector: 'app-weather-news',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './weather-news.component.html',
  styleUrl: './weather-news.component.scss',
})
export class WeatherNewsComponent {
  private readonly _articles = signal<readonly NewsArticle[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  @Input() set articles(v: readonly NewsArticle[]) { this._articles.set(v); }
  @Input() set loading(v: boolean) { this._loading.set(v); }
  @Input() set error(v: string | null) { this._error.set(v); }

  protected readonly articleList = computed(() => this._articles());
  protected readonly isLoading = computed(() => this._loading());
  protected readonly errorMsg = computed(() => this._error());
}
