import {
  formatDay,
  formatHour,
  getNext24Hours,
} from '../src/app/shared/utils/weather-forecast.util';
import { HourlyForecast } from '../src/app/core/interfaces/weather.interface';

const buildHourly = (count: number, startHour = 0): HourlyForecast => ({
  time: Array.from({ length: count }, (_, i) => `2024-01-15T${String(startHour + i).padStart(2, '0')}:00`),
  temperature: Array.from({ length: count }, (_, i) => 10 + i),
  weatherCode: Array.from({ length: count }, () => 0),
});

describe('weather-forecast.util', () => {
  describe('getNext24Hours', () => {
    it('returns 24 entries starting from current hour', () => {
      const hourly = buildHourly(48, 0);
      const result = getNext24Hours(hourly, '2024-01-15T06:00');
      expect(result.time).toHaveLength(24);
      expect(result.time[0]).toBe('2024-01-15T06:00');
    });

    it('falls back to index 0 when current hour not found', () => {
      const hourly = buildHourly(24, 0);
      const result = getNext24Hours(hourly, '2024-01-20T12:00');
      expect(result.time[0]).toBe('2024-01-15T00:00');
    });

    it('slices temperature and weatherCode in sync', () => {
      const hourly = buildHourly(48, 0);
      const result = getNext24Hours(hourly, '2024-01-15T02:00');
      expect(result.temperature).toHaveLength(24);
      expect(result.weatherCode).toHaveLength(24);
      expect(result.temperature[0]).toBe(12);
    });
  });

  describe('formatHour', () => {
    it('returns a non-empty time string', () => {
      const result = formatHour('2024-01-15T14:00');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDay', () => {
    it('returns a non-empty day string', () => {
      const result = formatDay('2024-01-15');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
