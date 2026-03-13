import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { HourlyForecast, HourlyItem } from '../../core/interfaces/weather.interface';
import { ForecastHourItemComponent } from './forecast-hour-item/forecast-hour-item.component';
import { getNext24Hours } from '../../shared/utils/weather-forecast.util';

const toHourlyItems = (h: HourlyForecast): HourlyItem[] =>
  h.time.map((time, i) => ({
    time,
    temperature: h.temperature[i],
    weatherCode: h.weatherCode[i],
    isCurrent: i === 0,
  }));

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

  protected readonly items = computed((): HourlyItem[] => {
    const hourly = this._hourly();
    const next24 = hourly ? getNext24Hours(hourly, this._currentTime()) : null;
    return next24 ? toHourlyItems(next24) : [];
  });
}
