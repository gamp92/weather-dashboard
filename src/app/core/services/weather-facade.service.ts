import { Injectable, computed, inject } from '@angular/core';
import { take } from 'rxjs/operators';
import { WeatherService } from './weather.service';
import { GeolocationService } from './geolocation.service';
import { LocationSearchService } from './location-search.service';
import { WeatherLocation } from '../interfaces/location.interface';
import { getWeatherTheme } from '../../shared/utils/weather-code.util';
import { timezoneToCity } from '../../shared/utils/weather-forecast.util';

@Injectable({ providedIn: 'root' })
export class WeatherFacadeService {
  private readonly weatherService = inject(WeatherService);
  private readonly geoService = inject(GeolocationService);
  private readonly locationService = inject(LocationSearchService);

  readonly weather = this.weatherService.weather;
  readonly loading = this.weatherService.loading;
  readonly error = this.weatherService.error;
  readonly location = this.locationService.location;
  readonly searchResults = this.locationService.searchResults;
  readonly searchLoading = this.locationService.searchLoading;
  readonly theme = computed(() =>
    getWeatherTheme(this.weather()?.current.weatherCode ?? 0, this.weather()?.current.isDay ?? true)
  );
  readonly locationName = computed(() =>
    this.location()?.name ?? timezoneToCity(this.weather()?.timezone ?? '')
  );

  initGeolocation(): void {
    this.geoService
      .getCurrentCoords()
      .pipe(take(1))
      .subscribe({
        next: coords => { this.weatherService.loadWeatherByCoords(coords); },
        error: () => { this.weatherService.loadDefault(); },
      });
  }

  selectLocation(location: WeatherLocation): void {
    this.locationService.selectLocation(location);
    this.weatherService.loadWeather(location);
  }

  searchLocations(query: string): void {
    this.locationService.search(query);
  }

  clearSearch(): void {
    this.locationService.clearResults();
  }
}
