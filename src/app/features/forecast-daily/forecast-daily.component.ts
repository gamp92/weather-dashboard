import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DailyForecast } from '../../core/interfaces/weather.interface';
import { ForecastDayCardComponent } from './forecast-day-card/forecast-day-card.component';

@Component({
  selector: 'app-forecast-daily',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForecastDayCardComponent],
  templateUrl: './forecast-daily.component.html',
  styleUrl: './forecast-daily.component.scss',
})
export class ForecastDailyComponent {
  @Input({ required: true }) daily!: DailyForecast;
}
