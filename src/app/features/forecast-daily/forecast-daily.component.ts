import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { DailyForecast, DailyItem } from '../../core/interfaces/weather.interface';
import { ForecastDayCardComponent } from './forecast-day-card/forecast-day-card.component';

const toDailyItems = (d: DailyForecast): DailyItem[] =>
  d.time.map((date, i) => ({
    date,
    tempMax: d.temperatureMax[i],
    tempMin: d.temperatureMin[i],
    weatherCode: d.weatherCode[i],
  }));

@Component({
  selector: 'app-forecast-daily',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForecastDayCardComponent],
  templateUrl: './forecast-daily.component.html',
  styleUrl: './forecast-daily.component.scss',
})
export class ForecastDailyComponent {
  private readonly _daily = signal<DailyForecast | null>(null);

  @Input({ required: true }) set daily(value: DailyForecast) {
    this._daily.set(value);
  }

  protected readonly items = computed((): DailyItem[] => {
    const daily = this._daily();
    return daily ? toDailyItems(daily) : [];
  });
}
