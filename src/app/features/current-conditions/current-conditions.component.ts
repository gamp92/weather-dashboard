import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CurrentWeather } from '../../core/interfaces/weather.interface';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { getWeatherIcon, getWeatherLabel } from '../../shared/utils/weather-code.util';
import { degreeToCompass } from '../../shared/utils/wind-direction.util';
import { formatDateInZone, formatTimeInZone } from '../../shared/utils/weather-forecast.util';
import { ClockService } from '../../core/services/clock.service';

@Component({
  selector: 'app-current-conditions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TemperaturePipe],
  templateUrl: './current-conditions.component.html',
  styleUrl: './current-conditions.component.scss',
})
export class CurrentConditionsComponent {
  @Input({ required: true }) weather!: CurrentWeather;
  @Input() locationName = 'Your Location';
  @Input() timezone = 'UTC';

  private readonly clock = inject(ClockService);

  protected icon(): string { return getWeatherIcon(this.weather.weatherCode, this.weather.isDay); }
  protected label(): string { return getWeatherLabel(this.weather.weatherCode); }
  protected windDirection(): string { return degreeToCompass(this.weather.windDirection); }
  protected localTime(): string { return formatTimeInZone(this.clock.tick(), this.timezone); }
  protected localDate(): string { return formatDateInZone(this.clock.tick(), this.timezone); }
}
