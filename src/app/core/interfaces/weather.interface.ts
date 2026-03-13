// ── Domain models ────────────────────────────────────────────────────────────

export interface CurrentWeather {
  readonly temperature: number;
  readonly feelsLike: number;
  readonly humidity: number;
  readonly windSpeed: number;
  readonly windDirection: number;
  readonly weatherCode: number;
  readonly isDay: boolean;
  readonly time: string;
}

export interface HourlyForecast {
  readonly time: readonly string[];
  readonly temperature: readonly number[];
  readonly weatherCode: readonly number[];
}

export interface DailyForecast {
  readonly time: readonly string[];
  readonly temperatureMax: readonly number[];
  readonly temperatureMin: readonly number[];
  readonly weatherCode: readonly number[];
}

export interface WeatherData {
  readonly current: CurrentWeather;
  readonly hourly: HourlyForecast;
  readonly daily: DailyForecast;
  readonly timezone: string;
}

export interface WeatherState {
  readonly weather: WeatherData | null;
  readonly loading: boolean;
  readonly error: string | null;
}

// ── View model types ──────────────────────────────────────────────────────────

export interface HourlyItem {
  readonly time: string;
  readonly temperature: number;
  readonly weatherCode: number;
  readonly isCurrent: boolean;
}

export interface DailyItem {
  readonly date: string;
  readonly tempMax: number;
  readonly tempMin: number;
  readonly weatherCode: number;
}

// ── Open-Meteo API response types ────────────────────────────────────────────

export interface OpenMeteoCurrentResponse {
  readonly temperature_2m: number;
  readonly apparent_temperature: number;
  readonly relative_humidity_2m: number;
  readonly wind_speed_10m: number;
  readonly wind_direction_10m: number;
  readonly weather_code: number;
  readonly is_day: number;
  readonly time: string;
}

export interface OpenMeteoHourlyResponse {
  readonly time: readonly string[];
  readonly temperature_2m: readonly number[];
  readonly weather_code: readonly number[];
}

export interface OpenMeteoDailyResponse {
  readonly time: readonly string[];
  readonly temperature_2m_max: readonly number[];
  readonly temperature_2m_min: readonly number[];
  readonly weather_code: readonly number[];
}

export interface OpenMeteoWeatherResponse {
  readonly current: OpenMeteoCurrentResponse;
  readonly hourly: OpenMeteoHourlyResponse;
  readonly daily: OpenMeteoDailyResponse;
  readonly timezone: string;
}
