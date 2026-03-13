import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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
  'wind_speed_10m,wind_direction_10m,weather_code,is_day' +
  '&hourly=temperature_2m,weather_code' +
  '&daily=temperature_2m_max,temperature_2m_min,weather_code' +
  '&forecast_days=7&timezone=auto';

const buildUrl = (lat: number, lon: number): string =>
  `${WEATHER_API}?latitude=${String(lat)}&longitude=${String(lon)}&${WEATHER_PARAMS}`;

const mapCurrent = (r: OpenMeteoCurrentResponse): CurrentWeather => ({
  temperature: r.temperature_2m,
  feelsLike: r.apparent_temperature,
  humidity: r.relative_humidity_2m,
  windSpeed: r.wind_speed_10m,
  windDirection: r.wind_direction_10m,
  weatherCode: r.weather_code,
  isDay: r.is_day === 1,
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
  private readonly fetchTrigger = new Subject<{ lat: number; lon: number }>();
  private readonly state = signal<WeatherState>({
    weather: null,
    loading: false,
    error: null,
  });

  readonly weather = computed(() => this.state().weather);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  constructor() {
    this.fetchTrigger.pipe(
      switchMap(({ lat, lon }) => this.fetchHttp(lat, lon)),
      takeUntilDestroyed(),
    ).subscribe(r => { this.onWeatherSuccess(r); });
  }

  loadWeather(location: WeatherLocation): void {
    this.fetchWeather(location.latitude, location.longitude);
  }

  loadWeatherByCoords(coords: GeolocationCoords): void {
    this.fetchWeather(coords.latitude, coords.longitude);
  }

  loadDefault(): void {
    this.loadWeather(DEFAULT_LOCATION);
  }

  private fetchHttp(lat: number, lon: number): Observable<OpenMeteoWeatherResponse> {
    return this.http.get<OpenMeteoWeatherResponse>(buildUrl(lat, lon)).pipe(
      catchError((e: Error) => { this.onWeatherError(e); return EMPTY; }),
    );
  }

  private onWeatherSuccess(r: OpenMeteoWeatherResponse): void {
    this.state.set({ weather: mapResponse(r), loading: false, error: null });
  }

  private onWeatherError(e: Error): void {
    this.state.update(s => ({ ...s, loading: false, error: sanitizeError(e.message) }));
  }

  private startFetch(lat: number, lon: number): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.fetchTrigger.next({ lat, lon });
  }

  private fetchWeather(lat: number, lon: number): void {
    if (!isValidCoords(lat, lon)) {
      this.state.update(s => ({ ...s, error: 'Invalid location coordinates.' }));
      return;
    }
    this.startFetch(lat, lon);
  }
}
