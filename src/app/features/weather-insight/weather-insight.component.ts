import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { WeatherInsight } from '../../core/interfaces/ai-insight.interface';

@Component({
  selector: 'app-weather-insight',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './weather-insight.component.html',
  styleUrl: './weather-insight.component.scss',
})
export class WeatherInsightComponent {
  private readonly _insight = signal<WeatherInsight | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  @Input() set insight(v: WeatherInsight | null) { this._insight.set(v); }
  @Input() set loading(v: boolean) { this._loading.set(v); }
  @Input() set error(v: string | null) { this._error.set(v); }

  protected readonly insightData = computed(() => this._insight());
  protected readonly isLoading = computed(() => this._loading());
  protected readonly errorMsg = computed(() => this._error());
}
