import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WeatherService } from '../src/app/core/services/weather.service';
import { OpenMeteoWeatherResponse } from '../src/app/core/interfaces/weather.interface';

const buildMockResponse = (is_day: number): OpenMeteoWeatherResponse => ({
  current: {
    temperature_2m: 15,
    apparent_temperature: 13,
    relative_humidity_2m: 70,
    wind_speed_10m: 20,
    wind_direction_10m: 180,
    weather_code: 1,
    is_day,
    time: '2024-01-15T12:00',
  },
  hourly: {
    time: ['2024-01-15T12:00', '2024-01-15T13:00'],
    temperature_2m: [15, 16],
    weather_code: [1, 1],
  },
  daily: {
    time: ['2024-01-15'],
    temperature_2m_max: [18],
    temperature_2m_min: [10],
    weather_code: [1],
  },
  timezone: 'Europe/London',
});

const LONDON = { name: 'London', latitude: 51.5, longitude: -0.1, country: 'UK', timezone: 'Europe/London' };
const flush = (httpMock: HttpTestingController, body: OpenMeteoWeatherResponse): void => {
  httpMock.expectOne(req => req.url.includes('open-meteo.com')).flush(body);
};

describe('WeatherService', () => {
  let service: WeatherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WeatherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should start with null weather and no loading', () => {
    expect(service.weather()).toBeNull();
    expect(service.loading()).toBe(false);
  });

  it('sets loading true when fetching', () => {
    service.loadWeather(LONDON);
    expect(service.loading()).toBe(true);
    flush(httpMock, buildMockResponse(1));
  });

  it('maps api response to WeatherData correctly', () => {
    service.loadWeather(LONDON);
    flush(httpMock, buildMockResponse(1));

    const weather = service.weather();
    expect(weather?.current.temperature).toBe(15);
    expect(weather?.current.feelsLike).toBe(13);
    expect(weather?.current.humidity).toBe(70);
    expect(weather?.timezone).toBe('Europe/London');
  });

  // Regression: is_day field was not requested from the API and not mapped.
  // This caused nighttime locations to show daytime icons and themes.
  it('maps is_day 1 to isDay true (daytime)', () => {
    service.loadWeather(LONDON);
    flush(httpMock, buildMockResponse(1));
    expect(service.weather()?.current.isDay).toBe(true);
  });

  it('maps is_day 0 to isDay false (nighttime)', () => {
    service.loadWeather(LONDON);
    flush(httpMock, buildMockResponse(0));
    expect(service.weather()?.current.isDay).toBe(false);
  });

  it('includes is_day in the API request parameters', () => {
    service.loadWeather(LONDON);
    const req = httpMock.expectOne(r => r.url.includes('open-meteo.com'));
    expect(req.request.urlWithParams).toContain('is_day');
    req.flush(buildMockResponse(1));
  });

  it('sets error on request failure', () => {
    service.loadWeather(LONDON);
    httpMock.expectOne(req => req.url.includes('open-meteo.com')).error(new ErrorEvent('network error'));
    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBe(false);
  });

  it('rejects invalid coordinates without making an HTTP call', () => {
    service.loadWeather({ ...LONDON, latitude: 999, longitude: 999 });
    httpMock.expectNone(() => true);
    expect(service.error()).toBeTruthy();
  });
});
