import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CurrentWeather } from '../../core/interfaces/weather.interface';
import { WeatherLocation } from '../../core/interfaces/location.interface';
import { TemperaturePipe } from '../../shared/pipes/temperature.pipe';
import { getWeatherIcon, getWeatherLabel } from '../../shared/utils/weather-code.util';
import { degreeToCompass } from '../../shared/utils/wind-direction.util';

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
  @Input() location: WeatherLocation | null = null;

  protected icon(): string {
    return getWeatherIcon(this.weather.weatherCode);
  }

  protected label(): string {
    return getWeatherLabel(this.weather.weatherCode);
  }

  protected windDirection(): string {
    return degreeToCompass(this.weather.windDirection);
  }

  protected locationName(): string {
    return this.location?.name ?? 'Your Location';
  }
}
