import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { WeatherFacadeService } from '../../core/services/weather-facade.service';
import { WeatherLocation } from '../../core/interfaces/location.interface';
import { LocationSearchComponent } from '../location-search/location-search.component';
import { CurrentConditionsComponent } from '../current-conditions/current-conditions.component';
import { ForecastHourlyComponent } from '../forecast-hourly/forecast-hourly.component';
import { ForecastDailyComponent } from '../forecast-daily/forecast-daily.component';
import { WeatherInsightComponent } from '../weather-insight/weather-insight.component';
import { WeatherNewsComponent } from '../weather-news/weather-news.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LocationSearchComponent,
    CurrentConditionsComponent,
    WeatherInsightComponent,
    ForecastHourlyComponent,
    ForecastDailyComponent,
    WeatherNewsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  protected readonly facade = inject(WeatherFacadeService);

  ngOnInit(): void {
    this.facade.initGeolocation();
  }

  protected onLocationSelected(location: WeatherLocation): void {
    this.facade.selectLocation(location);
  }

  protected onSearch(query: string): void {
    this.facade.searchLocations(query);
  }

  protected onSearchClear(): void {
    this.facade.clearSearch();
  }

  protected onToggleUnit(): void {
    this.facade.toggleUnit();
  }
}
