import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TemperaturePipe } from '../../../shared/pipes/temperature.pipe';
import { getWeatherIcon } from '../../../shared/utils/weather-code.util';
import { formatHour } from '../../../shared/utils/weather-forecast.util';

@Component({
  selector: 'app-forecast-hour-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TemperaturePipe],
  templateUrl: './forecast-hour-item.component.html',
  styleUrl: './forecast-hour-item.component.scss',
})
export class ForecastHourItemComponent {
  @Input({ required: true }) time!: string;
  @Input({ required: true }) temperature!: number;
  @Input({ required: true }) weatherCode!: number;
  @Input() isCurrent = false;

  protected hourLabel(): string {
    return formatHour(this.time);
  }

  protected icon(): string {
    return getWeatherIcon(this.weatherCode);
  }
}
