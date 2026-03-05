import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  OpenMeteoCurrentResponse,
  OpenMeteoDailyResponse,
  OpenMeteoHourlyResponse,
  OpenMeteoWeatherResponse,
  WeatherData,
  WeatherState,
} from '../interfaces/weather.interface';
import { GeolocationCoords, WeatherLocation } from '../interfaces/location.interface';
import { isValidCoords } from '../../shared/utils/coordinate-validator.util';
import { sanitizeError } from '../../shared/utils/error-sanitizer.util';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const DEFAULT_LOCATION: WeatherLocation = {
  name: 'London',
  latitude: 51.5074,
  longitude: -0.1278,
  country: 'United Kingdom',
  timezone: 'Europe/London',
};

const WEATHER_PARAMS =
  'current=temperature_2m,relative_humidity_2m,apparent_temperature,' +
  'wind_speed_10m,wind_direction_10m,weather_code' +
  '&hourly=temperature_2m,weather_code' +
  '&daily=temperature_2m_max,temperature_2m_min,weather_code' +
  '&forecast_days=7&timezone=auto';

const buildUrl = (lat: number, lon: number): string =>
  `${WEATHER_API}?latitude=${lat}&longitude=${lon}&${WEATHER_PARAMS}`;

const mapCurrent = (r: OpenMeteoCurrentResponse): CurrentWeather => ({
  temperature: r.temperature_2m,
  feelsLike: r.apparent_temperature,
  humidity: r.relative_humidity_2m,
  windSpeed: r.wind_speed_10m,
  windDirection: r.wind_direction_10m,
  weatherCode: r.weather_code,
  time: r.time,
});

const mapHourly = (r: OpenMeteoHourlyResponse): HourlyForecast => ({
  time: r.time,
  temperature: r.temperature_2m,
  weatherCode: r.weather_code,
});

const mapDaily = (r: OpenMeteoDailyResponse): DailyForecast => ({
  time: r.time,
  temperatureMax: r.temperature_2m_max,
  temperatureMin: r.temperature_2m_min,
  weatherCode: r.weather_code,
});

const mapResponse = (r: OpenMeteoWeatherResponse): WeatherData => ({
  current: mapCurrent(r.current),
  hourly: mapHourly(r.hourly),
  daily: mapDaily(r.daily),
  timezone: r.timezone,
});

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<WeatherState>({
    weather: null,
    loading: false,
    error: null,
  });

  readonly weather = computed(() => this.state().weather);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  loadWeather(location: WeatherLocation): void {
    this.fetchWeather(location.latitude, location.longitude);
  }

  loadWeatherByCoords(coords: GeolocationCoords): void {
    this.fetchWeather(coords.latitude, coords.longitude);
  }

  loadDefault(): void {
    this.loadWeather(DEFAULT_LOCATION);
  }

  private fetchWeather(lat: number, lon: number): void {
    if (!isValidCoords(lat, lon)) {
      this.state.update(s => ({ ...s, error: 'Invalid location coordinates.' }));
      return;
    }
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.http.get<OpenMeteoWeatherResponse>(buildUrl(lat, lon)).subscribe({
      next: r => this.state.set({ weather: mapResponse(r), loading: false, error: null }),
      error: (e: Error) => this.state.update(s => ({ ...s, loading: false, error: sanitizeError(e.message) })),
    });
  }
}
