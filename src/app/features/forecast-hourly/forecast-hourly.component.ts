import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { HourlyForecast } from '../../core/interfaces/weather.interface';
import { ForecastHourItemComponent } from './forecast-hour-item/forecast-hour-item.component';
import { getNext24Hours } from '../../shared/utils/weather-forecast.util';

@Component({
  selector: 'app-forecast-hourly',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForecastHourItemComponent],
  templateUrl: './forecast-hourly.component.html',
  styleUrl: './forecast-hourly.component.scss',
})
export class ForecastHourlyComponent {
  private readonly _hourly = signal<HourlyForecast | null>(null);
  private readonly _currentTime = signal<string>('');

  @Input({ required: true }) set hourly(value: HourlyForecast) {
    this._hourly.set(value);
  }

  @Input({ required: true }) set currentTime(value: string) {
    this._currentTime.set(value);
  }

  protected readonly next24 = computed(() => {
    const hourly = this._hourly();
    return hourly ? getNext24Hours(hourly, this._currentTime()) : null;
  });
}
