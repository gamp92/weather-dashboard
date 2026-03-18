import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { TemperaturePipe } from '../../../shared/pipes/temperature.pipe';
import { getWeatherIcon } from '../../../shared/utils/weather-code.util';
import { formatDay } from '../../../shared/utils/weather-forecast.util';
import { TemperatureUnitService } from '../../../core/services/temperature-unit.service';

@Component({
  selector: 'app-forecast-day-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TemperaturePipe],
  templateUrl: './forecast-day-card.component.html',
  styleUrl: './forecast-day-card.component.scss',
})
export class ForecastDayCardComponent {
  @Input({ required: true }) date!: string;
  @Input({ required: true }) tempMax!: number;
  @Input({ required: true }) tempMin!: number;
  @Input({ required: true }) weatherCode!: number;

  protected readonly unit = inject(TemperatureUnitService).unit;

  protected dayLabel(): string {
    return formatDay(this.date);
  }

  protected icon(): string {
    return getWeatherIcon(this.weatherCode);
  }
}
