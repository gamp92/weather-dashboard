import { Injectable, computed, effect, inject, untracked } from '@angular/core';
import { take } from 'rxjs/operators';
import { WeatherService } from './weather.service';
import { GeolocationService } from './geolocation.service';
import { LocationSearchService } from './location-search.service';
import { TemperatureUnitService } from './temperature-unit.service';
import { AiInsightService } from './ai-insight.service';
import { GeolocationCoords, WeatherLocation } from '../interfaces/location.interface';
import { getWeatherTheme } from '../../shared/utils/weather-code.util';
import { timezoneToCity } from '../../shared/utils/weather-forecast.util';

@Injectable({ providedIn: 'root' })
export class WeatherFacadeService {
  private readonly weatherService = inject(WeatherService);
  private readonly geoService = inject(GeolocationService);
  private readonly locationService = inject(LocationSearchService);
  private readonly unitService = inject(TemperatureUnitService);
  private readonly aiService = inject(AiInsightService);

  readonly weather = this.weatherService.weather;
  readonly unit = this.unitService.unit;
  readonly loading = this.weatherService.loading;
  readonly error = this.weatherService.error;
  readonly location = this.locationService.location;
  readonly searchResults = this.locationService.searchResults;
  readonly searchLoading = this.locationService.searchLoading;
  readonly aiInsight = this.aiService.insight;
  readonly aiLoading = this.aiService.loading;
  readonly aiError = this.aiService.error;
  readonly theme = computed(() =>
    getWeatherTheme(this.weather()?.current.weatherCode ?? 0, this.weather()?.current.isDay ?? true)
  );
  readonly locationName = computed(() =>
    this.location()?.name ?? timezoneToCity(this.weather()?.timezone ?? '')
  );

  constructor() {
    effect(() => { this.onWeatherLoaded(); });
  }

  private onWeatherLoaded(): void {
    const weather = this.weather();
    if (!weather) return;
    const name = untracked(() => this.locationName());
    this.aiService.generate(name, weather);
  }

  initGeolocation(): void {
    this.geoService
      .getCurrentCoords()
      .pipe(take(1))
      .subscribe({
        next: coords => { this.onGeoSuccess(coords); },
        error: () => { this.weatherService.loadDefault(); },
      });
  }

  private onGeoSuccess(coords: GeolocationCoords): void {
    this.weatherService.loadWeatherByCoords(coords);
    this.locationService.setLocationFromCoords(coords);
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

  toggleUnit(): void {
    this.unitService.toggle();
  }
}
